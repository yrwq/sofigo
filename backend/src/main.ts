import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from '@/app.module';
import { loadEnv } from '@/config/load-env';

async function init() {
  loadEnv();
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SofiGo Transit API')
    .setDescription('Routes, stops, and departures from GTFS')
    .setVersion('0.1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  app.enableCors();
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

void init();
