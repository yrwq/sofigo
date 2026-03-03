import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ApiRouteSummary, ApiRouteTrip } from '@sofigo/transit-models';
import { buildActiveServicesCte } from '@/gtfs/gtfs-sql';
import { resolveServiceDate, resolveServiceDateTime } from '@/gtfs/gtfs-time';
import { PrismaService } from '@/prisma/prisma.service';
import type {
  RouteStopsQueryDto,
  RouteTripsQueryDto,
} from '@/routes/routes.dto';

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
    return this.prisma.$queryRaw<ApiRouteSummary>(
      Prisma.sql`
        SELECT
          r.route_id AS "id",
          r.route_short_name AS "shortName",
          r.route_long_name AS "longName",
          r.route_color AS "color",
          r.route_text_color AS "textColor"
        FROM routes r
        ORDER BY
          NULLIF(REGEXP_REPLACE(r.route_short_name, '[^0-9]', '', 'g'), '')::INT,
          REGEXP_REPLACE(r.route_short_name, '[0-9]', '', 'g') ASC,
          r.route_short_name ASC
      `,
    );
  }

  async getRoute(id: string) {
    return this.prisma.route.findUnique({
      where: { id },
    });
  }

  async listTrips(routeId: string, query: RouteTripsQueryDto) {
    const { date, time, limit } = query;
    const { serviceDate, serviceTime, weekday } = resolveServiceDateTime(
      date,
      time,
    );
    const activeServicesCte = buildActiveServicesCte(serviceDate, weekday);
    const serviceSeconds = toSeconds(serviceTime);

    return this.prisma.$queryRaw<ApiRouteTrip>(
      Prisma.sql`
        ${activeServicesCte}
        SELECT
          t.trip_id AS "id",
          t.trip_headsign AS "headsign",
          first_stop.stop_id AS "firstStopId",
          first_stop.stop_name AS "firstStopName",
          first_stop.arrival_time AS "firstArrivalTime",
          first_stop.departure_time AS "firstDepartureTime",
          last_stop.stop_id AS "lastStopId",
          last_stop.stop_name AS "lastStopName",
          last_stop.arrival_time AS "lastArrivalTime",
          last_stop.departure_time AS "lastDepartureTime",
          current_stop.stop_id AS "currentStopId",
          current_stop.stop_name AS "currentStopName",
          current_stop.arrival_time AS "currentArrivalTime",
          current_stop.departure_time AS "currentDepartureTime",
          CASE
            WHEN ${Prisma.raw(
              timeToSeconds(
                'COALESCE(first_stop.departure_time, first_stop.arrival_time)',
              ),
            )} <= ${serviceSeconds}
              AND ${Prisma.raw(
                timeToSeconds(
                  'COALESCE(last_stop.departure_time, last_stop.arrival_time)',
                ),
              )} >= ${serviceSeconds}
            THEN TRUE
            ELSE FALSE
          END AS "isActive",
          CASE
            WHEN ${Prisma.raw(
              timeToSeconds(
                'COALESCE(last_stop.departure_time, last_stop.arrival_time)',
              ),
            )} < ${serviceSeconds}
            THEN TRUE
            ELSE FALSE
          END AS "isPast"
        FROM trips t
        LEFT JOIN LATERAL (
          SELECT
            st.stop_id,
            s.stop_name,
            st.arrival_time,
            st.departure_time
          FROM stop_times st
          JOIN stops s ON s.stop_id = st.stop_id
          WHERE st.trip_id = t.trip_id
          ORDER BY st.stop_sequence ASC
          LIMIT 1
        ) AS first_stop ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            st.stop_id,
            s.stop_name,
            st.arrival_time,
            st.departure_time
          FROM stop_times st
          JOIN stops s ON s.stop_id = st.stop_id
          WHERE st.trip_id = t.trip_id
          ORDER BY st.stop_sequence DESC
          LIMIT 1
        ) AS last_stop ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            st.stop_id,
            s.stop_name,
            st.arrival_time,
            st.departure_time
          FROM stop_times st
          JOIN stops s ON s.stop_id = st.stop_id
          WHERE st.trip_id = t.trip_id
            AND ${Prisma.raw(
              timeToSeconds('COALESCE(st.departure_time, st.arrival_time)'),
            )} <= ${serviceSeconds}
            AND ${serviceSeconds} <= ${Prisma.raw(
              timeToSeconds(
                'COALESCE(last_stop.departure_time, last_stop.arrival_time)',
              ),
            )}
          ORDER BY st.stop_sequence DESC
          LIMIT 1
        ) AS current_stop ON TRUE
        WHERE t.route_id = ${routeId}
          AND t.service_id IN (SELECT service_id FROM active_services)
        ORDER BY
          CASE
            WHEN current_stop.stop_id IS NULL THEN 1
            ELSE 0
          END ASC,
          COALESCE(
            current_stop.departure_time,
            current_stop.arrival_time,
            first_stop.departure_time,
            first_stop.arrival_time
          ) ASC,
          t.trip_id ASC
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

function toSeconds(value: string) {
  const [hours, minutes, seconds] = value
    .split(':')
    .map((part) => Number(part));
  return (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0);
}

function timeToSeconds(expression: string) {
  return `(
    split_part(${expression}, ':', 1)::int * 3600 +
    split_part(${expression}, ':', 2)::int * 60 +
    split_part(${expression}, ':', 3)::int
  )`;
}
