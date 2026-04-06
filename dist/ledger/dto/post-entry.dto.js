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
exports.PostDoubleEntryDto = exports.LedgerEntryDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const ledger_entry_entity_1 = require("../entities/ledger-entry.entity");
const class_transformer_1 = require("class-transformer");
class LedgerEntryDto {
}
exports.LedgerEntryDto = LedgerEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'wallet-uuid' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LedgerEntryDto.prototype, "walletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ledger_entry_entity_1.EntryType }),
    (0, class_validator_1.IsEnum)(ledger_entry_entity_1.EntryType),
    __metadata("design:type", String)
], LedgerEntryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100.00 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.000001),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], LedgerEntryDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LedgerEntryDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LedgerEntryDto.prototype, "accountName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Salary disbursement' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LedgerEntryDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1.2345 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], LedgerEntryDto.prototype, "fxRate", void 0);
class PostDoubleEntryDto {
}
exports.PostDoubleEntryDto = PostDoubleEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'txn-uuid' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PostDoubleEntryDto.prototype, "transactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: LedgerEntryDto }),
    __metadata("design:type", LedgerEntryDto)
], PostDoubleEntryDto.prototype, "debit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: LedgerEntryDto }),
    __metadata("design:type", LedgerEntryDto)
], PostDoubleEntryDto.prototype, "credit", void 0);
//# sourceMappingURL=post-entry.dto.js.map