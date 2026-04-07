import { Controller, Get, Post, Body, Param, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { LedgerService } from '../ledger/ledger.service';
import { TransactionService } from '../transaction/transaction.service';
import { AccountService } from '../account/account.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private readonly ledgerService: LedgerService,
    private readonly transactionService: TransactionService,
    private readonly accountService: AccountService,
  ) {}

  @Get('health/ledger')
  @ApiOperation({ summary: 'Check global ledger health (invariant check)' })
  checkLedgerHealth() {
    this.logger.log('Admin triggered global ledger health check.');
    return this.ledgerService.checkGlobalInvariant();
  }

  @Post('recovery/trigger')
  @ApiOperation({ summary: 'Trigger crash recovery for all services' })
  triggerRecovery() {
    this.logger.warn('Admin manually triggered system recovery.');
    return this.transactionService.runCrashRecovery();
  }

  @Get('wallets')
  @ApiOperation({
    summary: 'Internal view of all user wallets and snaphost balances',
  })
  listSysWallets() {
    return this.accountService.listWallets();
  }

  @Get('audit/wallet/:id')
  @ApiParam({ name: 'id' })
  @ApiOperation({
    summary: 'Verify tamper-evident hash chain for a specific wallet',
  })
  verifyWalletAudit(@Param('id') id: string) {
    return this.ledgerService.verifyAuditChain(id);
  }
}
