import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FxQuote } from './entities/fx-quote.entity';
import { FxService } from './fx.service';
import { FxController } from './fx.controller';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [
    MetricsModule,
    TypeOrmModule.forRootAsync({
      name: 'fxConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('FX_DB_HOST', 'localhost'),
        port: +cfg.get('FX_DB_PORT', '5436'),
        username: cfg.get('FX_DB_USER', 'root'),
        password: cfg.get('FX_DB_PASS', 'password'),
        database: cfg.get('FX_DB_NAME', 'novapay_fx'),
        entities: [FxQuote],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([FxQuote], 'fxConnection'),
  ],
  controllers: [FxController],
  providers: [FxService],
  exports: [FxService],
})
export class FxModule {}
