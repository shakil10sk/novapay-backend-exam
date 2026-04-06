export declare enum EntryType {
    DEBIT = "DEBIT",
    CREDIT = "CREDIT"
}
export declare class LedgerEntry {
    id: string;
    transactionId: string;
    walletId: string;
    type: EntryType;
    amount: string;
    currency: string;
    accountName: string;
    description: string;
    fxRate: string;
    auditHash: string;
    previousHash: string;
    createdAt: Date;
}
