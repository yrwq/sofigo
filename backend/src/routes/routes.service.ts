import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { buildActiveServicesCte } from '@/gtfs/gtfs-sql';
import { resolveServiceDate } from '@/gtfs/gtfs-time';
import { PrismaService } from '@/prisma/prisma.service';
import type { RouteTripsQueryDto } from '@/routes/routes.dto';

type RouteTrip = {
  id: string;
  headsign: string | null;
  serviceId: string;
  shapeId: string | null;
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
}
