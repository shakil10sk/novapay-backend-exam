"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FxController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fx_service_1 = require("./fx.service");
const create_fx_quote_dto_1 = require("./dto/create-fx-quote.dto");
let FxController = class FxController {
    constructor(fxService) {
        this.fxService = fxService;
    }
    createQuote(dto) {
        return this.fxService.createQuote(dto);
    }
    getQuote(id) {
        return this.fxService.getQuote(id);
    }
};
exports.FxController = FxController;
__decorate([
    (0, common_1.Post)('quote'),
    (0, swagger_1.ApiOperation)({
        summary: 'Issue a locked FX rate quote (60s TTL)',
        description: 'Fetches live rate and locks it for 60 seconds. Fails immediately if FX provider is unavailable — never applies stale rates.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_fx_quote_dto_1.CreateFxQuoteDto]),
    __metadata("design:returntype", void 0)
], FxController.prototype, "createQuote", null);
__decorate([
    (0, common_1.Get)('quote/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check FX quote validity and seconds remaining',
        description: 'Returns quote details including live-computed secondsRemaining.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 'uuid' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FxController.prototype, "getQuote", null);
exports.FxController = FxController = __decorate([
    (0, swagger_1.ApiTags)('FX'),
    (0, common_1.Controller)('fx'),
    __metadata("design:paramtypes", [fx_service_1.FxService])
], FxController);
//# sourceMappingURL=fx.controller.js.map