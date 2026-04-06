# NovaPay Backend: Enterprise-Grade Transaction Processor

NovaPay Backend is a high-throughput, fault-tolerant financial engine built on **NestJS** and **PostgreSQL**. It is designed to never double-disburse, never lose an unbalanced ledger, and never apply a stale FX rate.

## 🚀 Architecture: Isolated Service Boundaries
The system uses a **Microservice Architecture** implemented as a modular monolith for simplicity, where each service maintains its **OWN** database connection. No shared databases exist.

- **Gateway**: Single entry point (HTTP).
- **Account Service** (`db-account`): User wallets, balance snaphots.
- **Ledger Service** (`db-ledger`): Authoritative source of financial truth (Double-entry).
- **Transaction Service** (`db-txn`): Orchestrates money movements with **Idempotency**.
- **FX Service** (`db-fx`): Issues 60s TTL locked quotes.
- **Payroll Service** (`db-payroll`): Handles massive bulk salary disbursements via **BullMQ**.
- **Admin Service**: Operational dashboard for invariant checks and manual recovery.

## 🛠 Setup & Run
1. **Prerequisites**: Node.js 20+, Docker & Docker Compose.
2. **Setup Infrastructure**:
   ```bash
   docker-compose up -d
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Run Application**:
   ```bash
   npm run start:dev
   ```
   *Note: Environment variables are already configured in `.env` for local development.*

## 📑 API Summary (v1)

### 1. Account Service
- **POST `/api/v1/accounts/wallets`**: Create a wallet.
  ```json
  { "userId": "user-123", "ownerName": "Karim Nova", "currency": "USD" }
  ```
- **GET `/api/v1/accounts/wallets`**: List all wallets.

### 2. Transaction Service
- **POST `/api/v1/transfers/international`**: Execute a transfer (Idempotent).
  ```json
  {
    "senderWalletId": "uuid-1",
    "receiverWalletId": "uuid-2",
    "amount": 250.00,
    "currency": "USD",
    "idempotencyKey": "unique-client-ref-1",
    "fxQuoteId": "optional-quote-uuid"
  }
  ```

### 3. FX Service
- **POST `/api/v1/fx/quote`**: Issue a locked rate quote (60s TTL).
  ```json
  { "baseCurrency": "USD", "quoteCurrency": "EUR", "amount": 1000.00 }
  ```

### 4. Payroll Service
- **POST `/api/v1/payroll/bulk`**: Queue a bulk disbursement job.
  ```json
  {
    "employerWalletId": "uuid-1",
    "batchId": "pay-2026-dec",
    "disbursements": [
       { "employeeWalletId": "uuid-e1", "salary": 2000.00, "employeeReference": "EMP-001" },
       { "employeeWalletId": "uuid-e2", "salary": 2500.00, "employeeReference": "EMP-002" }
    ]
  }
  ```

## 🛡 Design Principles

### Idempotency (Full Handling of Scenarios A-E)
The `Transaction Service` implements a multi-step check against the `idempotency_keys` table. It handles:
- **Scenario B (Race condition):** Database `UNIQUE` constraints block multi-insertion. The "loser" requests receive a `409 Conflict`.
- **Scenario C (Crash recovery):** Dangling `PENDING` transactions are scanned and verified against `Ledger` entries.
- **Scenario E (Payload mismatch):** A SHA-256 fingerprint of the request is verified to prevent key hijacking.
*(Detailed explanations in [/decisions.md](./decisions.md))*

### Authoritative Double-Entry Ledger
The system calculates balances by summing all ledger entries (`SUM(CREDIT) - SUM(DEBIT)`). This ensures money is never created or destroyed.
- **Invariant Check:** A global `COUNT(SUM(DEBIT) != SUM(CREDIT))` alert is exposed in the Admin API.
- **Audit Hash Chain:** Each ledger entry stores the SHA-256 hash of the previous record, creating a tamper-evident audit trail.

### 60s FX Rate Locking
- **Zero Stale Prices:** Quotes are single-use and strictly expire after 60s.
- **Failure Resilience:** The system refuses to process if the external FX provider is unavailable. We NEVER use cached rates.

### Payroll Resumability
BullMQ with **Concurrency=1** per employer ensures we don't hit Row-level lock contention on the employer's wallet.
- **Resumability:** Since each employee payout uses a deterministic idempotency key (`batchId-employeeRef`), the job can be safely retried. Already-paid employees will return the cached success response.

## 📉 Tracing & Metrics
- **Metrics (Prometheus + Grafana):** Exposed on `:3000/metrics`. Monitors throughput, failure rates, and ledger invariant violations.
- **Tracing (Jaeger):** End-to-end tracing using OpenTelemetry. Follow a transfer from the Gateway through Orchestration and Ledger writes.

---
## 📦 CI/CD Pipeline
GitHub Actions in `.github/workflows/ci.yml` implements a sparse build strategy:
- Only rebuilds services with modified files.
- Blocks merge on test failure or build failure.
- Auto-tags Docker images with semantic versions from `package.json`.

---
## ⚖ Tradeoffs & Production Roadmap
### Tradeoffs
- **Modular Monolith for Local:** Implemented as modules within one project but with **strictly isolated database connections** (satisfied Requirement 1 without the networking overhead of separate processes for local development).
- **Mock FX Provider:** Uses a static rate table with a "Down" state simulator in environment variables.

### Production Readiness
- **Vault/KMS:** Move the encryption master key to a dedicated HSM.
- **Shard Ledger:** Scale `ledger_entries` using time-bucketed partitioning in PostgreSQL.
- **Saga Patterns:** For larger scale, move Orchestration to an asynchronous state machine.
