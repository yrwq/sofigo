import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { buildActiveServicesCte } from '@/gtfs/gtfs-sql';
import { resolveServiceDate, resolveServiceDateTime } from '@/gtfs/gtfs-time';
import { PrismaService } from '@/prisma/prisma.service';
import type {
  NearbyStopsQueryDto,
  StopDeparturesQueryDto,
  StopRoutesQueryDto,
} from '@/stops/stops.dto';

type StopWithDistance = {
  id: string;
  name: string;
  description: string | null;
  lat: number;
  lon: number;
  parentStationId: string | null;
  distanceMeters: number;
};

type StopDeparture = {
  tripId: string;
  routeId: string;
  routeShortName: string;
  routeLongName: string;
  headsign: string | null;
  arrivalTime: string;
  departureTime: string;
  stopSequence: number;
};

type StopRoute = {
  id: string;
  shortName: string;
  longName: string;
  color: string | null;
  textColor: string | null;
};

@Injectable()
export class StopsService {
  constructor(private readonly prisma: PrismaService) {}

  async nearbyStops(query: NearbyStopsQueryDto) {
    const { lat, lon, radiusMeters, limit } = query;

    const rows = await this.prisma.$queryRaw<StopWithDistance>(
      Prisma.sql`
        SELECT
          stop_id AS "id",
          stop_name AS "name",
          stop_desc AS "description",
          stop_lat AS "lat",
          stop_lon AS "lon",
          parent_station_id AS "parentStationId",
          earth_distance(
            ll_to_earth(${lat}, ${lon}),
            ll_to_earth(stop_lat, stop_lon)
          ) AS "distanceMeters"
        FROM stops
        WHERE earth_distance(
          ll_to_earth(${lat}, ${lon}),
          ll_to_earth(stop_lat, stop_lon)
        ) <= ${radiusMeters}
        ORDER BY "distanceMeters" ASC
        LIMIT ${limit}
      `,
    );

    return rows;
  }

  async stopDepartures(stopId: string, query: StopDeparturesQueryDto) {
    const { date, time, limit, lookbackMinutes } = query;
    const { serviceDate, serviceTime, weekday } = resolveServiceDateTime(
      date,
      time,
    );
    const activeServicesCte = buildActiveServicesCte(serviceDate, weekday);
    const minServiceTime = subtractMinutes(serviceTime, lookbackMinutes);

    const rows = await this.prisma.$queryRaw<StopDeparture>(
      Prisma.sql`
        ${activeServicesCte}
        SELECT
          st.trip_id AS "tripId",
          t.route_id AS "routeId",
          r.route_short_name AS "routeShortName",
          r.route_long_name AS "routeLongName",
          t.trip_headsign AS "headsign",
          st.arrival_time AS "arrivalTime",
          st.departure_time AS "departureTime",
          st.stop_sequence AS "stopSequence"
        FROM stop_times st
        JOIN trips t ON t.trip_id = st.trip_id
        JOIN routes r ON r.route_id = t.route_id
        WHERE st.stop_id = ${stopId}
          AND t.service_id IN (SELECT service_id FROM active_services)
          AND st.departure_time >= ${minServiceTime}
        ORDER BY st.departure_time ASC
        LIMIT ${limit}
      `,
    );

    return rows;
  }

  async stopRoutes(stopId: string, query: StopRoutesQueryDto) {
    const { date, limit } = query;
    const { serviceDate, weekday } = resolveServiceDate(date);
    const activeServicesCte = buildActiveServicesCte(serviceDate, weekday);

    const rows = await this.prisma.$queryRaw<StopRoute>(
      Prisma.sql`
        ${activeServicesCte}
        SELECT
          r.route_id AS "id",
          r.route_short_name AS "shortName",
          r.route_long_name AS "longName",
          r.route_color AS "color",
          r.route_text_color AS "textColor"
        FROM stop_times st
        JOIN trips t ON t.trip_id = st.trip_id
        JOIN routes r ON r.route_id = t.route_id
        WHERE st.stop_id = ${stopId}
          AND t.service_id IN (SELECT service_id FROM active_services)
        GROUP BY
          r.route_id,
          r.route_short_name,
          r.route_long_name,
          r.route_color,
          r.route_text_color
        ORDER BY r.route_short_name ASC
        LIMIT ${limit}
      `,
    );

    return rows;
  }
}

function subtractMinutes(time: string, minutes: number) {
  if (minutes <= 0) {
    return time;
  }
  const [hours, mins, secs] = time.split(':').map((part) => Number(part));
  const total = (hours || 0) * 3600 + (mins || 0) * 60 + (secs || 0);
  const adjusted = Math.max(0, total - minutes * 60);
  const nextHours = Math.floor(adjusted / 3600);
  const nextMins = Math.floor((adjusted % 3600) / 60);
  const nextSecs = adjusted % 60;
  return [
    String(nextHours).padStart(2, '0'),
    String(nextMins).padStart(2, '0'),
    String(nextSecs).padStart(2, '0'),
  ].join(':');
}
