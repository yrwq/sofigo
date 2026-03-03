import { Module } from '@nestjs/common';
import { StopsController } from '@/stops/stops.controller';
import { StopsService } from '@/stops/stops.service';

@Module({
  controllers: [StopsController],
  providers: [StopsService],
})
export class StopsModule {}
