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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollJob = exports.PayrollJobStatus = void 0;
const typeorm_1 = require("typeorm");
var PayrollJobStatus;
(function (PayrollJobStatus) {
    PayrollJobStatus["QUEUED"] = "QUEUED";
    PayrollJobStatus["PROCESSING"] = "PROCESSING";
    PayrollJobStatus["COMPLETED"] = "COMPLETED";
    PayrollJobStatus["FAILED"] = "FAILED";
})(PayrollJobStatus || (exports.PayrollJobStatus = PayrollJobStatus = {}));
let PayrollJob = class PayrollJob {
};
exports.PayrollJob = PayrollJob;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PayrollJob.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employer_wallet_id' }),
    __metadata("design:type", String)
], PayrollJob.prototype, "employerWalletId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PayrollJob.prototype, "totalEmployees", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], PayrollJob.prototype, "processedEmployees", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 6 }),
    __metadata("design:type", String)
], PayrollJob.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10 }),
    __metadata("design:type", String)
], PayrollJob.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: PayrollJobStatus.QUEUED }),
    __metadata("design:type", String)
], PayrollJob.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job_id', nullable: true }),
    __metadata("design:type", String)
], PayrollJob.prototype, "jobId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PayrollJob.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PayrollJob.prototype, "updatedAt", void 0);
exports.PayrollJob = PayrollJob = __decorate([
    (0, typeorm_1.Entity)('payroll_jobs')
], PayrollJob);
//# sourceMappingURL=payroll-job.entity.js.map