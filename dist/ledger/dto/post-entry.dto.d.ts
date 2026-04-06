import { EntryType } from '../entities/ledger-entry.entity';
export declare class LedgerEntryDto {
    walletId: string;
    type: EntryType;
    amount: number;
    currency: string;
    accountName?: string;
    description?: string;
    fxRate?: number;
}
export declare class PostDoubleEntryDto {
    transactionId: string;
    debit: LedgerEntryDto;
    credit: LedgerEntryDto;
}
