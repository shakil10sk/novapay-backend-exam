"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const ledger_entry_entity_1 = require("./entities/ledger-entry.entity");
const ledger_service_1 = require("./ledger.service");
const ledger_controller_1 = require("./ledger.controller");
const metrics_module_1 = require("../metrics/metrics.module");
let LedgerModule = class LedgerModule {
};
exports.LedgerModule = LedgerModule;
exports.LedgerModule = LedgerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            metrics_module_1.MetricsModule,
            typeorm_1.TypeOrmModule.forRootAsync({
                name: 'ledgerConnection',
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (cfg) => ({
                    type: 'postgres',
                    host: cfg.get('LEDGER_DB_HOST', 'localhost'),
                    port: +cfg.get('LEDGER_DB_PORT', '5434'),
                    username: cfg.get('LEDGER_DB_USER', 'root'),
                    password: cfg.get('LEDGER_DB_PASS', 'password'),
                    database: cfg.get('LEDGER_DB_NAME', 'novapay_ledger'),
                    entities: [ledger_entry_entity_1.LedgerEntry],
                    synchronize: true,
                    logging: cfg.get('NODE_ENV') !== 'production',
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([ledger_entry_entity_1.LedgerEntry], 'ledgerConnection'),
        ],
        controllers: [ledger_controller_1.LedgerController],
        providers: [
            ledger_service_1.LedgerService,
            {
                provide: 'LEDGER_DATA_SOURCE',
                useFactory: (dataSource) => dataSource,
                inject: [(0, typeorm_1.getDataSourceToken)('ledgerConnection')],
            },
        ],
        exports: [ledger_service_1.LedgerService],
    })
], LedgerModule);
//# sourceMappingURL=ledger.module.js.map