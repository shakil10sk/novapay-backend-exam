"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var FxService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FxService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fx_quote_entity_1 = require("./entities/fx-quote.entity");
const metrics_service_1 = require("../metrics/metrics.service");
const MOCK_RATES = {
    USD: { EUR: 0.92, GBP: 0.79, BDT: 110.50, NGN: 1580.0, USD: 1.0 },
    EUR: { USD: 1.087, GBP: 0.859, BDT: 120.1, NGN: 1718.0, EUR: 1.0 },
    GBP: { USD: 1.267, EUR: 1.164, BDT: 139.8, NGN: 2000.0, GBP: 1.0 },
    BDT: { USD: 0.00905, EUR: 0.00833, GBP: 0.00715, NGN: 14.3, BDT: 1.0 },
    NGN: { USD: 0.000633, EUR: 0.000582, GBP: 0.0005, BDT: 0.0699, NGN: 1.0 },
};
const QUOTE_TTL_SECONDS = 60;
let FxService = FxService_1 = class FxService {
    constructor(quoteRepo, metricsService) {
        this.quoteRepo = quoteRepo;
        this.metricsService = metricsService;
        this.logger = new common_1.Logger(FxService_1.name);
    }
    fetchLiveRate(base, quote) {
        const providerStatus = process.env.FX_PROVIDER_STATUS || 'up';
        if (providerStatus === 'down') {
            this.metricsService.fxProviderFailures.inc();
            this.logger.error('FX provider is unavailable. Refusing to issue quote.');
            throw new common_1.ServiceUnavailableException('FX provider is currently unavailable. Please retry later. We do not apply stale rates.');
        }
        const rate = MOCK_RATES[base]?.[quote];
        if (!rate) {
            throw new common_1.BadRequestException(`Unsupported currency pair: ${base}/${quote}`);
        }
        return rate;
    }
    async createQuote(dto) {
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
            status: fx_quote_entity_1.QuoteStatus.ACTIVE,
            expiresAt,
        });
        const saved = await this.quoteRepo.save(quote);
        this.logger.log(`FX quote issued: id=${saved.id} ${dto.baseCurrency}/${dto.quoteCurrency} rate=${rate} expiresAt=${expiresAt.toISOString()}`);
        return saved;
    }
    async getQuote(quoteId) {
        const quote = await this.quoteRepo.findOne({ where: { id: quoteId } });
        if (!quote)
            throw new common_1.NotFoundException(`FX quote not found: ${quoteId}`);
        const now = Date.now();
        const expiresMs = new Date(quote.expiresAt).getTime();
        const secondsRemaining = Math.max(0, Math.floor((expiresMs - now) / 1000));
        if (secondsRemaining === 0 && quote.status === fx_quote_entity_1.QuoteStatus.ACTIVE) {
            quote.status = fx_quote_entity_1.QuoteStatus.EXPIRED;
            await this.quoteRepo.save(quote);
        }
        return { ...quote, secondsRemaining };
    }
    async consumeQuote(quoteId, transactionId) {
        const quote = await this.quoteRepo.findOne({ where: { id: quoteId } });
        if (!quote)
            throw new common_1.NotFoundException(`FX quote not found: ${quoteId}`);
        if (quote.status === fx_quote_entity_1.QuoteStatus.USED) {
            throw new common_1.BadRequestException(`FX quote ${quoteId} has already been used by transaction ${quote.usedByTransactionId}. Each quote is single-use only.`);
        }
        if (quote.status === fx_quote_entity_1.QuoteStatus.EXPIRED || new Date() > new Date(quote.expiresAt)) {
            quote.status = fx_quote_entity_1.QuoteStatus.EXPIRED;
            await this.quoteRepo.save(quote);
            throw new common_1.BadRequestException(`FX quote ${quoteId} has expired. Please request a new quote. This prevents you from being charged at stale rates.`);
        }
        quote.status = fx_quote_entity_1.QuoteStatus.USED;
        quote.usedAt = new Date();
        quote.usedByTransactionId = transactionId;
        await this.quoteRepo.save(quote);
        this.logger.log(`FX quote consumed: id=${quoteId} by txn=${transactionId} rate=${quote.rate}`);
        return quote;
    }
};
exports.FxService = FxService;
exports.FxService = FxService = FxService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(fx_quote_entity_1.FxQuote, 'fxConnection')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        metrics_service_1.MetricsService])
], FxService);
//# sourceMappingURL=fx.service.js.map