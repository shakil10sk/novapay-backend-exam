import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTransferDto {
  @ApiProperty({ example: 'sender-wallet-uuid' })
  @IsUUID()
  @IsNotEmpty()
  senderWalletId: string;

  @ApiProperty({ example: 'receiver-wallet-uuid' })
  @IsUUID()
  @IsNotEmpty()
  receiverWalletId: string;

  @ApiProperty({ example: 100.0 })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiPropertyOptional({ example: 'fx-quote-uuid' })
  @IsUUID()
  @IsOptional()
  fxQuoteId?: string;

  @ApiPropertyOptional({ example: 'Salary payment' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'client-ref-123', description: 'Idempotency key' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}
