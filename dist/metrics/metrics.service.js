"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const prom_client_1 = require("prom-client");
let MetricsService = class MetricsService {
    constructor() {
        this.registry = prom_client_1.register;
        (0, prom_client_1.collectDefaultMetrics)({ register: this.registry });
        this.transactionTotal = new prom_client_1.Counter({
            name: 'novapay_transactions_total',
            help: 'Total number of transactions initiated',
            labelNames: ['currency', 'type'],
        });
        this.transactionFailed = new prom_client_1.Counter({
            name: 'novapay_transactions_failed_total',
            help: 'Total number of failed transactions',
            labelNames: ['reason'],
        });
        this.ledgerInvariantViolations = new prom_client_1.Counter({
            name: 'novapay_ledger_invariant_violations_total',
            help: 'CRITICAL: Number of times debit != credit in ledger (money created/destroyed)',
        });
        this.apiLatency = new prom_client_1.Histogram({
            name: 'novapay_api_request_duration_seconds',
            help: 'API request duration in seconds',
            labelNames: ['method', 'route', 'status'],
            buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
        });
        this.fxProviderFailures = new prom_client_1.Counter({
            name: 'novapay_fx_provider_failures_total',
            help: 'Total FX provider failures',
        });
        this.idempotencyHits = new prom_client_1.Counter({
            name: 'novapay_idempotency_hits_total',
            help: 'Number of duplicate requests blocked by idempotency',
        });
        this.payrollJobsQueued = new prom_client_1.Counter({
            name: 'novapay_payroll_jobs_queued_total',
            help: 'Total payroll disbursement jobs queued',
        });
        this.payrollJobsCompleted = new prom_client_1.Counter({
            name: 'novapay_payroll_jobs_completed_total',
            help: 'Total payroll disbursement jobs completed',
        });
        this.payrollJobsFailed = new prom_client_1.Counter({
            name: 'novapay_payroll_jobs_failed_total',
            help: 'Total payroll disbursement jobs failed',
        });
    }
    async getMetrics() {
        return this.registry.metrics();
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map