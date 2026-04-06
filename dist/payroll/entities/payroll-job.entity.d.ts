export declare enum PayrollJobStatus {
    QUEUED = "QUEUED",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare class PayrollJob {
    id: string;
    employerWalletId: string;
    totalEmployees: number;
    processedEmployees: number;
    totalAmount: string;
    currency: string;
    status: PayrollJobStatus;
    jobId: string;
    createdAt: Date;
    updatedAt: Date;
}
