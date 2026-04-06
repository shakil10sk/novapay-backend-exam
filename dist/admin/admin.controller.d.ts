import { LedgerService } from '../ledger/ledger.service';
import { TransactionService } from '../transaction/transaction.service';
import { AccountService } from '../account/account.service';
export declare class AdminController {
    private readonly ledgerService;
    private readonly transactionService;
    private readonly accountService;
    private readonly logger;
    constructor(ledgerService: LedgerService, transactionService: TransactionService, accountService: AccountService);
    checkLedgerHealth(): Promise<{
        balanced: boolean;
        totalDebits: number;
        totalCredits: number;
        delta: number;
    }>;
    triggerRecovery(): Promise<void>;
    listSysWallets(): Promise<import("../account/entities/wallet.entity").Wallet[]>;
    verifyWalletAudit(id: string): Promise<{
        valid: boolean;
        tamperedEntryId?: string;
        message: string;
    }>;
}
