import { Injectable } from '@nestjs/common';
import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
  register,
} from 'prom-client';

@Injectable()
export class MetricsService {
  readonly registry: Registry;

  readonly transactionTotal: Counter;
  readonly transactionFailed: Counter;
  readonly ledgerInvariantViolations: Counter;
  readonly apiLatency: Histogram;
  readonly fxProviderFailures: Counter;
  readonly idempotencyHits: Counter;
  readonly payrollJobsQueued: Counter;
  readonly payrollJobsCompleted: Counter;
  readonly payrollJobsFailed: Counter;

  constructor() {
    this.registry = register;
    collectDefaultMetrics({ register: this.registry });

    this.transactionTotal = new Counter({
      name: 'novapay_transactions_total',
      help: 'Total number of transactions initiated',
      labelNames: ['currency', 'type'],
    });

    this.transactionFailed = new Counter({
      name: 'novapay_transactions_failed_total',
      help: 'Total number of failed transactions',
      labelNames: ['reason'],
    });

    this.ledgerInvariantViolations = new Counter({
      name: 'novapay_ledger_invariant_violations_total',
      help: 'CRITICAL: Number of times debit != credit in ledger (money created/destroyed)',
    });

    this.apiLatency = new Histogram({
      name: 'novapay_api_request_duration_seconds',
      help: 'API request duration in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    });

    this.fxProviderFailures = new Counter({
      name: 'novapay_fx_provider_failures_total',
      help: 'Total FX provider failures',
    });

    this.idempotencyHits = new Counter({
      name: 'novapay_idempotency_hits_total',
      help: 'Number of duplicate requests blocked by idempotency',
    });

    this.payrollJobsQueued = new Counter({
      name: 'novapay_payroll_jobs_queued_total',
      help: 'Total payroll disbursement jobs queued',
    });

    this.payrollJobsCompleted = new Counter({
      name: 'novapay_payroll_jobs_completed_total',
      help: 'Total payroll disbursement jobs completed',
    });

    this.payrollJobsFailed = new Counter({
      name: 'novapay_payroll_jobs_failed_total',
      help: 'Total payroll disbursement jobs failed',
    });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
