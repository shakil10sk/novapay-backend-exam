import { IsString, IsNotEmpty, IsArray, ValidateNested, IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PayrollDisbursementEntry {
    @ApiProperty({ example: 'employee-wallet-uuid' })
    @IsUUID()
    @IsNotEmpty()
    employeeWalletId: string;

    @ApiProperty({ example: 4500.00 })
    @IsNumber()
    @Min(0.01)
    @Type(() => Number)
    salary: number;

    @ApiProperty({ example: 'EMP-001', description: 'Internal employee ref for idempotency' })
    @IsString()
    @IsNotEmpty()
    employeeReference: string;
}

export class BulkPayrollDto {
    @ApiProperty({ example: 'employer-wallet-uuid' })
    @IsUUID()
    @IsNotEmpty()
    employerWalletId: string;

    @ApiProperty({ example: 'payroll-2026-dec', description: 'Unique batch ID across jobs' })
    @IsString()
    @IsNotEmpty()
    batchId: string;

    @ApiProperty({ type: [PayrollDisbursementEntry] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PayrollDisbursementEntry)
    disbursements: PayrollDisbursementEntry[];
}
