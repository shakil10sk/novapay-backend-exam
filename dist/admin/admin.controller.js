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
var AdminController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ledger_service_1 = require("../ledger/ledger.service");
const transaction_service_1 = require("../transaction/transaction.service");
const account_service_1 = require("../account/account.service");
let AdminController = AdminController_1 = class AdminController {
    constructor(ledgerService, transactionService, accountService) {
        this.ledgerService = ledgerService;
        this.transactionService = transactionService;
        this.accountService = accountService;
        this.logger = new common_1.Logger(AdminController_1.name);
    }
    checkLedgerHealth() {
        this.logger.log('Admin triggered global ledger health check.');
        return this.ledgerService.checkGlobalInvariant();
    }
    triggerRecovery() {
        this.logger.warn('Admin manually triggered system recovery.');
        return this.transactionService.runCrashRecovery();
    }
    listSysWallets() {
        return this.accountService.listWallets();
    }
    verifyWalletAudit(id) {
        return this.ledgerService.verifyAuditChain(id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('health/ledger'),
    (0, swagger_1.ApiOperation)({ summary: 'Check global ledger health (invariant check)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "checkLedgerHealth", null);
__decorate([
    (0, common_1.Post)('recovery/trigger'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger crash recovery for all services' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "triggerRecovery", null);
__decorate([
    (0, common_1.Get)('wallets'),
    (0, swagger_1.ApiOperation)({ summary: 'Internal view of all user wallets and snaphost balances' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listSysWallets", null);
__decorate([
    (0, common_1.Get)('audit/wallet/:id'),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiOperation)({ summary: 'Verify tamper-evident hash chain for a specific wallet' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "verifyWalletAudit", null);
exports.AdminController = AdminController = AdminController_1 = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [ledger_service_1.LedgerService,
        transaction_service_1.TransactionService,
        account_service_1.AccountService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map