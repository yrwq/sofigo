import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ApiShapePoint, ApiTripStopTime } from '@sofigo/transit-models';
import { PrismaService } from '@/prisma/prisma.service';
import type { TripShapeQueryDto, TripStopTimesQueryDto } from '@/trips/trips.dto';

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

  async listShapePoints(tripId: string, query: TripShapeQueryDto) {
    const shapeId =
      query.shapeId ??
      (
        await this.prisma.trip.findUnique({
          where: { id: tripId },
          select: { shapeId: true },
        })
      )?.shapeId;

    if (!shapeId) {
      return [];
    }

    const rows = await this.prisma.$queryRaw<ApiShapePoint>(
      Prisma.sql`
        SELECT
          shape_id AS "shapeId",
          shape_pt_sequence AS "sequence",
          shape_pt_lat AS "lat",
          shape_pt_lon AS "lon",
          shape_dist_traveled AS "distTraveled"
        FROM shape_points
        WHERE shape_id = ${shapeId}
        ORDER BY shape_pt_sequence ASC
      `,
    );

    return rows;
  }
}
