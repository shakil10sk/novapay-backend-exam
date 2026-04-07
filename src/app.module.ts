import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountModule } from './account/account.module';
import { LedgerModule } from './ledger/ledger.module';
import { TransactionModule } from './transaction/transaction.module';
import { FxModule } from './fx/fx.module';
import { PayrollModule } from './payroll/payroll.module';
import { MetricsModule } from './metrics/metrics.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MetricsModule,
    AccountModule,
    LedgerModule,
    TransactionModule,
    FxModule,
    PayrollModule,
    AdminModule,
  ],
})
export class AppModule {}
