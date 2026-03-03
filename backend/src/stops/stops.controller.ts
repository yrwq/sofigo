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
import {
  NearbyStopsQueryDto,
  StopDeparturesQueryDto,
  StopRoutesQueryDto,
} from '@/stops/stops.dto';
import { StopsService } from '@/stops/stops.service';

@ApiTags('stops')
@Controller('stops')
export class StopsController {
  constructor(private readonly stops: StopsService) {}

  @Get('nearby')
  @ApiOperation({
    summary: 'List nearby stops',
    description: 'Returns stops ordered by distance from the given coordinate.',
  })
  @ApiQuery({
    name: 'lat',
    type: Number,
    description: 'Latitude of the search center.',
  })
  @ApiQuery({
    name: 'lon',
    type: Number,
    description: 'Longitude of the search center.',
  })
  @ApiQuery({
    name: 'radiusMeters',
    required: false,
    type: Number,
    description: 'Search radius in meters.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of stops to return.',
  })
  async nearby(@Query() query: Record<string, unknown>) {
    const dto = await parseQuery(NearbyStopsQueryDto, query);
    return this.stops.nearbyStops(dto);
  }

  @Get(':id/departures')
  @ApiOperation({
    summary: 'List upcoming departures for a stop',
    description:
      'Uses service calendars and exceptions to list trips after the given time.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Stop ID from GTFS stop_id.',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Service date in YYYY-MM-DD.',
  })
  @ApiQuery({
    name: 'time',
    required: false,
    type: String,
    description: 'Earliest departure time in HH:MM:SS.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of departures to return.',
  })
  async departures(
    @Param('id') stopId: string,
    @Query() query: Record<string, unknown>,
  ) {
    const dto = await parseQuery(StopDeparturesQueryDto, query);
    return this.stops.stopDepartures(stopId, dto);
  }

  @Get(':id/routes')
  @ApiOperation({
    summary: 'List routes that serve a stop',
    description:
      'Returns distinct routes that stop at the given stop for the service date.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Stop ID from GTFS stop_id.',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Service date in YYYY-MM-DD.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of routes to return.',
  })
  async routes(
    @Param('id') stopId: string,
    @Query() query: Record<string, unknown>,
  ) {
    const dto = await parseQuery(StopRoutesQueryDto, query);
    return this.stops.stopRoutes(stopId, dto);
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
