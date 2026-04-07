import { Controller, Get, Header } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  @ApiOperation({ summary: 'Prometheus metrics endpoint' })
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
