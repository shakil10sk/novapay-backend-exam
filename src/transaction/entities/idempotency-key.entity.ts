import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum IdempotencyStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * Idempotency key record. Stored in the Transaction DB.
 *
 * Scenario A/B: The unique constraint on `key` ensures only one record per key.
 * If two concurrent requests arrive simultaneously, the DB unique constraint
 * causes one to fail. The failing request then reads the existing record and
 * returns the cached response — exactly one processing.
 *
 * Scenario C: Status=PROCESSING + transactionId allows recovery jobs to find
 * and complete/reverse dangling transactions after a crash.
 *
 * Scenario D: expiresAt is set to 24h from creation. On expiry, the record is
 * treated as non-existent and a new record is created for the same key.
 *
 * Scenario E: payloadHash stores SHA-256 of the original request payload.
 * If a new request arrives with the same key but different payload hash,
 * we return 422 Unprocessable Entity.
 */
@Entity('idempotency_keys')
export class IdempotencyKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_idempotency_keys_key', { unique: true })
  @Column({ length: 512 })
  key: string;

  /**
   * SHA-256 of the original request payload (sorted JSON).
   * Used to detect Scenario E: same key, different payload.
   */
  @Column({ name: 'payload_hash', length: 64 })
  payloadHash: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: IdempotencyStatus.PROCESSING,
  })
  status: IdempotencyStatus;

  /**
   * The transaction ID created by the first successful request.
   * Returned to all subsequent duplicate requests.
   */
  @Column({ name: 'transaction_id', nullable: true })
  transactionId: string;

  /**
   * Full cached response body serialized to JSON.
   * Returned as-is to duplicate requests — even if the underlying
   * transaction was later reversed.
   */
  @Column({ name: 'response_body', type: 'text', nullable: true })
  responseBody: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
