export declare class CreateTransferDto {
    senderWalletId: string;
    receiverWalletId: string;
    amount: number;
    currency: string;
    fxQuoteId?: string;
    description?: string;
    idempotencyKey: string;
}
