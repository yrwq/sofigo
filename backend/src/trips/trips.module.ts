import { Module } from '@nestjs/common';
import { TripsController } from '@/trips/trips.controller';
import { TripsService } from '@/trips/trips.service';

@Module({
  controllers: [TripsController],
  providers: [TripsService],
})
export class TripsModule {}
