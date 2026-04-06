import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

@ApiTags('Transaction')
@Controller('transfers')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) { }

    @Post('international')
    @ApiOperation({
        summary: 'Execute internal or international transfer (Idempotent)',
        description: 'Ensures exactly-once processing even on client retries or simultaneous crashes. Applies locked FX rate if quoteId provided.',
    })
    executeTransfer(@Body() dto: CreateTransferDto) {
        return this.transactionService.executeTransfer(dto);
    }

    @Post('domestic')
    @ApiOperation({ summary: 'Alias for internal transfer (Idempotent)' })
    executeDomestic(@Body() dto: CreateTransferDto) {
        return this.transactionService.executeTransfer(dto);
    }

    @Get('recovery')
    @ApiOperation({ summary: 'Trigger crash recovery scan manually (for testing Scenario C)' })
    recover() {
        return this.transactionService.runCrashRecovery();
    }

    @Get('list')
    @ApiOperation({ summary: 'List recent transactions' })
    list() {
        return this.transactionService.listTransactions();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get transaction details' })
    @ApiParam({ name: 'id' })
    get(@Param('id') id: string) {
        return this.transactionService.getTransaction(id);
    }
}
