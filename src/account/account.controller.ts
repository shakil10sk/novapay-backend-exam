import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { CreateWalletDto } from './dto/create-wallet.dto';

@ApiTags('Account')
@Controller('accounts')
export class AccountController {
    constructor(private readonly accountService: AccountService) { }

    @Post('wallets')
    @ApiOperation({ summary: 'Create a new wallet for a user' })
    createWallet(@Body() dto: CreateWalletDto) {
        return this.accountService.createWallet(dto);
    }

    @Get('wallets')
    @ApiOperation({ summary: 'List all wallets' })
    listWallets() {
        return this.accountService.listWallets();
    }

    @Get('wallets/user/:userId')
    @ApiOperation({ summary: 'Get wallet by userId' })
    @ApiParam({ name: 'userId', example: 'user-uuid-1234' })
    getByUser(@Param('userId') userId: string) {
        return this.accountService.getWallet(userId);
    }

    @Get('wallets/:walletId')
    @ApiOperation({ summary: 'Get wallet by walletId' })
    @ApiParam({ name: 'walletId', example: 'uuid' })
    getById(@Param('walletId') walletId: string) {
        return this.accountService.getWalletById(walletId);
    }
}
