import 'dotenv/config';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

/**
 * Envelope Encryption using AES-256-GCM.
 * The master key encrypts a per-record DEK (Data Encryption Key),
 * the DEK encrypts the actual field value.
 *
 * Format stored in DB: <iv_hex>:<encryptedDek_hex>:<tag_hex>:<ciphertext_hex>
 */
export class EncryptionService {
  private readonly masterKey: Buffer;

  constructor() {
    const keyHex = process.env.ENCRYPTION_KEY || '';
    if (keyHex.length !== 64) {
      throw new Error(
        'ENCRYPTION_KEY must be a 64-character hex string (32 bytes)',
      );
    }
    this.masterKey = Buffer.from(keyHex, 'hex');
  }

  encrypt(plaintext: string): string {
    if (!plaintext) return plaintext;

    // Generate per-record DEK (32 bytes)
    const dek = crypto.randomBytes(32);

    // Encrypt the DEK with the master key
    const dekIv = crypto.randomBytes(IV_LENGTH);
    const dekCipher = crypto.createCipheriv(ALGORITHM, this.masterKey, dekIv);
    const encryptedDek = Buffer.concat([
      dekCipher.update(dek),
      dekCipher.final(),
    ]);
    const dekTag = dekCipher.getAuthTag();

    // Encrypt the actual value with the DEK
    const valueIv = crypto.randomBytes(IV_LENGTH);
    const valueCipher = crypto.createCipheriv(ALGORITHM, dek, valueIv);
    const ciphertext = Buffer.concat([
      valueCipher.update(plaintext, 'utf8'),
      valueCipher.final(),
    ]);
    const valueTag = valueCipher.getAuthTag();

    // Encode: dekIv:dekTag:encryptedDek:valueIv:valueTag:ciphertext
    return [
      dekIv.toString('hex'),
      dekTag.toString('hex'),
      encryptedDek.toString('hex'),
      valueIv.toString('hex'),
      valueTag.toString('hex'),
      ciphertext.toString('hex'),
    ].join(':');
  }

  decrypt(stored: string): string {
    if (!stored || !stored.includes(':')) return stored;
    const parts = stored.split(':');
    if (parts.length !== 6) return stored;

    const [
      dekIvHex,
      dekTagHex,
      encryptedDekHex,
      valueIvHex,
      valueTagHex,
      ciphertextHex,
    ] = parts;

    // Decrypt the DEK
    const dekDecipher = crypto.createDecipheriv(
      ALGORITHM,
      this.masterKey,
      Buffer.from(dekIvHex, 'hex'),
    );
    dekDecipher.setAuthTag(Buffer.from(dekTagHex, 'hex'));
    const dek = Buffer.concat([
      dekDecipher.update(Buffer.from(encryptedDekHex, 'hex')),
      dekDecipher.final(),
    ]);

    // Decrypt the value
    const valueDecipher = crypto.createDecipheriv(
      ALGORITHM,
      dek,
      Buffer.from(valueIvHex, 'hex'),
    );
    valueDecipher.setAuthTag(Buffer.from(valueTagHex, 'hex'));
    return Buffer.concat([
      valueDecipher.update(Buffer.from(ciphertextHex, 'hex')),
      valueDecipher.final(),
    ]).toString('utf8');
  }
}

// Singleton
export const encryptionService = new EncryptionService();

/**
 * TypeORM column transformer for transparent field-level encryption.
 */
export const EncryptedTransformer = {
  to: (value: string): string => {
    if (!value) return value;
    return encryptionService.encrypt(value);
  },
  from: (value: string): string => {
    if (!value) return value;
    return encryptionService.decrypt(value);
  },
};
