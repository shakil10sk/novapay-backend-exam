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
var TransactionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("./entities/transaction.entity");
const idempotency_key_entity_1 = require("./entities/idempotency-key.entity");
const account_service_1 = require("../account/account.service");
const ledger_service_1 = require("../ledger/ledger.service");
const fx_service_1 = require("../fx/fx.service");
const hash_util_1 = require("../common/utils/hash.util");
const metrics_service_1 = require("../metrics/metrics.service");
const config_1 = require("@nestjs/config");
let TransactionService = TransactionService_1 = class TransactionService {
    constructor(transactionRepo, idempotencyRepo, dataSource, accountService, ledgerService, fxService, metricsService, configService) {
        this.transactionRepo = transactionRepo;
        this.idempotencyRepo = idempotencyRepo;
        this.dataSource = dataSource;
        this.accountService = accountService;
        this.ledgerService = ledgerService;
        this.fxService = fxService;
        this.metricsService = metricsService;
        this.configService = configService;
        this.logger = new common_1.Logger(TransactionService_1.name);
    }
    async executeTransfer(dto) {
        const payloadHash = (0, hash_util_1.hashPayload)(dto);
        const ttlHours = +this.configService.get('IDEMPOTENCY_TTL_HOURS', '24');
        const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
        let idempKey = await this.idempotencyRepo.findOne({ where: { key: dto.idempotencyKey } });
        if (idempKey) {
            if (new Date() > idempKey.expiresAt) {
                this.logger.log(`Idempotency key expired: ${dto.idempotencyKey}. Treating as new.`);
                await this.idempotencyRepo.delete(idempKey.id);
                idempKey = null;
            }
            else {
                if (idempKey.payloadHash !== payloadHash) {
                    throw new common_1.UnprocessableEntityException('Idempotency key payload mismatch. This key was already used for a different request.');
                }
                if (idempKey.status === idempotency_key_entity_1.IdempotencyStatus.PROCESSING) {
                    this.metricsService.idempotencyHits.inc();
                    throw new common_1.ConflictException('A request with this key is already being processed.');
                }
                if (idempKey.status === idempotency_key_entity_1.IdempotencyStatus.COMPLETED) {
                    this.metricsService.idempotencyHits.inc();
                    this.logger.log(`Duplicate request detected: ${dto.idempotencyKey}. Returning cached response.`);
                    return JSON.parse(idempKey.responseBody);
                }
            }
        }
        try {
            idempKey = this.idempotencyRepo.create({
                key: dto.idempotencyKey,
                payloadHash,
                status: idempotency_key_entity_1.IdempotencyStatus.PROCESSING,
                expiresAt,
            });
            idempKey = await this.idempotencyRepo.save(idempKey);
        }
        catch (err) {
            const existing = await this.idempotencyRepo.findOne({ where: { key: dto.idempotencyKey } });
            if (existing && existing.status === idempotency_key_entity_1.IdempotencyStatus.PROCESSING) {
                throw new common_1.ConflictException('A request with this key is already being processed.');
            }
            throw new common_1.ConflictException('Concurrent request race lost.');
        }
        this.metricsService.transactionTotal.inc({ currency: dto.currency, type: transaction_entity_1.TransactionType.DOMESTIC });
        try {
            const result = await this.orchestrateTransaction(dto);
            idempKey.status = idempotency_key_entity_1.IdempotencyStatus.COMPLETED;
            idempKey.transactionId = result.id;
            idempKey.responseBody = JSON.stringify(result);
            await this.idempotencyRepo.save(idempKey);
            return result;
        }
        catch (err) {
            idempKey.status = idempotency_key_entity_1.IdempotencyStatus.FAILED;
            await this.idempotencyRepo.save(idempKey);
            this.metricsService.transactionFailed.inc({ reason: err.message });
            throw err;
        }
    }
    async orchestrateTransaction(dto) {
        const sender = await this.accountService.getWalletById(dto.senderWalletId);
        const receiver = await this.accountService.getWalletById(dto.receiverWalletId);
        const senderBalance = await this.ledgerService.getBalance(dto.senderWalletId);
        if (senderBalance.balance < dto.amount) {
            throw new common_1.BadRequestException('Insufficient funds in sender wallet.');
        }
        let fxRate = '1.0';
        let creditAmount = dto.amount;
        if (dto.fxQuoteId) {
            const quote = await this.fxService.consumeQuote(dto.fxQuoteId, 'PENDING_TXN');
            if (quote.baseCurrency !== sender.currency || quote.quoteCurrency !== receiver.currency) {
                throw new common_1.BadRequestException('FX quote currency mismatch with wallet currencies.');
            }
            fxRate = quote.rate;
            creditAmount = Number(quote.amountQuote);
        }
        else if (sender.currency !== receiver.currency) {
            throw new common_1.BadRequestException('FX quote ID is required for cross-currency transfers.');
        }
        const txn = this.transactionRepo.create({
            senderWalletId: dto.senderWalletId,
            receiverWalletId: dto.receiverWalletId,
            amount: String(dto.amount),
            currency: dto.currency,
            type: dto.fxQuoteId ? transaction_entity_1.TransactionType.INTERNATIONAL : transaction_entity_1.TransactionType.DOMESTIC,
            status: transaction_entity_1.TransactionStatus.PENDING,
            fxQuoteId: dto.fxQuoteId,
            fxRate,
            idempotencyKey: dto.idempotencyKey,
            description: dto.description,
        });
        const savedTxn = await this.transactionRepo.save(txn);
        try {
            await this.ledgerService.postDoubleEntry({
                transactionId: savedTxn.id,
                debit: {
                    walletId: dto.senderWalletId,
                    type: 'DEBIT',
                    amount: dto.amount,
                    currency: sender.currency,
                    accountName: sender.ownerName,
                    description: `Transfer to ${receiver.ownerName}`,
                },
                credit: {
                    walletId: dto.receiverWalletId,
                    type: 'CREDIT',
                    amount: creditAmount,
                    currency: receiver.currency,
                    accountName: receiver.ownerName,
                    description: `Transfer from ${sender.ownerName}`,
                    fxRate: Number(fxRate),
                },
            });
            this.accountService.updateBalanceSnapshot(sender.id, String(senderBalance.balance - dto.amount)).catch(() => { });
            this.ledgerService.getBalance(receiver.id).then(b => this.accountService.updateBalanceSnapshot(receiver.id, String(b.balance))).catch(() => { });
            savedTxn.status = transaction_entity_1.TransactionStatus.COMPLETED;
            savedTxn.debitCompletedAt = new Date();
            savedTxn.creditCompletedAt = new Date();
            return await this.transactionRepo.save(savedTxn);
        }
        catch (err) {
            this.logger.error(`Transaction orchestration failed for txn=${savedTxn.id}: ${err.message}`);
            savedTxn.status = transaction_entity_1.TransactionStatus.FAILED;
            savedTxn.failureReason = err.message;
            await this.transactionRepo.save(savedTxn);
            throw err;
        }
    }
    async runCrashRecovery() {
        const twentySecondsAgo = new Date(Date.now() - 20000);
        const pendingTransactions = await this.transactionRepo.find({
            where: {
                status: transaction_entity_1.TransactionStatus.PENDING,
                createdAt: (0, typeorm_2.LessThan)(twentySecondsAgo),
            },
        });
        for (const txn of pendingTransactions) {
            this.logger.warn(`Recovering dangling transaction: ${txn.id}`);
            const entries = await this.ledgerService.getEntriesByTransaction(txn.id);
            if (entries.length === 2) {
                txn.status = transaction_entity_1.TransactionStatus.COMPLETED;
                txn.debitCompletedAt = entries[0].createdAt;
                txn.creditCompletedAt = entries[1].createdAt;
                await this.transactionRepo.save(txn);
                this.logger.log(`Recovered: Set txn=${txn.id} to COMPLETED (found ledger entries).`);
            }
            else {
                txn.status = transaction_entity_1.TransactionStatus.FAILED;
                txn.failureReason = 'Server crash detected during execution. Entries incomplete.';
                await this.transactionRepo.save(txn);
                this.logger.log(`Recovered: Set txn=${txn.id} to FAILED (ledger entries missing).`);
            }
        }
    }
    async getTransaction(id) {
        return this.transactionRepo.findOne({ where: { id } });
    }
    async listTransactions() {
        return this.transactionRepo.find({ order: { createdAt: 'DESC' }, take: 100 });
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = TransactionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction, 'transactionConnection')),
    __param(1, (0, typeorm_1.InjectRepository)(idempotency_key_entity_1.IdempotencyKey, 'transactionConnection')),
    __param(2, (0, common_1.Inject)('TRANSACTION_DATA_SOURCE')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        account_service_1.AccountService,
        ledger_service_1.LedgerService,
        fx_service_1.FxService,
        metrics_service_1.MetricsService,
        config_1.ConfigService])
], TransactionService);
//# sourceMappingURL=transaction.service.js.map