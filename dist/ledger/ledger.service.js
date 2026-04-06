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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LedgerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ledger_entry_entity_1 = require("./entities/ledger-entry.entity");
const hash_util_1 = require("../common/utils/hash.util");
const metrics_service_1 = require("../metrics/metrics.service");
let LedgerService = LedgerService_1 = class LedgerService {
    constructor(ledgerRepo, dataSource, metricsService) {
        this.ledgerRepo = ledgerRepo;
        this.dataSource = dataSource;
        this.metricsService = metricsService;
        this.logger = new common_1.Logger(LedgerService_1.name);
    }
    async postDoubleEntry(dto) {
        const debitAmount = Number(dto.debit.amount);
        const creditAmount = Number(dto.credit.amount);
        if (Math.abs(debitAmount - creditAmount) > 0.000001) {
            this.metricsService.ledgerInvariantViolations.inc();
            this.logger.error(`LEDGER INVARIANT VIOLATION: debit=${debitAmount} != credit=${creditAmount} for txn=${dto.transactionId}`);
            throw new common_1.BadRequestException('Ledger invariant violated: debit amount must equal credit amount');
        }
        return this.dataSource.transaction(async (manager) => {
            const repo = manager.getRepository(ledger_entry_entity_1.LedgerEntry);
            const lastEntry = await repo.findOne({
                where: {},
                order: { createdAt: 'DESC' },
            });
            const previousHash = lastEntry?.auditHash || '0'.repeat(64);
            const debitEntry = repo.create({
                transactionId: dto.transactionId,
                walletId: dto.debit.walletId,
                type: ledger_entry_entity_1.EntryType.DEBIT,
                amount: String(debitAmount),
                currency: dto.debit.currency,
                accountName: dto.debit.accountName,
                description: dto.debit.description,
                fxRate: dto.debit.fxRate ? String(dto.debit.fxRate) : null,
                previousHash,
            });
            const savedDebit = await repo.save(debitEntry);
            savedDebit.auditHash = (0, hash_util_1.hashLedgerEntry)({
                previousHash,
                entryId: savedDebit.id,
                amount: savedDebit.amount,
                type: savedDebit.type,
                walletId: savedDebit.walletId,
                transactionId: savedDebit.transactionId,
                createdAt: savedDebit.createdAt.toISOString(),
            });
            await repo.save(savedDebit);
            const creditEntry = repo.create({
                transactionId: dto.transactionId,
                walletId: dto.credit.walletId,
                type: ledger_entry_entity_1.EntryType.CREDIT,
                amount: String(creditAmount),
                currency: dto.credit.currency,
                accountName: dto.credit.accountName,
                description: dto.credit.description,
                fxRate: dto.credit.fxRate ? String(dto.credit.fxRate) : null,
                previousHash: savedDebit.auditHash,
            });
            const savedCredit = await repo.save(creditEntry);
            savedCredit.auditHash = (0, hash_util_1.hashLedgerEntry)({
                previousHash: savedDebit.auditHash,
                entryId: savedCredit.id,
                amount: savedCredit.amount,
                type: savedCredit.type,
                walletId: savedCredit.walletId,
                transactionId: savedCredit.transactionId,
                createdAt: savedCredit.createdAt.toISOString(),
            });
            await repo.save(savedCredit);
            this.logger.log(`Double-entry posted: txn=${dto.transactionId} debit=${debitAmount} credit=${creditAmount}`);
            return [savedDebit, savedCredit];
        });
    }
    async getBalance(walletId) {
        const result = await this.ledgerRepo
            .createQueryBuilder('e')
            .select(`SUM(CASE WHEN e.type = 'CREDIT' THEN e.amount::numeric ELSE -e.amount::numeric END)`, 'balance')
            .addSelect('e.currency', 'currency')
            .where('e.wallet_id = :walletId', { walletId })
            .groupBy('e.currency')
            .getRawOne();
        return {
            walletId,
            balance: Number(result?.balance || 0),
            currency: result?.currency || 'USD',
        };
    }
    async getTransactionHistory(walletId, page = 1, limit = 20) {
        const [entries, total] = await this.ledgerRepo.findAndCount({
            where: { walletId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { entries, total, page };
    }
    async verifyAuditChain(walletId) {
        const entries = await this.ledgerRepo.find({
            where: { walletId },
            order: { createdAt: 'ASC' },
        });
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const expectedHash = (0, hash_util_1.hashLedgerEntry)({
                previousHash: entry.previousHash,
                entryId: entry.id,
                amount: entry.amount,
                type: entry.type,
                walletId: entry.walletId,
                transactionId: entry.transactionId,
                createdAt: entry.createdAt.toISOString(),
            });
            if (expectedHash !== entry.auditHash) {
                return {
                    valid: false,
                    tamperedEntryId: entry.id,
                    message: `Tampered entry detected at ID: ${entry.id}`,
                };
            }
        }
        return { valid: true, message: 'Audit chain intact' };
    }
    async getEntriesByTransaction(transactionId) {
        return this.ledgerRepo.find({ where: { transactionId }, order: { createdAt: 'ASC' } });
    }
    async checkGlobalInvariant() {
        const result = await this.ledgerRepo
            .createQueryBuilder('e')
            .select(`SUM(CASE WHEN e.type = 'DEBIT' THEN e.amount::numeric ELSE 0 END)`, 'totalDebits')
            .addSelect(`SUM(CASE WHEN e.type = 'CREDIT' THEN e.amount::numeric ELSE 0 END)`, 'totalCredits')
            .getRawOne();
        const totalDebits = Number(result?.totalDebits || 0);
        const totalCredits = Number(result?.totalCredits || 0);
        const delta = Math.abs(totalDebits - totalCredits);
        const balanced = delta < 0.000001;
        if (!balanced) {
            this.metricsService.ledgerInvariantViolations.inc();
            this.logger.error(`CRITICAL: Global ledger invariant violated! Debits=${totalDebits} Credits=${totalCredits} Delta=${delta}`);
        }
        return { balanced, totalDebits, totalCredits, delta };
    }
};
exports.LedgerService = LedgerService;
exports.LedgerService = LedgerService = LedgerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ledger_entry_entity_1.LedgerEntry, 'ledgerConnection')),
    __param(1, (0, common_1.Inject)('LEDGER_DATA_SOURCE')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource,
        metrics_service_1.MetricsService])
], LedgerService);
//# sourceMappingURL=ledger.service.js.map