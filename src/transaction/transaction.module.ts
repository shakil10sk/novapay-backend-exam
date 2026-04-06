import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { IdempotencyKey } from './entities/idempotency-key.entity';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { AccountModule } from '../account/account.module';
import { LedgerModule } from '../ledger/ledger.module';
import { FxModule } from '../fx/fx.module';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
    imports: [
        MetricsModule,
        AccountModule,
        LedgerModule,
        FxModule,
        TypeOrmModule.forRootAsync({
            name: 'transactionConnection',
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                type: 'postgres',
                host: cfg.get('TRANSACTION_DB_HOST', 'localhost'),
                port: +cfg.get('TRANSACTION_DB_PORT', '5435'),
                username: cfg.get('TRANSACTION_DB_USER', 'root'),
                password: cfg.get('TRANSACTION_DB_PASS', 'password'),
                database: cfg.get('TRANSACTION_DB_NAME', 'novapay_txn'),
                entities: [Transaction, IdempotencyKey],
                synchronize: true,
            }),
        }),
        TypeOrmModule.forFeature([Transaction, IdempotencyKey], 'transactionConnection'),
    ],
    controllers: [TransactionController],
    providers: [
        TransactionService,
        {
            provide: 'TRANSACTION_DATA_SOURCE',
            useFactory: (dataSource: DataSource) => dataSource,
            inject: [getDataSourceToken('transactionConnection')],
        },
    ],
    exports: [TransactionService],
})
export class TransactionModule { }
