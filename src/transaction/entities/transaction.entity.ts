import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

export enum TransactionType {
  DOMESTIC = 'DOMESTIC',
  INTERNATIONAL = 'INTERNATIONAL',
  PAYROLL = 'PAYROLL',
  FEE = 'FEE',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sender_wallet_id' })
  senderWalletId: string;

  @Column({ name: 'receiver_wallet_id' })
  receiverWalletId: string;

  @Column({ type: 'decimal', precision: 20, scale: 6 })
  amount: string;

  @Column({ length: 10 })
  currency: string;

  @Column({ name: 'type', type: 'varchar', length: 20 })
  type: TransactionType;

  @Column({ type: 'varchar', length: 20, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ name: 'fx_quote_id', nullable: true })
  fxQuoteId: string;

  @Column({
    name: 'fx_rate',
    type: 'decimal',
    precision: 20,
    scale: 8,
    nullable: true,
  })
  fxRate: string;

  @Column({ name: 'idempotency_key', nullable: true })
  idempotencyKey: string;

  @Column({
    name: 'fee_amount',
    type: 'decimal',
    precision: 20,
    scale: 6,
    default: '0',
  })
  feeAmount: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'failure_reason', nullable: true })
  failureReason: string;

  /**
   * Set to PENDING immediately. If the server crashes after debit but before credit,
   * a recovery job finds all PENDING transactions older than N seconds and reverses them.
   */
  @Column({ name: 'debit_completed_at', type: 'timestamptz', nullable: true })
  debitCompletedAt: Date;

  @Column({ name: 'credit_completed_at', type: 'timestamptz', nullable: true })
  creditCompletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
