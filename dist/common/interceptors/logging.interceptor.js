"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const uuid_1 = require("uuid");
let LoggingInterceptor = class LoggingInterceptor {
    constructor() {
        this.logger = new common_1.Logger('HTTP');
    }
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const requestId = req.headers['x-request-id'] || (0, uuid_1.v4)();
        req.requestId = requestId;
        const { method, url, body } = req;
        const userId = req.user?.id || 'anonymous';
        const start = Date.now();
        return next.handle().pipe((0, operators_1.tap)({
            next: (data) => {
                const res = context.switchToHttp().getResponse();
                this.logger.log(JSON.stringify({
                    requestId,
                    userId,
                    method,
                    url,
                    statusCode: res.statusCode,
                    durationMs: Date.now() - start,
                    timestamp: new Date().toISOString(),
                }));
            },
            error: (err) => {
                this.logger.error(JSON.stringify({
                    requestId,
                    userId,
                    method,
                    url,
                    error: err.message,
                    statusCode: err.status || 500,
                    durationMs: Date.now() - start,
                    timestamp: new Date().toISOString(),
                }));
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map