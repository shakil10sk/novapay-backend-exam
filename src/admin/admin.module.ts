import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { LedgerModule } from '../ledger/ledger.module';
import { TransactionModule } from '../transaction/transaction.module';
import { AccountModule } from '../account/account.module';

@Module({
    imports: [LedgerModule, TransactionModule, AccountModule],
    controllers: [AdminController],
})
export class AdminModule { }
