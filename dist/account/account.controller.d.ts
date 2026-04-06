import { AccountService } from './account.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
export declare class AccountController {
    private readonly accountService;
    constructor(accountService: AccountService);
    createWallet(dto: CreateWalletDto): Promise<import("./entities/wallet.entity").Wallet>;
    listWallets(): Promise<import("./entities/wallet.entity").Wallet[]>;
    getByUser(userId: string): Promise<import("./entities/wallet.entity").Wallet>;
    getById(walletId: string): Promise<import("./entities/wallet.entity").Wallet>;
}
