import {
    Injectable,
    ServiceUnavailableException,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FxQuote, QuoteStatus } from './entities/fx-quote.entity';
import { CreateFxQuoteDto } from './dto/create-fx-quote.dto';
import { MetricsService } from '../metrics/metrics.service';

/**
 * Mock FX rate table.
 * In production, this would call an external FX provider (e.g., Open Exchange Rates API).
 * The FX_PROVIDER_STATUS env flag simulates provider outage for testing.
 */
const MOCK_RATES: Record<string, Record<string, number>> = {
    USD: { EUR: 0.92, GBP: 0.79, BDT: 110.50, NGN: 1580.0, USD: 1.0 },
    EUR: { USD: 1.087, GBP: 0.859, BDT: 120.1, NGN: 1718.0, EUR: 1.0 },
    GBP: { USD: 1.267, EUR: 1.164, BDT: 139.8, NGN: 2000.0, GBP: 1.0 },
    BDT: { USD: 0.00905, EUR: 0.00833, GBP: 0.00715, NGN: 14.3, BDT: 1.0 },
    NGN: { USD: 0.000633, EUR: 0.000582, GBP: 0.0005, BDT: 0.0699, NGN: 1.0 },
};

const QUOTE_TTL_SECONDS = 60;

@Injectable()
export class FxService {
    private readonly logger = new Logger(FxService.name);

    constructor(
        @InjectRepository(FxQuote, 'fxConnection')
        private readonly quoteRepo: Repository<FxQuote>,
        private readonly metricsService: MetricsService,
    ) { }

    /**
     * Fetches live rate from provider. Throws if provider is down.
     * NEVER silently applies a cached rate.
     */
    private fetchLiveRate(base: string, quote: string): number {
        const providerStatus = process.env.FX_PROVIDER_STATUS || 'up';
        if (providerStatus === 'down') {
            this.metricsService.fxProviderFailures.inc();
            this.logger.error('FX provider is unavailable. Refusing to issue quote.');
            throw new ServiceUnavailableException(
                'FX provider is currently unavailable. Please retry later. We do not apply stale rates.',
            );
        }

        const rate = MOCK_RATES[base]?.[quote];
        if (!rate) {
            throw new BadRequestException(`Unsupported currency pair: ${base}/${quote}`);
        }
        return rate;
    }

    /**
     * Issues a locked FX rate quote with a 60-second TTL.
     * If the FX provider is unavailable, throws immediately — never returns stale data.
     */
    async createQuote(dto: CreateFxQuoteDto): Promise<FxQuote> {
        const rate = this.fetchLiveRate(dto.baseCurrency, dto.quoteCurrency);
        const amountQuote = Number(dto.amount) * rate;

        const expiresAt = new Date(Date.now() + QUOTE_TTL_SECONDS * 1000);

        const quote = this.quoteRepo.create({
            baseCurrency: dto.baseCurrency,
            quoteCurrency: dto.quoteCurrency,
            rate: String(rate),
            amountBase: String(dto.amount),
            amountQuote: String(amountQuote.toFixed(6)),
            requestedByUserId: dto.userId,
            status: QuoteStatus.ACTIVE,
            expiresAt,
        });

        const saved = await this.quoteRepo.save(quote);
        this.logger.log(
            `FX quote issued: id=${saved.id} ${dto.baseCurrency}/${dto.quoteCurrency} rate=${rate} expiresAt=${expiresAt.toISOString()}`,
        );
        return saved;
    }

    /**
     * Returns quote with time remaining. Status is COMPUTED, not stale from DB.
     */
    async getQuote(quoteId: string): Promise<FxQuote & { secondsRemaining: number }> {
        const quote = await this.quoteRepo.findOne({ where: { id: quoteId } });
        if (!quote) throw new NotFoundException(`FX quote not found: ${quoteId}`);

        const now = Date.now();
        const expiresMs = new Date(quote.expiresAt).getTime();
        const secondsRemaining = Math.max(0, Math.floor((expiresMs - now) / 1000));

        // Update status to EXPIRED if TTL has passed
        if (secondsRemaining === 0 && quote.status === QuoteStatus.ACTIVE) {
            quote.status = QuoteStatus.EXPIRED;
            await this.quoteRepo.save(quote);
        }

        return { ...quote, secondsRemaining };
    }

    /**
     * Consumes a quote for a transfer. Enforces:
     * 1. Quote must exist
     * 2. Quote must not be expired
     * 3. Quote must not have been used already (single-use)
     * Returns the locked rate upon success.
     */
    async consumeQuote(quoteId: string, transactionId: string): Promise<FxQuote> {
        const quote = await this.quoteRepo.findOne({ where: { id: quoteId } });
        if (!quote) throw new NotFoundException(`FX quote not found: ${quoteId}`);

        if (quote.status === QuoteStatus.USED) {
            throw new BadRequestException(
                `FX quote ${quoteId} has already been used by transaction ${quote.usedByTransactionId}. Each quote is single-use only.`,
            );
        }

        if (quote.status === QuoteStatus.EXPIRED || new Date() > new Date(quote.expiresAt)) {
            quote.status = QuoteStatus.EXPIRED;
            await this.quoteRepo.save(quote);
            throw new BadRequestException(
                `FX quote ${quoteId} has expired. Please request a new quote. This prevents you from being charged at stale rates.`,
            );
        }

        // Mark as consumed
        quote.status = QuoteStatus.USED;
        quote.usedAt = new Date();
        quote.usedByTransactionId = transactionId;
        await this.quoteRepo.save(quote);

        this.logger.log(`FX quote consumed: id=${quoteId} by txn=${transactionId} rate=${quote.rate}`);
        return quote;
    }
}
