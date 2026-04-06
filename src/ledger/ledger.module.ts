import { Module } from '@nestjs/common';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { LedgerService } from './ledger.service';
import { LedgerController } from './ledger.controller';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
    imports: [
        MetricsModule,
        TypeOrmModule.forRootAsync({
            name: 'ledgerConnection',
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                type: 'postgres',
                host: cfg.get('LEDGER_DB_HOST', 'localhost'),
                port: +cfg.get('LEDGER_DB_PORT', '5434'),
                username: cfg.get('LEDGER_DB_USER', 'root'),
                password: cfg.get('LEDGER_DB_PASS', 'password'),
                database: cfg.get('LEDGER_DB_NAME', 'novapay_ledger'),
                entities: [LedgerEntry],
                synchronize: true,
                logging: cfg.get('NODE_ENV') !== 'production',
            }),
        }),
        TypeOrmModule.forFeature([LedgerEntry], 'ledgerConnection'),
    ],
    controllers: [LedgerController],
    providers: [
        LedgerService,
        {
            provide: 'LEDGER_DATA_SOURCE',
            useFactory: (dataSource: DataSource) => dataSource,
            inject: [getDataSourceToken('ledgerConnection')],
        },
    ],
    exports: [LedgerService],
})
export class LedgerModule { }
