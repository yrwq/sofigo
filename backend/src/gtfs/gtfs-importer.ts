import 'dotenv/config';
import { existsSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { createSqlClient } from '@/db/postgres';
import { loadStaticGtfsDataset } from '@/gtfs/gtfs-loader';

const DEFAULT_DB_URL = 'postgresql://postgres:postgres@localhost:5432/sofigo';

async function main() {
  const zipPathArg = process.argv[2] ?? process.env.GTFS_ZIP_PATH;

  if (!zipPathArg) {
    console.error(
      'usage: bun run gtfs:import <path-to-zip> (or set GTFS_ZIP_PATH)',
    );
    process.exit(1);
  }

  const zipPath = resolveZipPath(zipPathArg);
  const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DB_URL;
  const sql = createSqlClient(databaseUrl);

  const dataset = await loadStaticGtfsDataset(zipPath);

  await sql.begin(async (tx) => {
    await tx`TRUNCATE stop_times, trips, shape_points, service_exceptions, service_calendars, stops, routes RESTART IDENTITY CASCADE`;

    await insertRoutes(tx, dataset.routes);
    await insertStops(tx, dataset.stops);
    await insertCalendars(tx, dataset.calendars);
    await insertExceptions(tx, dataset.serviceExceptions);
    await insertTrips(tx, dataset.trips);
    await insertStopTimes(tx, dataset.stopTimes);
    await insertShapePoints(tx, dataset.shapePoints);
  });

  await sql.end({ timeout: 5 });
  console.log('GTFS import completed.');
}

type Sql = ReturnType<typeof createSqlClient>;

async function insertRoutes(
  sql: Sql,
  routes: Array<{
    id: string;
    shortName: string;
    longName: string;
    color: string | null;
    textColor: string | null;
  }>,
) {
  const rows = routes.map((route) => ({
    route_id: route.id,
    route_short_name: route.shortName,
    route_long_name: route.longName,
    route_color: route.color,
    route_text_color: route.textColor,
  }));

  await insertInChunks(
    rows,
    [
      'route_id',
      'route_short_name',
      'route_long_name',
      'route_color',
      'route_text_color',
    ],
    (chunk, columns) => sql`insert into routes ${sql(chunk, columns)}`,
  );
}

async function insertStops(
  sql: Sql,
  stops: Array<{
    id: string;
    name: string;
    description: string | null;
    location: { lat: number; lon: number };
    parentStationId: string | null;
  }>,
) {
  const rows = stops.map((stop) => ({
    stop_id: stop.id,
    stop_name: stop.name,
    stop_desc: stop.description,
    stop_lat: stop.location.lat,
    stop_lon: stop.location.lon,
    parent_station_id: stop.parentStationId,
  }));

  await insertInChunks(
    rows,
    [
      'stop_id',
      'stop_name',
      'stop_desc',
      'stop_lat',
      'stop_lon',
      'parent_station_id',
    ],
    (chunk, columns) => sql`insert into stops ${sql(chunk, columns)}`,
  );
}

async function insertCalendars(
  sql: Sql,
  calendars: Array<{
    id: string;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
    startDate: string;
    endDate: string;
  }>,
) {
  const rows = calendars.map((calendar) => ({
    service_id: calendar.id,
    monday: calendar.monday,
    tuesday: calendar.tuesday,
    wednesday: calendar.wednesday,
    thursday: calendar.thursday,
    friday: calendar.friday,
    saturday: calendar.saturday,
    sunday: calendar.sunday,
    start_date: calendar.startDate,
    end_date: calendar.endDate,
  }));

  await insertInChunks(
    rows,
    [
      'service_id',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
      'start_date',
      'end_date',
    ],
    (chunk, columns) =>
      sql`insert into service_calendars ${sql(chunk, columns)}`,
  );
}

async function insertExceptions(
  sql: Sql,
  exceptions: Array<{
    serviceId: string;
    date: string;
    exceptionType: 1 | 2;
  }>,
) {
  const rows = exceptions.map((exception) => ({
    service_id: exception.serviceId,
    date: exception.date,
    exception_type: exception.exceptionType,
  }));

  await insertInChunks(
    rows,
    ['service_id', 'date', 'exception_type'],
    (chunk, columns) =>
      sql`insert into service_exceptions ${sql(chunk, columns)}`,
  );
}

async function insertTrips(
  sql: Sql,
  trips: Array<{
    id: string;
    routeId: string;
    serviceId: string;
    shapeId: string | null;
    headsign: string | null;
  }>,
) {
  const rows = trips.map((trip) => ({
    trip_id: trip.id,
    route_id: trip.routeId,
    service_id: trip.serviceId,
    shape_id: trip.shapeId,
    trip_headsign: trip.headsign,
  }));

  await insertInChunks(
    rows,
    ['trip_id', 'route_id', 'service_id', 'shape_id', 'trip_headsign'],
    (chunk, columns) => sql`insert into trips ${sql(chunk, columns)}`,
  );
}

async function insertStopTimes(
  sql: Sql,
  stopTimes: Array<{
    tripId: string;
    stopId: string;
    stopSequence: number;
    arrivalTime: string;
    departureTime: string;
    stopHeadsign: string | null;
    pickupType: number | null;
    dropOffType: number | null;
  }>,
) {
  const rows = stopTimes.map((stopTime) => ({
    trip_id: stopTime.tripId,
    stop_id: stopTime.stopId,
    stop_sequence: stopTime.stopSequence,
    arrival_time: stopTime.arrivalTime,
    departure_time: stopTime.departureTime,
    stop_headsign: stopTime.stopHeadsign,
    pickup_type: stopTime.pickupType,
    drop_off_type: stopTime.dropOffType,
  }));

  await insertInChunks(
    rows,
    [
      'trip_id',
      'stop_id',
      'stop_sequence',
      'arrival_time',
      'departure_time',
      'stop_headsign',
      'pickup_type',
      'drop_off_type',
    ],
    (chunk, columns) => sql`insert into stop_times ${sql(chunk, columns)}`,
    5000,
  );
}

async function insertShapePoints(
  sql: Sql,
  shapePoints: Array<{
    shapeId: string;
    sequence: number;
    location: { lat: number; lon: number };
    distanceTraveledKm: number | null;
  }>,
) {
  const rows = shapePoints.map((point) => ({
    shape_id: point.shapeId,
    shape_pt_sequence: point.sequence,
    shape_pt_lat: point.location.lat,
    shape_pt_lon: point.location.lon,
    shape_dist_traveled: point.distanceTraveledKm,
  }));

  await insertInChunks(
    rows,
    [
      'shape_id',
      'shape_pt_sequence',
      'shape_pt_lat',
      'shape_pt_lon',
      'shape_dist_traveled',
    ],
    (chunk, columns) => sql`insert into shape_points ${sql(chunk, columns)}`,
    5000,
  );
}

async function insertInChunks(
  rows: Array<Record<string, unknown>>,
  columns: string[],
  insertChunk: (
    chunk: Array<Record<string, unknown>>,
    columns: string[],
  ) => Promise<unknown>,
  chunkSize = 1000,
) {
  for (let offset = 0; offset < rows.length; offset += chunkSize) {
    const chunk = rows.slice(offset, offset + chunkSize);
    await insertChunk(chunk, columns);
  }
}

void main();

function resolveZipPath(zipPathArg: string) {
  if (isAbsolute(zipPathArg)) {
    return zipPathArg;
  }

  const direct = resolve(process.cwd(), zipPathArg);
  if (existsSync(direct)) {
    return direct;
  }

  const parent = resolve(process.cwd(), '..', zipPathArg);
  if (existsSync(parent)) {
    return parent;
  }

  return direct;
}
