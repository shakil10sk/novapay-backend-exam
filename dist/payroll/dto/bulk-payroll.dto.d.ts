export declare class PayrollDisbursementEntry {
    employeeWalletId: string;
    salary: number;
    employeeReference: string;
}
export declare class BulkPayrollDto {
    employerWalletId: string;
    batchId: string;
    disbursements: PayrollDisbursementEntry[];
}
