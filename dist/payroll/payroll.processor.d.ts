import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { PayrollJob } from './entities/payroll-job.entity';
import { TransactionService } from '../transaction/transaction.service';
import { BulkPayrollDto } from './dto/bulk-payroll.dto';
import { MetricsService } from '../metrics/metrics.service';
export declare class PayrollProcessor extends WorkerHost {
    private readonly jobRepo;
    private readonly transactionService;
    private readonly metricsService;
    private readonly logger;
    constructor(jobRepo: Repository<PayrollJob>, transactionService: TransactionService, metricsService: MetricsService);
    process(job: Job<{
        dto: BulkPayrollDto;
        jobId: string;
    }>): Promise<any>;
    onFailed(job: Job, error: Error): void;
}
