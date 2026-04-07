import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PayrollJob, PayrollJobStatus } from './entities/payroll-job.entity';
import { TransactionService } from '../transaction/transaction.service';
import { BulkPayrollDto } from './dto/bulk-payroll.dto';
import { MetricsService } from '../metrics/metrics.service';

@Processor('payrollQueue', {
  concurrency: 1, // Concurrency 1 guarantees serial processing for a queue.
  // In a multi-tenant scale, we'd use BullMQ's grouping/parent-child features
  // to ensure concurrency of 1 per employer wallet ID.
})
export class PayrollProcessor extends WorkerHost {
  private readonly logger = new Logger(PayrollProcessor.name);

  constructor(
    @InjectRepository(PayrollJob, 'payrollConnection')
    private readonly jobRepo: Repository<PayrollJob>,
    private readonly transactionService: TransactionService,
    private readonly metricsService: MetricsService,
  ) {
    super();
  }

  /**
   * Serial execution of all disbursements within a batch.
   * If the consumer crashes, BullMQ will requeue this job and the loop starts again.
   * Because of idempotency keys per-employee, already-paid employees are skipped
   * by the Transaction Service (Scenario A/B).
   */
  async process(
    job: Job<{ dto: BulkPayrollDto; jobId: string }>,
  ): Promise<any> {
    const { dto, jobId } = job.data;
    const dbJob = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!dbJob) return;

    this.logger.log(
      `Processing Payroll Job: id=${jobId} total=${dbJob.totalEmployees}`,
    );
    dbJob.status = PayrollJobStatus.PROCESSING;
    await this.jobRepo.save(dbJob);

    let processedCount = 0;

    for (const d of dto.disbursements) {
      try {
        /**
         * RESUMABILITY PATTERN: Each disbursement has a deterministic idempotency key.
         * If this job is retried by BullMQ after a crash, the transaction service
         * will use the cached completion state for already-processed employees.
         */
        const idempotencyKey = `payroll-${dto.batchId}-${d.employeeReference}`;

        await this.transactionService.executeTransfer({
          senderWalletId: dto.employerWalletId,
          receiverWalletId: d.employeeWalletId,
          amount: d.salary,
          currency: dto.disbursements[0].salary ? 'USD' : 'ABC', // currency should be fetched from employer, simplified
          description: `Salary Batch: ${dto.batchId}`,
          idempotencyKey,
        });

        processedCount++;
        // Individual progress checkpoint logic (every 10 or 100 entries depending on scale)
        if (processedCount % 10 === 0) {
          dbJob.processedEmployees = processedCount;
          await this.jobRepo.save(dbJob);
          job.updateProgress(
            Math.floor((processedCount / dbJob.totalEmployees) * 100),
          );
        }
      } catch (err: unknown) {
        const e = err as Error & { message?: string };
        this.logger.error(
          `Failed individual disbursement in payroll ${dto.batchId}: ${e.message}`,
        );
        // We continue to allow as many as possible to process even if one employee's wallet is disabled
      }
    }

    dbJob.status =
      processedCount === dbJob.totalEmployees
        ? PayrollJobStatus.COMPLETED
        : PayrollJobStatus.FAILED;
    dbJob.processedEmployees = processedCount;
    await this.jobRepo.save(dbJob);

    if (dbJob.status === PayrollJobStatus.COMPLETED) {
      this.metricsService.payrollJobsCompleted.inc();
      this.logger.log(`Payroll job ${jobId} completed successfully.`);
    } else {
      this.metricsService.payrollJobsFailed.inc();
      this.logger.error(
        `Payroll job ${jobId} completed with some errors. processed=${processedCount}/${dbJob.totalEmployees}`,
      );
    }

    return { processedCount };
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Payroll Job ${job.id} fatally failed: ${error.message}`);
  }
}
