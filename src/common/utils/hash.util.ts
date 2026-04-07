import * as crypto from 'crypto';

/**
 * Creates a SHA-256 hash of the sorted JSON representation of a payload.
 * Used for Scenario E: idempotency key payload mismatch detection.
 */
export function hashPayload(payload: Record<string, any>): string {
  const normalized = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Creates an audit hash for a ledger entry chain.
 * Each entry includes the hash of the previous entry to form a tamper-evident chain.
 */
export function hashLedgerEntry(data: {
  previousHash: string;
  entryId: string;
  amount: string;
  type: string;
  walletId: string;
  transactionId: string;
  createdAt: string;
}): string {
  const str = JSON.stringify(data);
  return crypto.createHash('sha256').update(str).digest('hex');
}
