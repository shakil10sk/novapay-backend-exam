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
exports.LedgerEntry = exports.EntryType = void 0;
const typeorm_1 = require("typeorm");
const encryption_service_1 = require("../../common/encryption/encryption.service");
var EntryType;
(function (EntryType) {
    EntryType["DEBIT"] = "DEBIT";
    EntryType["CREDIT"] = "CREDIT";
})(EntryType || (exports.EntryType = EntryType = {}));
let LedgerEntry = class LedgerEntry {
};
exports.LedgerEntry = LedgerEntry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LedgerEntry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_ledger_entries_transaction_id'),
    (0, typeorm_1.Column)({ name: 'transaction_id' }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_ledger_entries_wallet_id'),
    (0, typeorm_1.Column)({ name: 'wallet_id' }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "walletId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 6 }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10 }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'account_name',
        nullable: true,
        transformer: encryption_service_1.EncryptedTransformer,
    }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "accountName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fx_rate', type: 'decimal', precision: 20, scale: 8, nullable: true }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "fxRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_hash', length: 64, nullable: true }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "auditHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'previous_hash', length: 64, nullable: true }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "previousHash", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], LedgerEntry.prototype, "createdAt", void 0);
exports.LedgerEntry = LedgerEntry = __decorate([
    (0, typeorm_1.Entity)('ledger_entries')
], LedgerEntry);
//# sourceMappingURL=ledger-entry.entity.js.map