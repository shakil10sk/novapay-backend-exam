"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const account_module_1 = require("./account/account.module");
const ledger_module_1 = require("./ledger/ledger.module");
const transaction_module_1 = require("./transaction/transaction.module");
const fx_module_1 = require("./fx/fx.module");
const payroll_module_1 = require("./payroll/payroll.module");
const metrics_module_1 = require("./metrics/metrics.module");
const admin_module_1 = require("./admin/admin.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            metrics_module_1.MetricsModule,
            account_module_1.AccountModule,
            ledger_module_1.LedgerModule,
            transaction_module_1.TransactionModule,
            fx_module_1.FxModule,
            payroll_module_1.PayrollModule,
            admin_module_1.AdminModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map