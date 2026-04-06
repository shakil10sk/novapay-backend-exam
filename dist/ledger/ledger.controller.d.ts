import { LedgerService } from './ledger.service';
import { PostDoubleEntryDto } from './dto/post-entry.dto';
export declare class LedgerController {
    private readonly ledgerService;
    constructor(ledgerService: LedgerService);
    postDoubleEntry(dto: PostDoubleEntryDto): Promise<import("./entities/ledger-entry.entity").LedgerEntry[]>;
    getBalance(walletId: string): Promise<{
        walletId: string;
        balance: number;
        currency: string;
    }>;
    getHistory(walletId: string, page?: number, limit?: number): Promise<{
        entries: import("./entities/ledger-entry.entity").LedgerEntry[];
        total: number;
        page: number;
    }>;
    verifyAuditChain(walletId: string): Promise<{
        valid: boolean;
        tamperedEntryId?: string;
        message: string;
    }>;
    checkGlobalInvariant(): Promise<{
        balanced: boolean;
        totalDebits: number;
        totalCredits: number;
        delta: number;
    }>;
    getByTransaction(transactionId: string): Promise<import("./entities/ledger-entry.entity").LedgerEntry[]>;
}
