import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
export declare class AccountService {
    private readonly walletRepo;
    constructor(walletRepo: Repository<Wallet>);
    createWallet(dto: CreateWalletDto): Promise<Wallet>;
    getWallet(userId: string): Promise<Wallet>;
    getWalletById(walletId: string): Promise<Wallet>;
    updateBalanceSnapshot(walletId: string, balance: string): Promise<void>;
    listWallets(): Promise<Wallet[]>;
    deactivateWallet(userId: string): Promise<void>;
}
