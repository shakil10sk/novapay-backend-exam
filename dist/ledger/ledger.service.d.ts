import { DataSource, Repository } from 'typeorm';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { PostDoubleEntryDto } from './dto/post-entry.dto';
import { MetricsService } from '../metrics/metrics.service';
export declare class LedgerService {
    private readonly ledgerRepo;
    private readonly dataSource;
    private readonly metricsService;
    private readonly logger;
    constructor(ledgerRepo: Repository<LedgerEntry>, dataSource: DataSource, metricsService: MetricsService);
    postDoubleEntry(dto: PostDoubleEntryDto): Promise<LedgerEntry[]>;
    getBalance(walletId: string): Promise<{
        walletId: string;
        balance: number;
        currency: string;
    }>;
    getTransactionHistory(walletId: string, page?: number, limit?: number): Promise<{
        entries: LedgerEntry[];
        total: number;
        page: number;
    }>;
    verifyAuditChain(walletId: string): Promise<{
        valid: boolean;
        tamperedEntryId?: string;
        message: string;
    }>;
    getEntriesByTransaction(transactionId: string): Promise<LedgerEntry[]>;
    checkGlobalInvariant(): Promise<{
        balanced: boolean;
        totalDebits: number;
        totalCredits: number;
        delta: number;
    }>;
}
