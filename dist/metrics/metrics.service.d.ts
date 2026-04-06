import { Counter, Histogram, Registry } from 'prom-client';
export declare class MetricsService {
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
    constructor();
    getMetrics(): Promise<string>;
}
