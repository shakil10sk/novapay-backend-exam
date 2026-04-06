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
exports.Wallet = exports.Currency = void 0;
const typeorm_1 = require("typeorm");
var Currency;
(function (Currency) {
    Currency["USD"] = "USD";
    Currency["EUR"] = "EUR";
    Currency["GBP"] = "GBP";
    Currency["BDT"] = "BDT";
    Currency["NGN"] = "NGN";
})(Currency || (exports.Currency = Currency = {}));
let Wallet = class Wallet {
};
exports.Wallet = Wallet;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Wallet.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_wallets_user_id', { unique: true }),
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Wallet.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, default: Currency.USD }),
    __metadata("design:type", String)
], Wallet.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 6, default: '0' }),
    __metadata("design:type", String)
], Wallet.prototype, "balanceSnapshot", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Wallet.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'owner_name', length: 255 }),
    __metadata("design:type", String)
], Wallet.prototype, "ownerName", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Wallet.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Wallet.prototype, "updatedAt", void 0);
exports.Wallet = Wallet = __decorate([
    (0, typeorm_1.Entity)('wallets')
], Wallet);
//# sourceMappingURL=wallet.entity.js.map