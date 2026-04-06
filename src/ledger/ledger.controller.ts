import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LedgerService } from './ledger.service';
import { PostDoubleEntryDto } from './dto/post-entry.dto';

@ApiTags('Ledger')
@Controller('ledger')
export class LedgerController {
    constructor(private readonly ledgerService: LedgerService) { }

    @Post('entries')
    @ApiOperation({ summary: 'Post a double-entry pair (internal use)' })
    postDoubleEntry(@Body() dto: PostDoubleEntryDto) {
        return this.ledgerService.postDoubleEntry(dto);
    }

    @Get('balance/:walletId')
    @ApiOperation({ summary: 'Get authoritative balance from ledger (source of truth)' })
    @ApiParam({ name: 'walletId' })
    getBalance(@Param('walletId') walletId: string) {
        return this.ledgerService.getBalance(walletId);
    }

    @Get('history/:walletId')
    @ApiOperation({ summary: 'Get paginated transaction history' })
    @ApiParam({ name: 'walletId' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getHistory(
        @Param('walletId') walletId: string,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
    ) {
        return this.ledgerService.getTransactionHistory(walletId, +page, +limit);
    }

    @Get('audit/:walletId')
    @ApiOperation({ summary: 'Verify audit hash chain for a wallet' })
    @ApiParam({ name: 'walletId' })
    verifyAuditChain(@Param('walletId') walletId: string) {
        return this.ledgerService.verifyAuditChain(walletId);
    }

    @Get('invariant')
    @ApiOperation({ summary: 'Check global ledger invariant (total debits == total credits)' })
    checkGlobalInvariant() {
        return this.ledgerService.checkGlobalInvariant();
    }

    @Get('transactions/:transactionId')
    @ApiOperation({ summary: 'Get all ledger entries for a transaction' })
    @ApiParam({ name: 'transactionId' })
    getByTransaction(@Param('transactionId') transactionId: string) {
        return this.ledgerService.getEntriesByTransaction(transactionId);
    }
}
