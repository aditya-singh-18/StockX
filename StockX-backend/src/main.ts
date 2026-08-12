import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : configService.get<number>('PORT', 3001);
  const corsOrigin = process.env.CORS_ORIGIN || configService.get<string>('CORS_ORIGIN', '*');

  // Enable CORS
  app.enableCors({
    origin: corsOrigin === '*' ? true : (corsOrigin.includes(',') ? corsOrigin.split(',').map((s) => s.trim()) : corsOrigin),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger Documentation Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('StockX ERP + CRM API')
    .setDescription(
      'REST API documentation for StockX: Mini ERP + CRM Operations Portal. Supports Auth, Customers CRM, Products/Inventory, and Sales Challans.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication and login endpoints')
    .addTag('Users', 'User management')
    .addTag('Roles', 'Role and permission endpoints')
    .addTag('Customers', 'Customer CRM & follow-up notes')
    .addTag('Products', 'Product catalog & stock adjustments')
    .addTag('Challans', 'Sales Challan workflow & atomic stock confirmation')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'StockX API Docs',
  });

  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 StockX Backend running on: http://0.0.0.0:${port}`);
  logger.log(`📚 Swagger API Docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
