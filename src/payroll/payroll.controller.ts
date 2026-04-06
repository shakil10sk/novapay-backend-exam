import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { BulkPayrollDto } from './dto/bulk-payroll.dto';

@ApiTags('Payroll')
@Controller('payroll')
export class PayrollController {
    constructor(private readonly payrollService: PayrollService) { }

    @Post('bulk')
    @ApiOperation({
        summary: 'Process bulk salary disbursements (Job Queue)',
        description: 'Accepts a large batch of salary transfers and processes them via BullMQ. Concurrency=1 ensures zero contention on employer wallet.',
    })
    createBulkJob(@Body() dto: BulkPayrollDto) {
        return this.payrollService.createBulkJob(dto);
    }

    @Get('jobs/:id')
    @ApiOperation({ summary: 'Check payroll job progress and status' })
    @ApiParam({ name: 'id' })
    getJobStatus(@Param('id') id: string) {
        return this.payrollService.getJobStatus(id);
    }

    @Get('jobs')
    @ApiOperation({ summary: 'List all payroll jobs' })
    listJobs() {
        return this.payrollService.listJobs();
    }
}
