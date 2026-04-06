import { Currency } from '../entities/wallet.entity';
export declare class CreateWalletDto {
    userId: string;
    ownerName: string;
    currency?: Currency;
}
