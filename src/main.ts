import 'dotenv/config';
// MUST be first — registers OpenTelemetry before any NestJS modules load
import './tracing';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    // Global validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Global logging interceptor
    app.useGlobalInterceptors(new LoggingInterceptor());

    // API prefix
    app.setGlobalPrefix('api/v1');

    // Swagger
    const config = new DocumentBuilder()
        .setTitle('NovaPay API')
        .setDescription('Enterprise-grade payment processing backend')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`NovaPay API running on port ${port}`);
    console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
