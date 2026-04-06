export declare function hashPayload(payload: Record<string, any>): string;
export declare function hashLedgerEntry(data: {
    previousHash: string;
    entryId: string;
    amount: string;
    type: string;
    walletId: string;
    transactionId: string;
    createdAt: string;
}): string;
