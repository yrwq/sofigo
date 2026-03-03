import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import type {
  NearbyStopsQuery,
  StopDeparturesQuery,
} from '@/stops/stops.schemas';

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

@Injectable()
export class StopsService {
  constructor(private readonly prisma: PrismaService) {}

  async nearbyStops(query: NearbyStopsQuery) {
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

  async stopDepartures(stopId: string, query: StopDeparturesQuery) {
    const { date, time, limit } = query;
    const { serviceDate, serviceTime, weekday } = normalizeDateTime(date, time);

    const rows = await this.prisma.$queryRaw<StopDeparture>(
      Prisma.sql`
        WITH active_services AS (
          SELECT sc.service_id
          FROM service_calendars sc
          WHERE sc.start_date <= ${serviceDate}
            AND sc.end_date >= ${serviceDate}
            AND (
              CASE ${weekday}
                WHEN 0 THEN sc.sunday
                WHEN 1 THEN sc.monday
                WHEN 2 THEN sc.tuesday
                WHEN 3 THEN sc.wednesday
                WHEN 4 THEN sc.thursday
                WHEN 5 THEN sc.friday
                WHEN 6 THEN sc.saturday
              END
            )
          UNION
          SELECT se.service_id
          FROM service_exceptions se
          WHERE se.date = ${serviceDate}
            AND se.exception_type = 1
          EXCEPT
          SELECT se.service_id
          FROM service_exceptions se
          WHERE se.date = ${serviceDate}
            AND se.exception_type = 2
        )
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
          AND st.departure_time >= ${serviceTime}
        ORDER BY st.departure_time ASC
        LIMIT ${limit}
      `,
    );

    return rows;
  }
}

function normalizeDateTime(date?: string, time?: string) {
  const now = new Date();
  const isoDate =
    date ??
    [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');

  const isoTime =
    time ??
    [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0'),
    ].join(':');

  const serviceDate = isoDate.replaceAll('-', '');
  const weekday = new Date(isoDate).getDay();

  return {
    serviceDate,
    serviceTime: isoTime,
    weekday,
  };
}
