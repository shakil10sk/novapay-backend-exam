import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { EncryptedTransformer } from '../../common/encryption/encryption.service';

export enum EntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

/**
 * Double-entry ledger entry.
 * Every money movement creates exactly two entries (DEBIT + CREDIT).
 * Entries are IMMUTABLE — never updated, never deleted.
 * The audit_hash forms a chain linking each entry to its predecessor,
 * making tampering detectable.
 */
@Entity('ledger_entries')
export class LedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_ledger_entries_transaction_id')
  @Column({ name: 'transaction_id' })
  transactionId: string;

  @Index('idx_ledger_entries_wallet_id')
  @Column({ name: 'wallet_id' })
  walletId: string;

  @Column({ type: 'varchar', length: 10 })
  type: EntryType; // DEBIT or CREDIT

  @Column({ type: 'decimal', precision: 20, scale: 6 })
  amount: string;

  @Column({ length: 10 })
  currency: string;

  /**
   * accountName is encrypted at rest — never stored in plaintext.
   */
  @Column({
    name: 'account_name',
    nullable: true,
    transformer: EncryptedTransformer,
  })
  accountName: string;

  @Column({ length: 500, nullable: true })
  description: string;

  /**
   * The locked FX rate at time of write (for cross-currency entries).
   */
  @Column({
    name: 'fx_rate',
    type: 'decimal',
    precision: 20,
    scale: 8,
    nullable: true,
  })
  fxRate: string;

  /**
   * SHA-256 hash of (previousHash + entryId + amount + type + walletId + transactionId + createdAt).
   * Forms an append-only audit chain. If any entry is tampered, all subsequent hashes become invalid.
   */
  @Column({ name: 'audit_hash', length: 64, nullable: true })
  auditHash: string;

  @Column({ name: 'previous_hash', length: 64, nullable: true })
  previousHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
