import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency } from '../entities/wallet.entity';

export class CreateWalletDto {
    @ApiProperty({ example: 'user-uuid-1234' })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    ownerName: string;

    @ApiPropertyOptional({ enum: Currency, default: Currency.USD })
    @IsEnum(Currency)
    @IsOptional()
    currency?: Currency;
}
