"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_1 = require("@nestjs/bullmq");
const config_1 = require("@nestjs/config");
const payroll_job_entity_1 = require("./entities/payroll-job.entity");
const payroll_service_1 = require("./payroll.service");
const payroll_controller_1 = require("./payroll.controller");
const payroll_processor_1 = require("./payroll.processor");
const transaction_module_1 = require("../transaction/transaction.module");
const account_module_1 = require("../account/account.module");
const metrics_module_1 = require("../metrics/metrics.module");
let PayrollModule = class PayrollModule {
};
exports.PayrollModule = PayrollModule;
exports.PayrollModule = PayrollModule = __decorate([
    (0, common_1.Module)({
        imports: [
            metrics_module_1.MetricsModule,
            transaction_module_1.TransactionModule,
            account_module_1.AccountModule,
            typeorm_1.TypeOrmModule.forRootAsync({
                name: 'payrollConnection',
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (cfg) => ({
                    type: 'postgres',
                    host: cfg.get('PAYROLL_DB_HOST', 'localhost'),
                    port: +cfg.get('PAYROLL_DB_PORT', '5437'),
                    username: cfg.get('PAYROLL_DB_USER', 'root'),
                    password: cfg.get('PAYROLL_DB_PASS', 'password'),
                    database: cfg.get('PAYROLL_DB_NAME', 'novapay_payroll'),
                    entities: [payroll_job_entity_1.PayrollJob],
                    synchronize: true,
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([payroll_job_entity_1.PayrollJob], 'payrollConnection'),
            bullmq_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (cfg) => ({
                    connection: {
                        host: cfg.get('REDIS_HOST', 'localhost'),
                        port: +cfg.get('REDIS_PORT', '6379'),
                    },
                }),
            }),
            bullmq_1.BullModule.registerQueue({
                name: 'payrollQueue',
            }),
        ],
        controllers: [payroll_controller_1.PayrollController],
        providers: [payroll_service_1.PayrollService, payroll_processor_1.PayrollProcessor],
        exports: [payroll_service_1.PayrollService],
    })
], PayrollModule);
//# sourceMappingURL=payroll.module.js.map