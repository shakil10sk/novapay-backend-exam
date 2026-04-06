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
exports.AccountController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const account_service_1 = require("./account.service");
const create_wallet_dto_1 = require("./dto/create-wallet.dto");
let AccountController = class AccountController {
    constructor(accountService) {
        this.accountService = accountService;
    }
    createWallet(dto) {
        return this.accountService.createWallet(dto);
    }
    listWallets() {
        return this.accountService.listWallets();
    }
    getByUser(userId) {
        return this.accountService.getWallet(userId);
    }
    getById(walletId) {
        return this.accountService.getWalletById(walletId);
    }
};
exports.AccountController = AccountController;
__decorate([
    (0, common_1.Post)('wallets'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new wallet for a user' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_wallet_dto_1.CreateWalletDto]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "createWallet", null);
__decorate([
    (0, common_1.Get)('wallets'),
    (0, swagger_1.ApiOperation)({ summary: 'List all wallets' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "listWallets", null);
__decorate([
    (0, common_1.Get)('wallets/user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet by userId' }),
    (0, swagger_1.ApiParam)({ name: 'userId', example: 'user-uuid-1234' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "getByUser", null);
__decorate([
    (0, common_1.Get)('wallets/:walletId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet by walletId' }),
    (0, swagger_1.ApiParam)({ name: 'walletId', example: 'uuid' }),
    __param(0, (0, common_1.Param)('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "getById", null);
exports.AccountController = AccountController = __decorate([
    (0, swagger_1.ApiTags)('Account'),
    (0, common_1.Controller)('accounts'),
    __metadata("design:paramtypes", [account_service_1.AccountService])
], AccountController);
//# sourceMappingURL=account.controller.js.map