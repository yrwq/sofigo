import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { buildActiveServicesCte } from '@/gtfs/gtfs-sql';
import { resolveServiceDate } from '@/gtfs/gtfs-time';
import { PrismaService } from '@/prisma/prisma.service';
import type {
  RouteStopsQueryDto,
  RouteTripsQueryDto,
} from '@/routes/routes.dto';

type RouteTrip = {
  id: string;
  headsign: string | null;
  serviceId: string;
  shapeId: string | null;
};

type RouteStop = {
  id: string;
  name: string;
  description: string | null;
  lat: number;
  lon: number;
  parentStationId: string | null;
  sequence: number;
};

@Injectable()
export class RoutesService {
  constructor(private readonly prisma: PrismaService) {}

  async listRoutes() {
    return this.prisma.route.findMany({
      orderBy: [{ shortName: 'asc' }],
    });
  }

  async getRoute(id: string) {
    return this.prisma.route.findUnique({
      where: { id },
    });
  }

  async listTrips(routeId: string, query: RouteTripsQueryDto) {
    const { date, limit } = query;
    const { serviceDate, weekday } = resolveServiceDate(date);
    const activeServicesCte = buildActiveServicesCte(serviceDate, weekday);

    return this.prisma.$queryRaw<RouteTrip>(
      Prisma.sql`
        ${activeServicesCte}
        SELECT
          t.trip_id AS "id",
          t.trip_headsign AS "headsign",
          t.service_id AS "serviceId",
          t.shape_id AS "shapeId"
        FROM trips t
        WHERE t.route_id = ${routeId}
          AND t.service_id IN (SELECT service_id FROM active_services)
        ORDER BY t.trip_headsign NULLS LAST, t.trip_id ASC
        LIMIT ${limit}
      `,
    );
  }

  async listStops(routeId: string, query: RouteStopsQueryDto) {
    const { date, limit } = query;
    const { serviceDate, weekday } = resolveServiceDate(date);
    const activeServicesCte = buildActiveServicesCte(serviceDate, weekday);

    return this.prisma.$queryRaw<RouteStop>(
      Prisma.sql`
        ${activeServicesCte}
        SELECT
          s.stop_id AS "id",
          s.stop_name AS "name",
          s.stop_desc AS "description",
          s.stop_lat AS "lat",
          s.stop_lon AS "lon",
          s.parent_station_id AS "parentStationId",
          MIN(st.stop_sequence) AS "sequence"
        FROM trips t
        JOIN stop_times st ON st.trip_id = t.trip_id
        JOIN stops s ON s.stop_id = st.stop_id
        WHERE t.route_id = ${routeId}
          AND t.service_id IN (SELECT service_id FROM active_services)
        GROUP BY
          s.stop_id,
          s.stop_name,
          s.stop_desc,
          s.stop_lat,
          s.stop_lon,
          s.parent_station_id
        ORDER BY "sequence" ASC
        LIMIT ${limit}
      `,
    );
  }
}
