import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { swaggerConfig, swaggerCustomOptions } from './config/swagger.config';
import { apiVersioningConfig } from './config/api-versioning.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // API versioning
  app.enableVersioning(apiVersioningConfig);

  // Swagger/OpenAPI Configuration
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: [],
    deepScanRoutes: true,
  });

  // Setup Swagger UI
  SwaggerModule.setup('api/docs', app, document, swaggerCustomOptions);

  // API Health Check
  app.use('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    });
  });

  // API Status Endpoint
  app.use('/api/status', (req, res) => {
    res.json({
      status: 'operational',
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      services: {
        database: 'operational',
        redis: 'operational',
        email: 'operational',
        fileStorage: 'operational',
        notifications: 'operational',
      },
    });
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`);
  console.log(`🔍 Health Check available at: http://localhost:${port}/health`);
  console.log(`📊 API Status available at: http://localhost:${port}/api/status`);
}

bootstrap();
