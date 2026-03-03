import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  nearbyStopsQuerySchema,
  stopDeparturesQuerySchema,
} from '@/stops/stops.schemas';
import { StopsService } from '@/stops/stops.service';

@Controller('stops')
export class StopsController {
  constructor(private readonly stops: StopsService) {}

  @Get('nearby')
  async nearby(@Query() query: Record<string, unknown>) {
    const parsed = nearbyStopsQuerySchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }
    return this.stops.nearbyStops(parsed.data);
  }

  @Get(':id/departures')
  async departures(
    @Param('id') stopId: string,
    @Query() query: Record<string, unknown>,
  ) {
    const parsed = stopDeparturesQuerySchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }
    return this.stops.stopDepartures(stopId, parsed.data);
  }
}
