import { Repository } from 'typeorm';
import { FxQuote } from './entities/fx-quote.entity';
import { CreateFxQuoteDto } from './dto/create-fx-quote.dto';
import { MetricsService } from '../metrics/metrics.service';
export declare class FxService {
    private readonly quoteRepo;
    private readonly metricsService;
    private readonly logger;
    constructor(quoteRepo: Repository<FxQuote>, metricsService: MetricsService);
    private fetchLiveRate;
    createQuote(dto: CreateFxQuoteDto): Promise<FxQuote>;
    getQuote(quoteId: string): Promise<FxQuote & {
        secondsRemaining: number;
    }>;
    consumeQuote(quoteId: string, transactionId: string): Promise<FxQuote>;
}
