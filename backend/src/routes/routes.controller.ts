import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RouteTripsQueryDto } from '@/routes/routes.dto';
import { RoutesService } from '@/routes/routes.service';

@ApiTags('routes')
@Controller('routes')
export class RoutesController {
  constructor(private readonly routes: RoutesService) {}

  @Get()
  @ApiOperation({
    summary: 'List routes',
    description: 'Returns all routes ordered by short name.',
  })
  async list() {
    return this.routes.listRoutes();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a route',
    description: 'Returns a single route by its GTFS route_id.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Route ID from GTFS route_id.',
  })
  async detail(@Param('id') id: string) {
    const route = await this.routes.getRoute(id);
    if (!route) {
      throw new NotFoundException('Route not found');
    }
    return route;
  }

  @Get(':id/trips')
  @ApiOperation({
    summary: 'List trips for a route',
    description:
      'Filters trips by active service on the given date and limits results.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Route ID from GTFS route_id.',
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
    description: 'Maximum number of trips to return.',
  })
  async trips(
    @Param('id') id: string,
    @Query() query: Record<string, unknown>,
  ) {
    const dto = await parseQuery(RouteTripsQueryDto, query);
    return this.routes.listTrips(id, dto);
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
