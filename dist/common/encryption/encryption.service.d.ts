import 'dotenv/config';
export declare class EncryptionService {
    private readonly masterKey;
    constructor();
    encrypt(plaintext: string): string;
    decrypt(stored: string): string;
}
export declare const encryptionService: EncryptionService;
export declare const EncryptedTransformer: {
    to: (value: string) => string;
    from: (value: string) => string;
};
