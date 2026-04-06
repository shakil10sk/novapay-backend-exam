import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateFxQuoteDto {
    @ApiProperty({ example: 'USD', description: 'Source currency' })
    @IsString()
    @IsNotEmpty()
    baseCurrency: string;

    @ApiProperty({ example: 'EUR', description: 'Target currency' })
    @IsString()
    @IsNotEmpty()
    quoteCurrency: string;

    @ApiProperty({ example: 2000.00, description: 'Amount in base currency' })
    @IsNumber()
    @Min(0.01)
    @Type(() => Number)
    amount: number;

    @ApiPropertyOptional({ example: 'user-uuid' })
    @IsString()
    @IsOptional()
    userId?: string;
}
