import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Injectable()
export class AccountService {
    constructor(
        @InjectRepository(Wallet, 'accountConnection')
        private readonly walletRepo: Repository<Wallet>,
    ) { }

    async createWallet(dto: CreateWalletDto): Promise<Wallet> {
        const existing = await this.walletRepo.findOne({ where: { userId: dto.userId } });
        if (existing) {
            throw new ConflictException(`Wallet already exists for userId: ${dto.userId}`);
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

    async getWallet(userId: string): Promise<Wallet> {
        const wallet = await this.walletRepo.findOne({ where: { userId } });
        if (!wallet) throw new NotFoundException(`Wallet not found for userId: ${userId}`);
        return wallet;
    }

    async getWalletById(walletId: string): Promise<Wallet> {
        const wallet = await this.walletRepo.findOne({ where: { id: walletId } });
        if (!wallet) throw new NotFoundException(`Wallet not found: ${walletId}`);
        return wallet;
    }

    async updateBalanceSnapshot(walletId: string, balance: string): Promise<void> {
        await this.walletRepo.update({ id: walletId }, { balanceSnapshot: balance });
    }

    async listWallets(): Promise<Wallet[]> {
        return this.walletRepo.find();
    }

    async deactivateWallet(userId: string): Promise<void> {
        const wallet = await this.getWallet(userId);
        wallet.isActive = false;
        await this.walletRepo.save(wallet);
    }
}
