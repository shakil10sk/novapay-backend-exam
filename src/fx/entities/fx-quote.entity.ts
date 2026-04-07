import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum QuoteStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  USED = 'USED',
}

/**
 * A time-locked FX rate quote.
 * - TTL: 60 seconds from creation (hardcoded financial requirement)
 * - Single-use: once a transfer consumes this quote, status becomes USED
 * - If the FX provider was unavailable at creation time, the quote is never issued
 */
@Entity('fx_quotes')
export class FxQuote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'base_currency', length: 10 })
  baseCurrency: string;

  @Column({ name: 'quote_currency', length: 10 })
  quoteCurrency: string;

  /**
   * The rate locked at quote creation time.
   * This rate is GUARANTEED for the 60s window.
   */
  @Column({ type: 'decimal', precision: 20, scale: 8 })
  rate: string;

  @Column({ name: 'amount_base', type: 'decimal', precision: 20, scale: 6 })
  amountBase: string;

  @Column({ name: 'amount_quote', type: 'decimal', precision: 20, scale: 6 })
  amountQuote: string;

  @Column({ name: 'requested_by_user_id', nullable: true })
  requestedByUserId: string;

  @Column({ type: 'varchar', length: 20, default: QuoteStatus.ACTIVE })
  status: QuoteStatus;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt: Date;

  @Column({ name: 'used_by_transaction_id', nullable: true })
  usedByTransactionId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
