import {
  Injectable,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LedgerEntry, EntryType } from './entities/ledger-entry.entity';
import { PostDoubleEntryDto } from './dto/post-entry.dto';
import { hashLedgerEntry } from '../common/utils/hash.util';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(
    @InjectRepository(LedgerEntry, 'ledgerConnection')
    private readonly ledgerRepo: Repository<LedgerEntry>,
    @Inject('LEDGER_DATA_SOURCE')
    private readonly dataSource: DataSource,
    private readonly metricsService: MetricsService,
  ) {}

  /**
   * Posts a double-entry pair atomically in a single DB transaction.
   * Debit amount MUST equal Credit amount — any mismatch is rejected.
   * This is the ONLY method that writes to the ledger.
   */
  async postDoubleEntry(dto: PostDoubleEntryDto): Promise<LedgerEntry[]> {
    const debitAmount = Number(dto.debit.amount);
    const creditAmount = Number(dto.credit.amount);

    // Invariant check: debit must equal credit
    if (Math.abs(debitAmount - creditAmount) > 0.000001) {
      this.metricsService.ledgerInvariantViolations.inc();
      this.logger.error(
        `LEDGER INVARIANT VIOLATION: debit=${debitAmount} != credit=${creditAmount} for txn=${dto.transactionId}`,
      );
      throw new BadRequestException(
        'Ledger invariant violated: debit amount must equal credit amount',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(LedgerEntry);

      // Get the last entry for audit chain
      const lastEntry = await repo.findOne({
        where: {},
        order: { createdAt: 'DESC' },
      });
      const previousHash = lastEntry?.auditHash || '0'.repeat(64);

      // Create DEBIT entry
      const debitEntry = repo.create({
        transactionId: dto.transactionId,
        walletId: dto.debit.walletId,
        type: EntryType.DEBIT,
        amount: String(debitAmount),
        currency: dto.debit.currency,
        accountName: dto.debit.accountName,
        description: dto.debit.description,
        fxRate: dto.debit.fxRate ? String(dto.debit.fxRate) : null,
        previousHash,
      });
      const savedDebit = await repo.save(debitEntry);

      // Compute debit audit hash
      savedDebit.auditHash = hashLedgerEntry({
        previousHash,
        entryId: savedDebit.id,
        amount: savedDebit.amount,
        type: savedDebit.type,
        walletId: savedDebit.walletId,
        transactionId: savedDebit.transactionId,
        createdAt: savedDebit.createdAt.toISOString(),
      });
      await repo.save(savedDebit);

      // Create CREDIT entry
      const creditEntry = repo.create({
        transactionId: dto.transactionId,
        walletId: dto.credit.walletId,
        type: EntryType.CREDIT,
        amount: String(creditAmount),
        currency: dto.credit.currency,
        accountName: dto.credit.accountName,
        description: dto.credit.description,
        fxRate: dto.credit.fxRate ? String(dto.credit.fxRate) : null,
        previousHash: savedDebit.auditHash,
      });
      const savedCredit = await repo.save(creditEntry);

      savedCredit.auditHash = hashLedgerEntry({
        previousHash: savedDebit.auditHash,
        entryId: savedCredit.id,
        amount: savedCredit.amount,
        type: savedCredit.type,
        walletId: savedCredit.walletId,
        transactionId: savedCredit.transactionId,
        createdAt: savedCredit.createdAt.toISOString(),
      });
      await repo.save(savedCredit);

      this.logger.log(
        `Double-entry posted: txn=${dto.transactionId} debit=${debitAmount} credit=${creditAmount}`,
      );

      return [savedDebit, savedCredit];
    });
  }

  /**
   * Computes the authoritative balance for a wallet.
   * Balance = SUM(CREDIT) - SUM(DEBIT)
   */
  async getBalance(
    walletId: string,
  ): Promise<{ walletId: string; balance: number; currency: string }> {
    const rawResult: unknown = await this.ledgerRepo
      .createQueryBuilder('e')
      .select(
        `SUM(CASE WHEN e.type = 'CREDIT' THEN e.amount::numeric ELSE -e.amount::numeric END)`,
        'balance',
      )
      .addSelect('e.currency', 'currency')
      .where('e.wallet_id = :walletId', { walletId })
      .groupBy('e.currency')
      .getRawOne();
    const result = rawResult as
      | { balance?: string; currency?: string }
      | undefined;

    return {
      walletId,
      balance: Number(result?.balance || 0),
      currency: result?.currency || 'USD',
    };
  }

  /**
   * Returns paginated transaction history — read from pre-built ledger rows,
   * never a live aggregation across millions of rows.
   */
  async getTransactionHistory(
    walletId: string,
    page = 1,
    limit = 20,
  ): Promise<{ entries: LedgerEntry[]; total: number; page: number }> {
    const [entries, total] = await this.ledgerRepo.findAndCount({
      where: { walletId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { entries, total, page };
  }

  /**
   * Verifies the audit hash chain for a wallet's ledger entries.
   * Returns false + the offending entry if tampering is detected.
   */
  async verifyAuditChain(walletId: string): Promise<{
    valid: boolean;
    tamperedEntryId?: string;
    message: string;
  }> {
    const entries = await this.ledgerRepo.find({
      where: { walletId },
      order: { createdAt: 'ASC' },
    });

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const expectedHash = hashLedgerEntry({
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

  async getEntriesByTransaction(transactionId: string): Promise<LedgerEntry[]> {
    return this.ledgerRepo.find({
      where: { transactionId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Checks global invariant: total debits must equal total credits across ALL entries.
   */
  async checkGlobalInvariant(): Promise<{
    balanced: boolean;
    totalDebits: number;
    totalCredits: number;
    delta: number;
  }> {
    const rawTotals: unknown = await this.ledgerRepo
      .createQueryBuilder('e')
      .select(
        `SUM(CASE WHEN e.type = 'DEBIT' THEN e.amount::numeric ELSE 0 END)`,
        'totalDebits',
      )
      .addSelect(
        `SUM(CASE WHEN e.type = 'CREDIT' THEN e.amount::numeric ELSE 0 END)`,
        'totalCredits',
      )
      .getRawOne();
    const result = rawTotals as
      | { totalDebits?: string; totalCredits?: string }
      | undefined;

    const totalDebits = Number(result?.totalDebits || 0);
    const totalCredits = Number(result?.totalCredits || 0);
    const delta = Math.abs(totalDebits - totalCredits);
    const balanced = delta < 0.000001;

    if (!balanced) {
      this.metricsService.ledgerInvariantViolations.inc();
      this.logger.error(
        `CRITICAL: Global ledger invariant violated! Debits=${totalDebits} Credits=${totalCredits} Delta=${delta}`,
      );
    }

    return { balanced, totalDebits, totalCredits, delta };
  }
}
