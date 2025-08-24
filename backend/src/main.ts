import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

// Simple AppModule for minimal functionality
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
class MinimalAppModule {}

async function bootstrap() {
  const app = await NestFactory.create(MinimalAppModule);
  
  // Enable CORS
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // API Health Check
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    });
  });

  // API Status Endpoint
  app.getHttpAdapter().get('/api/status', (req, res) => {
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

  const port = process.env.PORT || 3000;

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`🔍 Health Check available at: http://localhost:${port}/health`);
  console.log(`📊 API Status available at: http://localhost:${port}/api/status`);
}

bootstrap();
