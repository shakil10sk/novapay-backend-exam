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
exports.BulkPayrollDto = exports.PayrollDisbursementEntry = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class PayrollDisbursementEntry {
}
exports.PayrollDisbursementEntry = PayrollDisbursementEntry;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'employee-wallet-uuid' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PayrollDisbursementEntry.prototype, "employeeWalletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4500.00 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], PayrollDisbursementEntry.prototype, "salary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EMP-001', description: 'Internal employee ref for idempotency' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PayrollDisbursementEntry.prototype, "employeeReference", void 0);
class BulkPayrollDto {
}
exports.BulkPayrollDto = BulkPayrollDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'employer-wallet-uuid' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkPayrollDto.prototype, "employerWalletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'payroll-2026-dec', description: 'Unique batch ID across jobs' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkPayrollDto.prototype, "batchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PayrollDisbursementEntry] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PayrollDisbursementEntry),
    __metadata("design:type", Array)
], BulkPayrollDto.prototype, "disbursements", void 0);
//# sourceMappingURL=bulk-payroll.dto.js.map