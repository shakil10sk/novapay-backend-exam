"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PayrollProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const bullmq_2 = require("bullmq");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const payroll_job_entity_1 = require("./entities/payroll-job.entity");
const transaction_service_1 = require("../transaction/transaction.service");
const metrics_service_1 = require("../metrics/metrics.service");
let PayrollProcessor = PayrollProcessor_1 = class PayrollProcessor extends bullmq_1.WorkerHost {
    constructor(jobRepo, transactionService, metricsService) {
        super();
        this.jobRepo = jobRepo;
        this.transactionService = transactionService;
        this.metricsService = metricsService;
        this.logger = new common_1.Logger(PayrollProcessor_1.name);
    }
    async process(job) {
        const { dto, jobId } = job.data;
        const dbJob = await this.jobRepo.findOne({ where: { id: jobId } });
        if (!dbJob)
            return;
        this.logger.log(`Processing Payroll Job: id=${jobId} total=${dbJob.totalEmployees}`);
        dbJob.status = payroll_job_entity_1.PayrollJobStatus.PROCESSING;
        await this.jobRepo.save(dbJob);
        let processedCount = 0;
        for (const d of dto.disbursements) {
            try {
                const idempotencyKey = `payroll-${dto.batchId}-${d.employeeReference}`;
                await this.transactionService.executeTransfer({
                    senderWalletId: dto.employerWalletId,
                    receiverWalletId: d.employeeWalletId,
                    amount: d.salary,
                    currency: dto.disbursements[0].salary ? 'USD' : 'ABC',
                    description: `Salary Batch: ${dto.batchId}`,
                    idempotencyKey,
                });
                processedCount++;
                if (processedCount % 10 === 0) {
                    dbJob.processedEmployees = processedCount;
                    await this.jobRepo.save(dbJob);
                    job.updateProgress(Math.floor((processedCount / dbJob.totalEmployees) * 100));
                }
            }
            catch (err) {
                this.logger.error(`Failed individual disbursement in payroll ${dto.batchId}: ${err.message}`);
            }
        }
        dbJob.status = processedCount === dbJob.totalEmployees ? payroll_job_entity_1.PayrollJobStatus.COMPLETED : payroll_job_entity_1.PayrollJobStatus.FAILED;
        dbJob.processedEmployees = processedCount;
        await this.jobRepo.save(dbJob);
        if (dbJob.status === payroll_job_entity_1.PayrollJobStatus.COMPLETED) {
            this.metricsService.payrollJobsCompleted.inc();
            this.logger.log(`Payroll job ${jobId} completed successfully.`);
        }
        else {
            this.metricsService.payrollJobsFailed.inc();
            this.logger.error(`Payroll job ${jobId} completed with some errors. processed=${processedCount}/${dbJob.totalEmployees}`);
        }
        return { processedCount };
    }
    onFailed(job, error) {
        this.logger.error(`Payroll Job ${job.id} fatally failed: ${error.message}`);
    }
};
exports.PayrollProcessor = PayrollProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job, Error]),
    __metadata("design:returntype", void 0)
], PayrollProcessor.prototype, "onFailed", null);
exports.PayrollProcessor = PayrollProcessor = PayrollProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('payrollQueue', {
        concurrency: 1,
    }),
    __param(0, (0, typeorm_2.InjectRepository)(payroll_job_entity_1.PayrollJob, 'payrollConnection')),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        transaction_service_1.TransactionService,
        metrics_service_1.MetricsService])
], PayrollProcessor);
//# sourceMappingURL=payroll.processor.js.map