import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { FxService } from './fx.service';
import { CreateFxQuoteDto } from './dto/create-fx-quote.dto';

@ApiTags('FX')
@Controller('fx')
export class FxController {
  constructor(private readonly fxService: FxService) {}

  @Post('quote')
  @ApiOperation({
    summary: 'Issue a locked FX rate quote (60s TTL)',
    description:
      'Fetches live rate and locks it for 60 seconds. Fails immediately if FX provider is unavailable — never applies stale rates.',
  })
  createQuote(@Body() dto: CreateFxQuoteDto) {
    return this.fxService.createQuote(dto);
  }

  @Get('quote/:id')
  @ApiOperation({
    summary: 'Check FX quote validity and seconds remaining',
    description:
      'Returns quote details including live-computed secondsRemaining.',
  })
  @ApiParam({ name: 'id', example: 'uuid' })
  getQuote(@Param('id') id: string) {
    return this.fxService.getQuote(id);
  }
}
