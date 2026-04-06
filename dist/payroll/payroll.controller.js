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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payroll_service_1 = require("./payroll.service");
const bulk_payroll_dto_1 = require("./dto/bulk-payroll.dto");
let PayrollController = class PayrollController {
    constructor(payrollService) {
        this.payrollService = payrollService;
    }
    createBulkJob(dto) {
        return this.payrollService.createBulkJob(dto);
    }
    getJobStatus(id) {
        return this.payrollService.getJobStatus(id);
    }
    listJobs() {
        return this.payrollService.listJobs();
    }
};
exports.PayrollController = PayrollController;
__decorate([
    (0, common_1.Post)('bulk'),
    (0, swagger_1.ApiOperation)({
        summary: 'Process bulk salary disbursements (Job Queue)',
        description: 'Accepts a large batch of salary transfers and processes them via BullMQ. Concurrency=1 ensures zero contention on employer wallet.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_payroll_dto_1.BulkPayrollDto]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "createBulkJob", null);
__decorate([
    (0, common_1.Get)('jobs/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Check payroll job progress and status' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "getJobStatus", null);
__decorate([
    (0, common_1.Get)('jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'List all payroll jobs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "listJobs", null);
exports.PayrollController = PayrollController = __decorate([
    (0, swagger_1.ApiTags)('Payroll'),
    (0, common_1.Controller)('payroll'),
    __metadata("design:paramtypes", [payroll_service_1.PayrollService])
], PayrollController);
//# sourceMappingURL=payroll.controller.js.map