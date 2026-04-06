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
exports.TransactionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const transaction_service_1 = require("./transaction.service");
const create_transfer_dto_1 = require("./dto/create-transfer.dto");
let TransactionController = class TransactionController {
    constructor(transactionService) {
        this.transactionService = transactionService;
    }
    executeTransfer(dto) {
        return this.transactionService.executeTransfer(dto);
    }
    executeDomestic(dto) {
        return this.transactionService.executeTransfer(dto);
    }
    recover() {
        return this.transactionService.runCrashRecovery();
    }
    list() {
        return this.transactionService.listTransactions();
    }
    get(id) {
        return this.transactionService.getTransaction(id);
    }
};
exports.TransactionController = TransactionController;
__decorate([
    (0, common_1.Post)('international'),
    (0, swagger_1.ApiOperation)({
        summary: 'Execute internal or international transfer (Idempotent)',
        description: 'Ensures exactly-once processing even on client retries or simultaneous crashes. Applies locked FX rate if quoteId provided.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transfer_dto_1.CreateTransferDto]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "executeTransfer", null);
__decorate([
    (0, common_1.Post)('domestic'),
    (0, swagger_1.ApiOperation)({ summary: 'Alias for internal transfer (Idempotent)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transfer_dto_1.CreateTransferDto]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "executeDomestic", null);
__decorate([
    (0, common_1.Get)('recovery'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger crash recovery scan manually (for testing Scenario C)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "recover", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, swagger_1.ApiOperation)({ summary: 'List recent transactions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction details' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "get", null);
exports.TransactionController = TransactionController = __decorate([
    (0, swagger_1.ApiTags)('Transaction'),
    (0, common_1.Controller)('transfers'),
    __metadata("design:paramtypes", [transaction_service_1.TransactionService])
], TransactionController);
//# sourceMappingURL=transaction.controller.js.map