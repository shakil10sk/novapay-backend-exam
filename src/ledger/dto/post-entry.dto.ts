import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntryType } from '../entities/ledger-entry.entity';
import { Type } from 'class-transformer';

export class LedgerEntryDto {
    @ApiProperty({ example: 'wallet-uuid' })
    @IsString()
    @IsNotEmpty()
    walletId: string;

    @ApiProperty({ enum: EntryType })
    @IsEnum(EntryType)
    type: EntryType;

    @ApiProperty({ example: 100.00 })
    @IsNumber()
    @Min(0.000001)
    @Type(() => Number)
    amount: number;

    @ApiProperty({ example: 'USD' })
    @IsString()
    @IsNotEmpty()
    currency: string;

    @ApiPropertyOptional({ example: 'John Doe' })
    @IsString()
    @IsOptional()
    accountName?: string;

    @ApiPropertyOptional({ example: 'Salary disbursement' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: 1.2345 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    fxRate?: number;
}

export class PostDoubleEntryDto {
    @ApiProperty({ example: 'txn-uuid' })
    @IsString()
    @IsNotEmpty()
    transactionId: string;

    @ApiProperty({ type: LedgerEntryDto })
    debit: LedgerEntryDto;

    @ApiProperty({ type: LedgerEntryDto })
    credit: LedgerEntryDto;
}
