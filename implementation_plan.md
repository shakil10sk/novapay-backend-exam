# NovaPay Backend Implementation Plan

## Architecture Overview
We will implement a **NestJS Microservices Monorepo**.
- **API Gateway**: Entry point for all frontend traffic, proxies to services via internal REST or TCP.
- **Account Service**: Manages users and account balances. Own DB (`novapay_account`).
- **Ledger Service**: Source of truth. Handles double-entry logic. Own DB (`novapay_ledger`).
- **Transaction Service**: Orchestrator, idempotency handler. Own DB (`novapay_txn`).
- **FX Service**: Rate fetching, issuing 60s TTL quotes. Own DB (`novapay_fx`).
- **Payroll Service**: Bulk job queueing using BullMQ. Own DB (`novapay_payroll`).

Each service will have its own independent PostgreSQL database (logical databases in a single Postgres container for local dev).

## Task List

### Task 1: Project Setup and Monorepo Conversion
- [ ] Convert the existing NestJS standard app into a NestJS Monorepo.
- [ ] Generate applications: `gateway`, `account`, `ledger`, `transaction`, `fx`, `payroll`.
- [ ] Setup `docker-compose.yml` to provision multiple databases (`POSTGRES_DB` init script), Redis, Prometheus, Grafana, and Jaeger.
- [ ] Configure TypeORM for each service connecting to its respective database.
- [ ] Setup tracing (OpenTelemetry) and metrics (Prometheus).

### Task 2: Service Models & Interfaces
- [ ] **FX Service**: `FxQuote` model (id, base, quote, rate, expiresAt, used).
- [ ] **Ledger Service**: `LedgerEntry` model (encrypted fields for sensitive data), dual-entry transactions.
- [ ] **Transaction Service**: `Transaction` model, `IdempotencyKey` model (with hash payload).
- [ ] **Account Service**: `Wallet` model.
- [ ] **Payroll Service**: `PayrollJob` model.

### Task 3: Problem 1 - Idempotency
- [ ] Build idempotent HTTP interceptor/guard in the API Gateway or Transaction service.
- [ ] Store `idempotency_keys` with DB unqiue constraints to handle race conditions (Scenario A, B).
- [ ] Handle Atomicity (Scenario C) by logging intent in Transaction DB and using a transactional outbox/saga pattern or relying on Ledger Service's atomic dual-entry commit.
- [ ] Hash payload to detect mismatches (Scenario E).
- [ ] Manage 24-hour expiration for keys (Scenario D).

### Task 4: Problem 2 - Bulk Payroll Queue
- [ ] Setup BullMQ in Payroll service.
- [ ] Configure concurrency per account (grouping/partitioning) to 1.
- [ ] Job processor coordinates with Transaction service.

### Task 5: Problem 3 - FX Rate Locking
- [ ] Implement `POST /fx/quote` to create a 60s TTL quote in DB.
- [ ] Implement `GET /fx/quote/:id` to check valid TTL.
- [ ] Enforce single-use in Transaction execution by making FX service invalidate quote idempotently upon transfer.

### Task 6: Problem 4 - Field-Level Encryption
- [ ] Create TypeORM `ValueTransformer` to encrypt/decrypt sensitive fields transparently using AES-256-GCM.

### Task 7: Observability
- [ ] Add Prometheus counter for ledger invariant checks.
- [ ] Instrument NestJS with Jaeger for end-to-end trace.

### Task 8: Verification & Testing
- [ ] E2E tests simulating the 5 idempotency scenarios.
- [ ] Unit tests for all services.
- [ ] Fix CI/CD pipeline logic.
