"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const transaction_entity_1 = require("./entities/transaction.entity");
const idempotency_key_entity_1 = require("./entities/idempotency-key.entity");
const transaction_service_1 = require("./transaction.service");
const transaction_controller_1 = require("./transaction.controller");
const account_module_1 = require("../account/account.module");
const ledger_module_1 = require("../ledger/ledger.module");
const fx_module_1 = require("../fx/fx.module");
const metrics_module_1 = require("../metrics/metrics.module");
let TransactionModule = class TransactionModule {
};
exports.TransactionModule = TransactionModule;
exports.TransactionModule = TransactionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            metrics_module_1.MetricsModule,
            account_module_1.AccountModule,
            ledger_module_1.LedgerModule,
            fx_module_1.FxModule,
            typeorm_1.TypeOrmModule.forRootAsync({
                name: 'transactionConnection',
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (cfg) => ({
                    type: 'postgres',
                    host: cfg.get('TRANSACTION_DB_HOST', 'localhost'),
                    port: +cfg.get('TRANSACTION_DB_PORT', '5435'),
                    username: cfg.get('TRANSACTION_DB_USER', 'root'),
                    password: cfg.get('TRANSACTION_DB_PASS', 'password'),
                    database: cfg.get('TRANSACTION_DB_NAME', 'novapay_txn'),
                    entities: [transaction_entity_1.Transaction, idempotency_key_entity_1.IdempotencyKey],
                    synchronize: true,
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([transaction_entity_1.Transaction, idempotency_key_entity_1.IdempotencyKey], 'transactionConnection'),
        ],
        controllers: [transaction_controller_1.TransactionController],
        providers: [
            transaction_service_1.TransactionService,
            {
                provide: 'TRANSACTION_DATA_SOURCE',
                useFactory: (dataSource) => dataSource,
                inject: [(0, typeorm_1.getDataSourceToken)('transactionConnection')],
            },
        ],
        exports: [transaction_service_1.TransactionService],
    })
], TransactionModule);
//# sourceMappingURL=transaction.module.js.map