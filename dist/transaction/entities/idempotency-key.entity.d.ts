export declare enum IdempotencyStatus {
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare class IdempotencyKey {
    id: string;
    key: string;
    payloadHash: string;
    status: IdempotencyStatus;
    transactionId: string;
    responseBody: string;
    expiresAt: Date;
    createdAt: Date;
}
