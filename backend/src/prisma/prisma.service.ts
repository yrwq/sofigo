import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { loadEnv } from '@/config/load-env';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    loadEnv();
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
