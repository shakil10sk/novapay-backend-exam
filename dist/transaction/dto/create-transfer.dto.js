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
exports.CreateTransferDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreateTransferDto {
}
exports.CreateTransferDto = CreateTransferDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'sender-wallet-uuid' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "senderWalletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'receiver-wallet-uuid' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "receiverWalletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100.00 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateTransferDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'fx-quote-uuid' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "fxQuoteId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Salary payment' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'client-ref-123', description: 'Idempotency key' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "idempotencyKey", void 0);
//# sourceMappingURL=create-transfer.dto.js.map