export declare enum TransactionStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REVERSED = "REVERSED"
}
export declare enum TransactionType {
    DOMESTIC = "DOMESTIC",
    INTERNATIONAL = "INTERNATIONAL",
    PAYROLL = "PAYROLL",
    FEE = "FEE"
}
export declare class Transaction {
    id: string;
    senderWalletId: string;
    receiverWalletId: string;
    amount: string;
    currency: string;
    type: TransactionType;
    status: TransactionStatus;
    fxQuoteId: string;
    fxRate: string;
    idempotencyKey: string;
    feeAmount: string;
    description: string;
    failureReason: string;
    debitCompletedAt: Date;
    creditCompletedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
