"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FxModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const fx_quote_entity_1 = require("./entities/fx-quote.entity");
const fx_service_1 = require("./fx.service");
const fx_controller_1 = require("./fx.controller");
const metrics_module_1 = require("../metrics/metrics.module");
let FxModule = class FxModule {
};
exports.FxModule = FxModule;
exports.FxModule = FxModule = __decorate([
    (0, common_1.Module)({
        imports: [
            metrics_module_1.MetricsModule,
            typeorm_1.TypeOrmModule.forRootAsync({
                name: 'fxConnection',
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (cfg) => ({
                    type: 'postgres',
                    host: cfg.get('FX_DB_HOST', 'localhost'),
                    port: +cfg.get('FX_DB_PORT', '5436'),
                    username: cfg.get('FX_DB_USER', 'root'),
                    password: cfg.get('FX_DB_PASS', 'password'),
                    database: cfg.get('FX_DB_NAME', 'novapay_fx'),
                    entities: [fx_quote_entity_1.FxQuote],
                    synchronize: true,
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([fx_quote_entity_1.FxQuote], 'fxConnection'),
        ],
        controllers: [fx_controller_1.FxController],
        providers: [fx_service_1.FxService],
        exports: [fx_service_1.FxService],
    })
], FxModule);
//# sourceMappingURL=fx.module.js.map