import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PayrollJob } from './entities/payroll-job.entity';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { PayrollProcessor } from './payroll.processor';
import { TransactionModule } from '../transaction/transaction.module';
import { AccountModule } from '../account/account.module';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [
    MetricsModule,
    TransactionModule,
    AccountModule,
    TypeOrmModule.forRootAsync({
      name: 'payrollConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('PAYROLL_DB_HOST', 'localhost'),
        port: +cfg.get('PAYROLL_DB_PORT', '5437'),
        username: cfg.get('PAYROLL_DB_USER', 'root'),
        password: cfg.get('PAYROLL_DB_PASS', 'password'),
        database: cfg.get('PAYROLL_DB_NAME', 'novapay_payroll'),
        entities: [PayrollJob],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([PayrollJob], 'payrollConnection'),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        connection: {
          host: cfg.get('REDIS_HOST', 'localhost'),
          port: +cfg.get('REDIS_PORT', '6379'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'payrollQueue',
    }),
  ],
  controllers: [PayrollController],
  providers: [PayrollService, PayrollProcessor],
  exports: [PayrollService],
})
export class PayrollModule {}
