import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { TripShapeQueryDto, TripStopTimesQueryDto } from '@/trips/trips.dto';
import { TripsService } from '@/trips/trips.service';

@ApiTags('trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly trips: TripsService) {}

  @Get(':id/stop-times')
  @ApiOperation({
    summary: 'List stop times for a trip',
    description: 'Returns ordered stops and times for a specific trip.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Trip ID from GTFS trip_id.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of stop times to return.',
  })
  async stopTimes(
    @Param('id') tripId: string,
    @Query() query: Record<string, unknown>,
  ) {
    const dto = await parseQuery(TripStopTimesQueryDto, query);
    return this.trips.listStopTimes(tripId, dto);
  }

  @Get(':id/shape')
  @ApiOperation({
    summary: 'List shape points for a trip',
    description: 'Returns ordered shape points for the trip shape.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Trip ID from GTFS trip_id.',
  })
  @ApiQuery({
    name: 'shapeId',
    required: false,
    type: String,
    description: 'Optional shape_id override.',
  })
  async shape(
    @Param('id') tripId: string,
    @Query() query: Record<string, unknown>,
  ) {
    const dto = await parseQuery(TripShapeQueryDto, query);
    return this.trips.listShapePoints(tripId, dto);
  }
}

async function parseQuery<T extends object>(
  dto: new () => T,
  query: Record<string, unknown>,
): Promise<T> {
  const instance = plainToInstance(dto, query, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  });
  const errors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  if (errors.length > 0) {
    throw new BadRequestException(errors);
  }
  return instance;
}
