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
exports.LedgerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ledger_service_1 = require("./ledger.service");
const post_entry_dto_1 = require("./dto/post-entry.dto");
let LedgerController = class LedgerController {
    constructor(ledgerService) {
        this.ledgerService = ledgerService;
    }
    postDoubleEntry(dto) {
        return this.ledgerService.postDoubleEntry(dto);
    }
    getBalance(walletId) {
        return this.ledgerService.getBalance(walletId);
    }
    getHistory(walletId, page = 1, limit = 20) {
        return this.ledgerService.getTransactionHistory(walletId, +page, +limit);
    }
    verifyAuditChain(walletId) {
        return this.ledgerService.verifyAuditChain(walletId);
    }
    checkGlobalInvariant() {
        return this.ledgerService.checkGlobalInvariant();
    }
    getByTransaction(transactionId) {
        return this.ledgerService.getEntriesByTransaction(transactionId);
    }
};
exports.LedgerController = LedgerController;
__decorate([
    (0, common_1.Post)('entries'),
    (0, swagger_1.ApiOperation)({ summary: 'Post a double-entry pair (internal use)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [post_entry_dto_1.PostDoubleEntryDto]),
    __metadata("design:returntype", void 0)
], LedgerController.prototype, "postDoubleEntry", null);
__decorate([
    (0, common_1.Get)('balance/:walletId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get authoritative balance from ledger (source of truth)' }),
    (0, swagger_1.ApiParam)({ name: 'walletId' }),
    __param(0, (0, common_1.Param)('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LedgerController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('history/:walletId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get paginated transaction history' }),
    (0, swagger_1.ApiParam)({ name: 'walletId' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('walletId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], LedgerController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('audit/:walletId'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify audit hash chain for a wallet' }),
    (0, swagger_1.ApiParam)({ name: 'walletId' }),
    __param(0, (0, common_1.Param)('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LedgerController.prototype, "verifyAuditChain", null);
__decorate([
    (0, common_1.Get)('invariant'),
    (0, swagger_1.ApiOperation)({ summary: 'Check global ledger invariant (total debits == total credits)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LedgerController.prototype, "checkGlobalInvariant", null);
__decorate([
    (0, common_1.Get)('transactions/:transactionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all ledger entries for a transaction' }),
    (0, swagger_1.ApiParam)({ name: 'transactionId' }),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LedgerController.prototype, "getByTransaction", null);
exports.LedgerController = LedgerController = __decorate([
    (0, swagger_1.ApiTags)('Ledger'),
    (0, common_1.Controller)('ledger'),
    __metadata("design:paramtypes", [ledger_service_1.LedgerService])
], LedgerController);
//# sourceMappingURL=ledger.controller.js.map