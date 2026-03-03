import { Module } from '@nestjs/common';
import { RoutesController } from '@/routes/routes.controller';
import { RoutesService } from '@/routes/routes.service';

@Module({
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
