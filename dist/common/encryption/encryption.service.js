"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptedTransformer = exports.encryptionService = exports.EncryptionService = void 0;
require("dotenv/config");
const crypto = require("crypto");
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
class EncryptionService {
    constructor() {
        const keyHex = process.env.ENCRYPTION_KEY || '';
        if (keyHex.length !== 64) {
            throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
        }
        this.masterKey = Buffer.from(keyHex, 'hex');
    }
    encrypt(plaintext) {
        if (!plaintext)
            return plaintext;
        const dek = crypto.randomBytes(32);
        const dekIv = crypto.randomBytes(IV_LENGTH);
        const dekCipher = crypto.createCipheriv(ALGORITHM, this.masterKey, dekIv);
        const encryptedDek = Buffer.concat([dekCipher.update(dek), dekCipher.final()]);
        const dekTag = dekCipher.getAuthTag();
        const valueIv = crypto.randomBytes(IV_LENGTH);
        const valueCipher = crypto.createCipheriv(ALGORITHM, dek, valueIv);
        const ciphertext = Buffer.concat([valueCipher.update(plaintext, 'utf8'), valueCipher.final()]);
        const valueTag = valueCipher.getAuthTag();
        return [
            dekIv.toString('hex'),
            dekTag.toString('hex'),
            encryptedDek.toString('hex'),
            valueIv.toString('hex'),
            valueTag.toString('hex'),
            ciphertext.toString('hex'),
        ].join(':');
    }
    decrypt(stored) {
        if (!stored || !stored.includes(':'))
            return stored;
        const parts = stored.split(':');
        if (parts.length !== 6)
            return stored;
        const [dekIvHex, dekTagHex, encryptedDekHex, valueIvHex, valueTagHex, ciphertextHex] = parts;
        const dekDecipher = crypto.createDecipheriv(ALGORITHM, this.masterKey, Buffer.from(dekIvHex, 'hex'));
        dekDecipher.setAuthTag(Buffer.from(dekTagHex, 'hex'));
        const dek = Buffer.concat([
            dekDecipher.update(Buffer.from(encryptedDekHex, 'hex')),
            dekDecipher.final(),
        ]);
        const valueDecipher = crypto.createDecipheriv(ALGORITHM, dek, Buffer.from(valueIvHex, 'hex'));
        valueDecipher.setAuthTag(Buffer.from(valueTagHex, 'hex'));
        return Buffer.concat([
            valueDecipher.update(Buffer.from(ciphertextHex, 'hex')),
            valueDecipher.final(),
        ]).toString('utf8');
    }
}
exports.EncryptionService = EncryptionService;
exports.encryptionService = new EncryptionService();
exports.EncryptedTransformer = {
    to: (value) => {
        if (!value)
            return value;
        return exports.encryptionService.encrypt(value);
    },
    from: (value) => {
        if (!value)
            return value;
        return exports.encryptionService.decrypt(value);
    },
};
//# sourceMappingURL=encryption.service.js.map