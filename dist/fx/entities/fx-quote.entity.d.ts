export declare enum QuoteStatus {
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    USED = "USED"
}
export declare class FxQuote {
    id: string;
    baseCurrency: string;
    quoteCurrency: string;
    rate: string;
    amountBase: string;
    amountQuote: string;
    requestedByUserId: string;
    status: QuoteStatus;
    expiresAt: Date;
    usedAt: Date;
    usedByTransactionId: string;
    createdAt: Date;
}
