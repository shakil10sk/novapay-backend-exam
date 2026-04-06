import {
    Injectable,
    ConflictException,
    UnprocessableEntityException,
    BadRequestException,
    Logger,
    Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, LessThan } from 'typeorm';
import { Transaction, TransactionStatus, TransactionType } from './entities/transaction.entity';
import { IdempotencyKey, IdempotencyStatus } from './entities/idempotency-key.entity';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { AccountService } from '../account/account.service';
import { LedgerService } from '../ledger/ledger.service';
import { FxService } from '../fx/fx.service';
import { hashPayload } from '../common/utils/hash.util';
import { MetricsService } from '../metrics/metrics.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TransactionService {
    private readonly logger = new Logger(TransactionService.name);

    constructor(
        @InjectRepository(Transaction, 'transactionConnection')
        private readonly transactionRepo: Repository<Transaction>,
        @InjectRepository(IdempotencyKey, 'transactionConnection')
        private readonly idempotencyRepo: Repository<IdempotencyKey>,
        @Inject('TRANSACTION_DATA_SOURCE')
        private readonly dataSource: DataSource,
        private readonly accountService: AccountService,
        private readonly ledgerService: LedgerService,
        private readonly fxService: FxService,
        private readonly metricsService: MetricsService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Main transfer entry point with full idempotency and atomicity logic.
     */
    async executeTransfer(dto: CreateTransferDto): Promise<any> {
        const payloadHash = hashPayload(dto);
        const ttlHours = +this.configService.get('IDEMPOTENCY_TTL_HOURS', '24');
        const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

        // 1. Idempotency Check (Scenarios A, B, D, E)
        let idempKey = await this.idempotencyRepo.findOne({ where: { key: dto.idempotencyKey } });

        if (idempKey) {
            // Scenario D: TTL Expiry
            if (new Date() > idempKey.expiresAt) {
                this.logger.log(`Idempotency key expired: ${dto.idempotencyKey}. Treating as new.`);
                await this.idempotencyRepo.delete(idempKey.id);
                idempKey = null;
            } else {
                // Scenario E: Payload Mismatch
                if (idempKey.payloadHash !== payloadHash) {
                    throw new UnprocessableEntityException('Idempotency key payload mismatch. This key was already used for a different request.');
                }

                // Scenario A/B: Concurrent or repeated request
                if (idempKey.status === IdempotencyStatus.PROCESSING) {
                    this.metricsService.idempotencyHits.inc();
                    throw new ConflictException('A request with this key is already being processed.');
                }

                if (idempKey.status === IdempotencyStatus.COMPLETED) {
                    this.metricsService.idempotencyHits.inc();
                    this.logger.log(`Duplicate request detected: ${dto.idempotencyKey}. Returning cached response.`);
                    return JSON.parse(idempKey.responseBody);
                }
            }
        }

        // Attempt to create idempotency record to lock the key (Scenario B: DB unique constraint race handling)
        try {
            idempKey = this.idempotencyRepo.create({
                key: dto.idempotencyKey,
                payloadHash,
                status: IdempotencyStatus.PROCESSING,
                expiresAt,
            });
            idempKey = await this.idempotencyRepo.save(idempKey);
        } catch (err) {
            // If concurrent insert fails, fetch existing and re-check (Scenario B)
            const existing = await this.idempotencyRepo.findOne({ where: { key: dto.idempotencyKey } });
            if (existing && existing.status === IdempotencyStatus.PROCESSING) {
                throw new ConflictException('A request with this key is already being processed.');
            }
            throw new ConflictException('Concurrent request race lost.');
        }

        this.metricsService.transactionTotal.inc({ currency: dto.currency, type: TransactionType.DOMESTIC });

        try {
            const result = await this.orchestrateTransaction(dto);

            // Cache response and mark as completed
            idempKey.status = IdempotencyStatus.COMPLETED;
            idempKey.transactionId = result.id;
            idempKey.responseBody = JSON.stringify(result);
            await this.idempotencyRepo.save(idempKey);

            return result;
        } catch (err) {
            idempKey.status = IdempotencyStatus.FAILED;
            await this.idempotencyRepo.save(idempKey);
            this.metricsService.transactionFailed.inc({ reason: err.message });
            throw err;
        }
    }

    /**
     * Orchestrates the actual balance checks, FX consumes, and ledger writes.
     * Atomicity (Scenario C) is handled by individual service transactions
     * and the master orchestration status.
     */
    private async orchestrateTransaction(dto: CreateTransferDto): Promise<Transaction> {
        const sender = await this.accountService.getWalletById(dto.senderWalletId);
        const receiver = await this.accountService.getWalletById(dto.receiverWalletId);

        // Validate balances via authoritative Ledger service
        const senderBalance = await this.ledgerService.getBalance(dto.senderWalletId);
        if (senderBalance.balance < dto.amount) {
            throw new BadRequestException('Insufficient funds in sender wallet.');
        }

        let fxRate = '1.0';
        let creditAmount = dto.amount;

        // Handle FX rate locking (Problem 3)
        if (dto.fxQuoteId) {
            const quote = await this.fxService.consumeQuote(dto.fxQuoteId, 'PENDING_TXN');
            if (quote.baseCurrency !== sender.currency || quote.quoteCurrency !== receiver.currency) {
                throw new BadRequestException('FX quote currency mismatch with wallet currencies.');
            }
            fxRate = quote.rate;
            creditAmount = Number(quote.amountQuote);
        } else if (sender.currency !== receiver.currency) {
            throw new BadRequestException('FX quote ID is required for cross-currency transfers.');
        }

        // Create persistent transaction record to track progress (Scenario C Recovery base)
        const txn = this.transactionRepo.create({
            senderWalletId: dto.senderWalletId,
            receiverWalletId: dto.receiverWalletId,
            amount: String(dto.amount),
            currency: dto.currency,
            type: dto.fxQuoteId ? TransactionType.INTERNATIONAL : TransactionType.DOMESTIC,
            status: TransactionStatus.PENDING,
            fxQuoteId: dto.fxQuoteId,
            fxRate,
            idempotencyKey: dto.idempotencyKey,
            description: dto.description,
        });

        const savedTxn = await this.transactionRepo.save(txn);

        try {
            // Problem 1: Atomic Double-Entry (Problem 1, Problem 3 Single-use quote recorded)
            await this.ledgerService.postDoubleEntry({
                transactionId: savedTxn.id,
                debit: {
                    walletId: dto.senderWalletId,
                    type: 'DEBIT' as any,
                    amount: dto.amount,
                    currency: sender.currency,
                    accountName: sender.ownerName,
                    description: `Transfer to ${receiver.ownerName}`,
                },
                credit: {
                    walletId: dto.receiverWalletId,
                    type: 'CREDIT' as any,
                    amount: creditAmount,
                    currency: receiver.currency,
                    accountName: receiver.ownerName,
                    description: `Transfer from ${sender.ownerName}`,
                    fxRate: Number(fxRate),
                },
            });

            // Update cached snaphosts in background (not critical if fails, ledger is truth)
            this.accountService.updateBalanceSnapshot(sender.id, String(senderBalance.balance - dto.amount)).catch(() => { });
            this.ledgerService.getBalance(receiver.id).then(b =>
                this.accountService.updateBalanceSnapshot(receiver.id, String(b.balance))
            ).catch(() => { });

            savedTxn.status = TransactionStatus.COMPLETED;
            savedTxn.debitCompletedAt = new Date();
            savedTxn.creditCompletedAt = new Date();
            return await this.transactionRepo.save(savedTxn);

        } catch (err) {
            this.logger.error(`Transaction orchestration failed for txn=${savedTxn.id}: ${err.message}`);
            savedTxn.status = TransactionStatus.FAILED;
            savedTxn.failureReason = err.message;
            await this.transactionRepo.save(savedTxn);
            throw err;
        }
    }

    /**
     * Scenario C: Recovery Mechanism
     * This would typically be run by a cron job. It scans for PENDING 
     * transactions and verifies if the ledger rows exist.
     */
    async runCrashRecovery(): Promise<void> {
        const twentySecondsAgo = new Date(Date.now() - 20000);
        const pendingTransactions = await this.transactionRepo.find({
            where: {
                status: TransactionStatus.PENDING,
                createdAt: LessThan(twentySecondsAgo),
            },
        });

        for (const txn of pendingTransactions) {
            this.logger.warn(`Recovering dangling transaction: ${txn.id}`);
            const entries = await this.ledgerService.getEntriesByTransaction(txn.id);

            if (entries.length === 2) {
                // Entries were written, but server crashed before updating status
                txn.status = TransactionStatus.COMPLETED;
                txn.debitCompletedAt = entries[0].createdAt;
                txn.creditCompletedAt = entries[1].createdAt;
                await this.transactionRepo.save(txn);
                this.logger.log(`Recovered: Set txn=${txn.id} to COMPLETED (found ledger entries).`);
            } else {
                // Incomplete or no entries (Atomicity failure) -> Mark as failed to allow user retry
                txn.status = TransactionStatus.FAILED;
                txn.failureReason = 'Server crash detected during execution. Entries incomplete.';
                await this.transactionRepo.save(txn);
                this.logger.log(`Recovered: Set txn=${txn.id} to FAILED (ledger entries missing).`);
            }
        }
    }

    async getTransaction(id: string): Promise<Transaction> {
        return this.transactionRepo.findOne({ where: { id } });
    }

    async listTransactions(): Promise<Transaction[]> {
        return this.transactionRepo.find({ order: { createdAt: 'DESC' }, take: 100 });
    }
}
