import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Wallet } from './entities/wallet.entity';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            name: 'accountConnection',
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                type: 'postgres',
                host: cfg.get('ACCOUNT_DB_HOST', 'localhost'),
                port: +cfg.get('ACCOUNT_DB_PORT', '5433'),
                username: cfg.get('ACCOUNT_DB_USER', 'root'),
                password: cfg.get('ACCOUNT_DB_PASS', 'password'),
                database: cfg.get('ACCOUNT_DB_NAME', 'novapay_account'),
                entities: [Wallet],
                synchronize: true, // Use migrations in production
                logging: cfg.get('NODE_ENV') !== 'production',
            }),
        }),
        TypeOrmModule.forFeature([Wallet], 'accountConnection'),
    ],
    controllers: [AccountController],
    providers: [AccountService],
    exports: [AccountService],
})
export class AccountModule { }
