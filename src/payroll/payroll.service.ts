import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PayrollJob, PayrollJobStatus } from './entities/payroll-job.entity';
import { BulkPayrollDto } from './dto/bulk-payroll.dto';
import { MetricsService } from '../metrics/metrics.service';
import { AccountService } from '../account/account.service';

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(
    @InjectRepository(PayrollJob, 'payrollConnection')
    private readonly jobRepo: Repository<PayrollJob>,
    @InjectQueue('payrollQueue') private readonly payrollQueue: Queue,
    private readonly metricsService: MetricsService,
    private readonly accountService: AccountService,
  ) {}

  /**
   * Accepts and persists a bulk payroll request. Immediately triggers the BullMQ queue.
   */
  async createBulkJob(dto: BulkPayrollDto): Promise<PayrollJob> {
    const employer = await this.accountService.getWalletById(
      dto.employerWalletId,
    );

    // Check if a job with this batchId + employerId is already in progress
    const existing = await this.jobRepo.findOne({
      where: { employerWalletId: dto.employerWalletId, jobId: dto.batchId },
    });
    if (existing) {
      throw new ConflictException(
        `Payroll batch ${dto.batchId} for employer ${dto.employerWalletId} already exists.`,
      );
    }

    const totalAmount = dto.disbursements.reduce(
      (sum, d) => sum + Number(d.salary),
      0,
    );

    const job = this.jobRepo.create({
      id: dto.batchId, // Using batchId as internal resource ID
      employerWalletId: dto.employerWalletId,
      totalEmployees: dto.disbursements.length,
      processedEmployees: 0,
      totalAmount: String(totalAmount),
      currency: employer.currency,
      status: PayrollJobStatus.QUEUED,
      jobId: dto.batchId,
    });

    const savedJob = await this.jobRepo.save(job);

    await this.payrollQueue.add(
      'process_bulk_payroll',
      { dto, jobId: savedJob.id },
      {
        jobId: dto.batchId, // BullMQ ID
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
      },
    );

    this.metricsService.payrollJobsQueued.inc();
    this.logger.log(
      `Bulk payroll job queued: id=${dto.batchId} employees=${dto.disbursements.length}`,
    );
    return savedJob;
  }

  async getJobStatus(jobId: string): Promise<PayrollJob> {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException(`Payroll job not found: ${jobId}`);
    return job;
  }

  async listJobs(): Promise<PayrollJob[]> {
    return this.jobRepo.find({ order: { createdAt: 'DESC' }, take: 100 });
  }
}
