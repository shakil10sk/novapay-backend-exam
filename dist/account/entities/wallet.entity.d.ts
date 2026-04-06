export declare enum Currency {
    USD = "USD",
    EUR = "EUR",
    GBP = "GBP",
    BDT = "BDT",
    NGN = "NGN"
}
export declare class Wallet {
    id: string;
    userId: string;
    currency: string;
    balanceSnapshot: string;
    isActive: boolean;
    ownerName: string;
    createdAt: Date;
    updatedAt: Date;
}
