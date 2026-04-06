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
exports.AccountService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const wallet_entity_1 = require("./entities/wallet.entity");
let AccountService = class AccountService {
    constructor(walletRepo) {
        this.walletRepo = walletRepo;
    }
    async createWallet(dto) {
        const existing = await this.walletRepo.findOne({ where: { userId: dto.userId } });
        if (existing) {
            throw new common_1.ConflictException(`Wallet already exists for userId: ${dto.userId}`);
        }
        const wallet = this.walletRepo.create({
            userId: dto.userId,
            ownerName: dto.ownerName,
            currency: dto.currency || 'USD',
            balanceSnapshot: '0',
            isActive: true,
        });
        return this.walletRepo.save(wallet);
    }
    async getWallet(userId) {
        const wallet = await this.walletRepo.findOne({ where: { userId } });
        if (!wallet)
            throw new common_1.NotFoundException(`Wallet not found for userId: ${userId}`);
        return wallet;
    }
    async getWalletById(walletId) {
        const wallet = await this.walletRepo.findOne({ where: { id: walletId } });
        if (!wallet)
            throw new common_1.NotFoundException(`Wallet not found: ${walletId}`);
        return wallet;
    }
    async updateBalanceSnapshot(walletId, balance) {
        await this.walletRepo.update({ id: walletId }, { balanceSnapshot: balance });
    }
    async listWallets() {
        return this.walletRepo.find();
    }
    async deactivateWallet(userId) {
        const wallet = await this.getWallet(userId);
        wallet.isActive = false;
        await this.walletRepo.save(wallet);
    }
};
exports.AccountService = AccountService;
exports.AccountService = AccountService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet, 'accountConnection')),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AccountService);
//# sourceMappingURL=account.service.js.map