import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from '@/app.module';
import { loadEnv } from '@/config/load-env';

async function init() {
  loadEnv();
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger));
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

void init();
