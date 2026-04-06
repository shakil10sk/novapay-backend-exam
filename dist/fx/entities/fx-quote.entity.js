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
exports.FxQuote = exports.QuoteStatus = void 0;
const typeorm_1 = require("typeorm");
var QuoteStatus;
(function (QuoteStatus) {
    QuoteStatus["ACTIVE"] = "ACTIVE";
    QuoteStatus["EXPIRED"] = "EXPIRED";
    QuoteStatus["USED"] = "USED";
})(QuoteStatus || (exports.QuoteStatus = QuoteStatus = {}));
let FxQuote = class FxQuote {
};
exports.FxQuote = FxQuote;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FxQuote.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'base_currency', length: 10 }),
    __metadata("design:type", String)
], FxQuote.prototype, "baseCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quote_currency', length: 10 }),
    __metadata("design:type", String)
], FxQuote.prototype, "quoteCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8 }),
    __metadata("design:type", String)
], FxQuote.prototype, "rate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'amount_base', type: 'decimal', precision: 20, scale: 6 }),
    __metadata("design:type", String)
], FxQuote.prototype, "amountBase", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'amount_quote', type: 'decimal', precision: 20, scale: 6 }),
    __metadata("design:type", String)
], FxQuote.prototype, "amountQuote", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requested_by_user_id', nullable: true }),
    __metadata("design:type", String)
], FxQuote.prototype, "requestedByUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: QuoteStatus.ACTIVE }),
    __metadata("design:type", String)
], FxQuote.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], FxQuote.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'used_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], FxQuote.prototype, "usedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'used_by_transaction_id', nullable: true }),
    __metadata("design:type", String)
], FxQuote.prototype, "usedByTransactionId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FxQuote.prototype, "createdAt", void 0);
exports.FxQuote = FxQuote = __decorate([
    (0, typeorm_1.Entity)('fx_quotes')
], FxQuote);
//# sourceMappingURL=fx-quote.entity.js.map