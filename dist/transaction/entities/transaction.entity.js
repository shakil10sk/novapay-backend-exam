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
exports.Transaction = exports.TransactionType = exports.TransactionStatus = void 0;
const typeorm_1 = require("typeorm");
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["COMPLETED"] = "COMPLETED";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["REVERSED"] = "REVERSED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["DOMESTIC"] = "DOMESTIC";
    TransactionType["INTERNATIONAL"] = "INTERNATIONAL";
    TransactionType["PAYROLL"] = "PAYROLL";
    TransactionType["FEE"] = "FEE";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
let Transaction = class Transaction {
};
exports.Transaction = Transaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sender_wallet_id' }),
    __metadata("design:type", String)
], Transaction.prototype, "senderWalletId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receiver_wallet_id' }),
    __metadata("design:type", String)
], Transaction.prototype, "receiverWalletId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 6 }),
    __metadata("design:type", String)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10 }),
    __metadata("design:type", String)
], Transaction.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type', type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: TransactionStatus.PENDING }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fx_quote_id', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "fxQuoteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fx_rate', type: 'decimal', precision: 20, scale: 8, nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "fxRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'idempotency_key', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "idempotencyKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fee_amount', type: 'decimal', precision: 20, scale: 6, default: '0' }),
    __metadata("design:type", String)
], Transaction.prototype, "feeAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failure_reason', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'debit_completed_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Transaction.prototype, "debitCompletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credit_completed_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Transaction.prototype, "creditCompletedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Transaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Transaction.prototype, "updatedAt", void 0);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)('transactions')
], Transaction);
//# sourceMappingURL=transaction.entity.js.map