"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("./tracing");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    app.setGlobalPrefix('api/v1');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('NovaPay API')
        .setDescription('Enterprise-grade payment processing backend')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`NovaPay API running on port ${port}`);
    console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map