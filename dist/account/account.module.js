"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const wallet_entity_1 = require("./entities/wallet.entity");
const account_service_1 = require("./account.service");
const account_controller_1 = require("./account.controller");
let AccountModule = class AccountModule {
};
exports.AccountModule = AccountModule;
exports.AccountModule = AccountModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                name: 'accountConnection',
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (cfg) => ({
                    type: 'postgres',
                    host: cfg.get('ACCOUNT_DB_HOST', 'localhost'),
                    port: +cfg.get('ACCOUNT_DB_PORT', '5433'),
                    username: cfg.get('ACCOUNT_DB_USER', 'root'),
                    password: cfg.get('ACCOUNT_DB_PASS', 'password'),
                    database: cfg.get('ACCOUNT_DB_NAME', 'novapay_account'),
                    entities: [wallet_entity_1.Wallet],
                    synchronize: true,
                    logging: cfg.get('NODE_ENV') !== 'production',
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([wallet_entity_1.Wallet], 'accountConnection'),
        ],
        controllers: [account_controller_1.AccountController],
        providers: [account_service_1.AccountService],
        exports: [account_service_1.AccountService],
    })
], AccountModule);
//# sourceMappingURL=account.module.js.map