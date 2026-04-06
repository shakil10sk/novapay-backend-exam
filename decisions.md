# NovaPay Design Decisions: Idempotency & Fault Tolerance

This document explains the technical handling of the five core idempotency scenarios in the NovaPay Transaction Backend.

## Scenario A: Same key arrives twice. Second is discarded. No second debit.
**Mechanism:**
1. Transaction Service receives the request and hashes the payload.
2. It queries `idempotency_keys` for the provided key.
3. It finds a record with `status=COMPLETED`.
4. It returns the `response_body` cached in that record without entering the orchestration logic.
**Result:** Exactly one debit and one credit. The client receives the same response both times.

## Scenario B: Three identical requests arrive within 100ms.
**Mechanism: Database Unique Constraint Race Handling**
1. Three simultaneous requests attempt to `INSERT` into the `idempotency_keys` table.
2. PostgreSQL enforces a `UNIQUE` constraint on the `key` column.
3. One request (the "Winner") successfully inserts the row with `status=PROCESSING`.
4. The two "Losing" requests receive a `UniqueViolation` error from the database.
5. The losing requests catch this error, fetch the existing `PROCESSING` record, and return a `409 Conflict` ("Request already being processed").
**At the DB Level:** Only one transaction is permitted to hold the row for that key in a `PROCESSING` state.

## Scenario C: Sender debited. Server crashes before recipient credited.
**Mechanism: Orchestration Progress + Recovery Scan**
1. The `Transaction` record is created with `status=PENDING` before ledger writes begin.
2. Balance checks and FX locks are verified.
3. The server crashes.
4. On recovery (or via cron), the `runCrashRecovery()` method scans for `PENDING` transactions older than 20s.
5. It checks the `Ledger` service for entries matching the `transactionId`.
6. If 0 entries exist: The crash happened before the first write. Status set to `FAILED`.
7. If 1 entry exists: This should never happen due to the Ledger Service's atomic `postDoubleEntry` (debit + credit in one SQL transaction). Recovery would detect this as a data integrity event.
8. If 2 entries exist: The ledger is balanced but the status wasn't updated. Transaction set to `COMPLETED`.
**Atomicity:** Handled by `ledgerService.postDoubleEntry` which uses a single DB transaction for the debit/credit pair.

## Scenario D: Idempotency key expires after 24 hours.
**Mechanism: Expiry-Aware Fetching**
1. Each `IdempotencyKey` record has an `expires_at` timestamp (default: 24h).
2. When a request arrives, the service checks if `now > expiresAt`.
3. If expired: The record is deleted from the database.
4. The request proceeds as if it were a brand-new initiation.
**Result:** A new transaction is created for the recycled key.

## Scenario E: Client sends key-abc for $500, then key-abc for $800.
**Mechanism: Payload Fingerprinting (SHA-256)**
1. Every idempotency record stores a `payload_hash` (SHA-256 of the sorted request body).
2. When a duplicate key arrives, the service compares the new request's hash to the stored hash.
3. If they differ: The service throws `422 Unprocessable Entity` ("Idempotency key payload mismatch").
**Result:** Prevents accidental re-use of client-side references for different intentions.
