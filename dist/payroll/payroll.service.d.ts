import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { PayrollJob } from './entities/payroll-job.entity';
import { BulkPayrollDto } from './dto/bulk-payroll.dto';
import { MetricsService } from '../metrics/metrics.service';
import { AccountService } from '../account/account.service';
export declare class PayrollService {
    private readonly jobRepo;
    private readonly payrollQueue;
    private readonly metricsService;
    private readonly accountService;
    private readonly logger;
    constructor(jobRepo: Repository<PayrollJob>, payrollQueue: Queue, metricsService: MetricsService, accountService: AccountService);
    createBulkJob(dto: BulkPayrollDto): Promise<PayrollJob>;
    getJobStatus(jobId: string): Promise<PayrollJob>;
    listJobs(): Promise<PayrollJob[]>;
}
