import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ApiTripStopTime } from '@sofigo/transit-models';
import { PrismaService } from '@/prisma/prisma.service';
import type { TripStopTimesQueryDto } from '@/trips/trips.dto';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async listStopTimes(tripId: string, query: TripStopTimesQueryDto) {
    const { limit } = query;

    const rows = await this.prisma.$queryRaw<ApiTripStopTime>(
      Prisma.sql`
        SELECT
          s.stop_id AS "stopId",
          s.stop_name AS "stopName",
          s.stop_desc AS "stopDescription",
          s.stop_lat AS "lat",
          s.stop_lon AS "lon",
          s.parent_station_id AS "parentStationId",
          st.stop_sequence AS "stopSequence",
          st.arrival_time AS "arrivalTime",
          st.departure_time AS "departureTime",
          st.stop_headsign AS "stopHeadsign",
          st.pickup_type AS "pickupType",
          st.drop_off_type AS "dropOffType"
        FROM stop_times st
        JOIN stops s ON s.stop_id = st.stop_id
        WHERE st.trip_id = ${tripId}
        ORDER BY st.stop_sequence ASC
        LIMIT ${limit}
      `,
    );

    return rows;
  }
}
