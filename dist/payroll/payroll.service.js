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
var PayrollService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const payroll_job_entity_1 = require("./entities/payroll-job.entity");
const metrics_service_1 = require("../metrics/metrics.service");
const account_service_1 = require("../account/account.service");
let PayrollService = PayrollService_1 = class PayrollService {
    constructor(jobRepo, payrollQueue, metricsService, accountService) {
        this.jobRepo = jobRepo;
        this.payrollQueue = payrollQueue;
        this.metricsService = metricsService;
        this.accountService = accountService;
        this.logger = new common_1.Logger(PayrollService_1.name);
    }
    async createBulkJob(dto) {
        const employer = await this.accountService.getWalletById(dto.employerWalletId);
        const existing = await this.jobRepo.findOne({
            where: { employerWalletId: dto.employerWalletId, jobId: dto.batchId }
        });
        if (existing) {
            throw new common_1.ConflictException(`Payroll batch ${dto.batchId} for employer ${dto.employerWalletId} already exists.`);
        }
        const totalAmount = dto.disbursements.reduce((sum, d) => sum + Number(d.salary), 0);
        const job = this.jobRepo.create({
            id: dto.batchId,
            employerWalletId: dto.employerWalletId,
            totalEmployees: dto.disbursements.length,
            processedEmployees: 0,
            totalAmount: String(totalAmount),
            currency: employer.currency,
            status: payroll_job_entity_1.PayrollJobStatus.QUEUED,
            jobId: dto.batchId,
        });
        const savedJob = await this.jobRepo.save(job);
        await this.payrollQueue.add('process_bulk_payroll', { dto, jobId: savedJob.id }, {
            jobId: dto.batchId,
            removeOnComplete: true,
            removeOnFail: false,
            attempts: 5,
            backoff: { type: 'exponential', delay: 2000 },
        });
        this.metricsService.payrollJobsQueued.inc();
        this.logger.log(`Bulk payroll job queued: id=${dto.batchId} employees=${dto.disbursements.length}`);
        return savedJob;
    }
    async getJobStatus(jobId) {
        const job = await this.jobRepo.findOne({ where: { id: jobId } });
        if (!job)
            throw new common_1.NotFoundException(`Payroll job not found: ${jobId}`);
        return job;
    }
    async listJobs() {
        return this.jobRepo.find({ order: { createdAt: 'DESC' }, take: 100 });
    }
};
exports.PayrollService = PayrollService;
exports.PayrollService = PayrollService = PayrollService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payroll_job_entity_1.PayrollJob, 'payrollConnection')),
    __param(1, (0, bullmq_1.InjectQueue)('payrollQueue')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        bullmq_2.Queue,
        metrics_service_1.MetricsService,
        account_service_1.AccountService])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map