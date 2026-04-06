import { DataSource, Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { IdempotencyKey } from './entities/idempotency-key.entity';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { AccountService } from '../account/account.service';
import { LedgerService } from '../ledger/ledger.service';
import { FxService } from '../fx/fx.service';
import { MetricsService } from '../metrics/metrics.service';
import { ConfigService } from '@nestjs/config';
export declare class TransactionService {
    private readonly transactionRepo;
    private readonly idempotencyRepo;
    private readonly dataSource;
    private readonly accountService;
    private readonly ledgerService;
    private readonly fxService;
    private readonly metricsService;
    private readonly configService;
    private readonly logger;
    constructor(transactionRepo: Repository<Transaction>, idempotencyRepo: Repository<IdempotencyKey>, dataSource: DataSource, accountService: AccountService, ledgerService: LedgerService, fxService: FxService, metricsService: MetricsService, configService: ConfigService);
    executeTransfer(dto: CreateTransferDto): Promise<any>;
    private orchestrateTransaction;
    runCrashRecovery(): Promise<void>;
    getTransaction(id: string): Promise<Transaction>;
    listTransactions(): Promise<Transaction[]>;
}
