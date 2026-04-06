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
exports.IdempotencyKey = exports.IdempotencyStatus = void 0;
const typeorm_1 = require("typeorm");
var IdempotencyStatus;
(function (IdempotencyStatus) {
    IdempotencyStatus["PROCESSING"] = "PROCESSING";
    IdempotencyStatus["COMPLETED"] = "COMPLETED";
    IdempotencyStatus["FAILED"] = "FAILED";
})(IdempotencyStatus || (exports.IdempotencyStatus = IdempotencyStatus = {}));
let IdempotencyKey = class IdempotencyKey {
};
exports.IdempotencyKey = IdempotencyKey;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], IdempotencyKey.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_idempotency_keys_key', { unique: true }),
    (0, typeorm_1.Column)({ length: 512 }),
    __metadata("design:type", String)
], IdempotencyKey.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payload_hash', length: 64 }),
    __metadata("design:type", String)
], IdempotencyKey.prototype, "payloadHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: IdempotencyStatus.PROCESSING }),
    __metadata("design:type", String)
], IdempotencyKey.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_id', nullable: true }),
    __metadata("design:type", String)
], IdempotencyKey.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'response_body', type: 'text', nullable: true }),
    __metadata("design:type", String)
], IdempotencyKey.prototype, "responseBody", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], IdempotencyKey.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], IdempotencyKey.prototype, "createdAt", void 0);
exports.IdempotencyKey = IdempotencyKey = __decorate([
    (0, typeorm_1.Entity)('idempotency_keys')
], IdempotencyKey);
//# sourceMappingURL=idempotency-key.entity.js.map