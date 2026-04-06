import { PayrollService } from './payroll.service';
import { BulkPayrollDto } from './dto/bulk-payroll.dto';
export declare class PayrollController {
    private readonly payrollService;
    constructor(payrollService: PayrollService);
    createBulkJob(dto: BulkPayrollDto): Promise<import("./entities/payroll-job.entity").PayrollJob>;
    getJobStatus(id: string): Promise<import("./entities/payroll-job.entity").PayrollJob>;
    listJobs(): Promise<import("./entities/payroll-job.entity").PayrollJob[]>;
}
