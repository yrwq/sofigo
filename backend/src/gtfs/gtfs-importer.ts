import { existsSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { loadEnv } from '@/config/load-env';
import { loadStaticGtfsDataset } from '@/gtfs/gtfs-loader';

export const DEFAULT_DB_URL = 'postgresql://postgres:postgres@localhost:5432/sofigo';

export async function importGtfsZip(options: {
  zipPath: string;
  databaseUrl?: string;
}) {
  const databaseUrl = options.databaseUrl ?? process.env.DATABASE_URL ?? DEFAULT_DB_URL;
  const prisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  });

  const dataset = await loadStaticGtfsDataset(options.zipPath);

  await prisma.stopTime.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.shapePoint.deleteMany();
  await prisma.serviceException.deleteMany();
  await prisma.serviceCalendar.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.route.deleteMany();

  await insertRoutes(prisma, dataset.routes);
  await insertStops(prisma, dataset.stops);
  await insertCalendars(prisma, dataset.calendars);
  await insertExceptions(prisma, dataset.serviceExceptions);
  await insertTrips(prisma, dataset.trips);
  await insertStopTimes(prisma, dataset.stopTimes);
  await insertShapePoints(prisma, dataset.shapePoints);

  await prisma.$disconnect();
  console.log('GTFS import completed.');
}

type PrismaTx = PrismaClient;

async function insertRoutes(
  tx: PrismaTx,
  routes: Array<{
    id: string;
    shortName: string;
    longName: string;
    color: string | null;
    textColor: string | null;
  }>,
) {
  const rows = routes.map((route) => ({
    id: route.id,
    shortName: route.shortName,
    longName: route.longName,
    color: route.color,
    textColor: route.textColor,
  }));

  await insertInChunks(rows, (chunk) =>
    tx.route.createMany({ data: chunk, skipDuplicates: true }),
  );
}

async function insertStops(
  tx: PrismaTx,
  stops: Array<{
    id: string;
    name: string;
    description: string | null;
    location: { lat: number; lon: number };
    parentStationId: string | null;
  }>,
) {
  const rows = stops.map((stop) => ({
    id: stop.id,
    name: stop.name,
    description: stop.description,
    lat: stop.location.lat,
    lon: stop.location.lon,
    parentStationId: stop.parentStationId,
  }));

  await insertInChunks(rows, (chunk) =>
    tx.stop.createMany({ data: chunk, skipDuplicates: true }),
  );
}

async function insertCalendars(
  tx: PrismaTx,
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
    id: calendar.id,
    monday: calendar.monday,
    tuesday: calendar.tuesday,
    wednesday: calendar.wednesday,
    thursday: calendar.thursday,
    friday: calendar.friday,
    saturday: calendar.saturday,
    sunday: calendar.sunday,
    startDate: calendar.startDate,
    endDate: calendar.endDate,
  }));

  await insertInChunks(rows, (chunk) =>
    tx.serviceCalendar.createMany({ data: chunk, skipDuplicates: true }),
  );
}

async function insertExceptions(
  tx: PrismaTx,
  exceptions: Array<{
    serviceId: string;
    date: string;
    exceptionType: 1 | 2;
  }>,
) {
  const rows = exceptions.map((exception) => ({
    serviceId: exception.serviceId,
    date: exception.date,
    exceptionType: exception.exceptionType,
  }));

  await insertInChunks(rows, (chunk) =>
    tx.serviceException.createMany({ data: chunk, skipDuplicates: true }),
  );
}

async function insertTrips(
  tx: PrismaTx,
  trips: Array<{
    id: string;
    routeId: string;
    serviceId: string;
    shapeId: string | null;
    headsign: string | null;
  }>,
) {
  const rows = trips.map((trip) => ({
    id: trip.id,
    routeId: trip.routeId,
    serviceId: trip.serviceId,
    shapeId: trip.shapeId,
    headsign: trip.headsign,
  }));

  await insertInChunks(rows, (chunk) =>
    tx.trip.createMany({ data: chunk, skipDuplicates: true }),
  );
}

async function insertStopTimes(
  tx: PrismaTx,
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
    tripId: stopTime.tripId,
    stopId: stopTime.stopId,
    stopSequence: stopTime.stopSequence,
    arrivalTime: stopTime.arrivalTime,
    departureTime: stopTime.departureTime,
    stopHeadsign: stopTime.stopHeadsign,
    pickupType: stopTime.pickupType,
    dropOffType: stopTime.dropOffType,
  }));

  await insertInChunks(
    rows,
    (chunk) => tx.stopTime.createMany({ data: chunk, skipDuplicates: true }),
    5000,
  );
}

async function insertShapePoints(
  tx: PrismaTx,
  shapePoints: Array<{
    shapeId: string;
    sequence: number;
    location: { lat: number; lon: number };
    distanceTraveledKm: number | null;
  }>,
) {
  const rows = shapePoints.map((point) => ({
    shapeId: point.shapeId,
    sequence: point.sequence,
    lat: point.location.lat,
    lon: point.location.lon,
    distTraveled: point.distanceTraveledKm,
  }));

  await insertInChunks(
    rows,
    (chunk) => tx.shapePoint.createMany({ data: chunk, skipDuplicates: true }),
    5000,
  );
}

async function insertInChunks<T>(
  rows: T[],
  insertChunk: (chunk: T[]) => Promise<unknown>,
  chunkSize = 1000,
) {
  for (let offset = 0; offset < rows.length; offset += chunkSize) {
    const chunk = rows.slice(offset, offset + chunkSize);
    await insertChunk(chunk);
  }
}

export function resolveZipPath(zipPathArg: string) {
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

async function main() {
  loadEnv();
  const zipPathArg = process.argv[2] ?? process.env.GTFS_ZIP_PATH;

  if (!zipPathArg) {
    console.error(
      'usage: bun run gtfs:import <path-to-zip> (or set GTFS_ZIP_PATH)',
    );
    process.exit(1);
  }

  const zipPath = resolveZipPath(zipPathArg);
  await importGtfsZip({ zipPath });
}

if (require.main === module) {
  void main();
}
