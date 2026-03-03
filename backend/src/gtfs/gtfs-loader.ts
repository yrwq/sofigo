import { readFile } from 'node:fs/promises';
import type {
  ServiceCalendar,
  ServiceException,
  ShapePoint,
  TransitRoute,
  TransitStop,
  TransitTrip,
  TripStopTime,
} from '@sofigo/transit-models';
import { parse } from 'csv-parse/sync';
import JSZip from 'jszip';

type CsvRow = Record<string, string>;

export type StaticGtfsDataset = {
  routes: TransitRoute[];
  stops: TransitStop[];
  trips: TransitTrip[];
  stopTimes: TripStopTime[];
  calendars: ServiceCalendar[];
  serviceExceptions: ServiceException[];
  shapePoints: ShapePoint[];
};

export async function loadStaticGtfsDataset(
  zipPath: string,
): Promise<StaticGtfsDataset> {
  const zipBuffer = await readFile(zipPath);
  const zip = await JSZip.loadAsync(zipBuffer);

  return {
    routes: mapRoutes(await readCsv(zip, 'routes.txt')),
    stops: mapStops(await readCsv(zip, 'stops.txt')),
    trips: mapTrips(await readCsv(zip, 'trips.txt')),
    stopTimes: mapStopTimes(await readCsv(zip, 'stop_times.txt')),
    calendars: mapCalendars(await readCsv(zip, 'calendar.txt')),
    serviceExceptions: mapServiceExceptions(
      await readCsv(zip, 'calendar_dates.txt'),
    ),
    shapePoints: mapShapePoints(await readCsv(zip, 'shapes.txt')),
  };
}

async function readCsv(zip: JSZip, fileName: string): Promise<CsvRow[]> {
  const entry = zip.file(fileName);

  if (!entry) {
    throw new Error(`Missing GTFS file: ${fileName}`);
  }

  const csv = await entry.async('string');

  return parse(csv, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[];
}

function mapRoutes(rows: CsvRow[]): TransitRoute[] {
  return rows.map((row) => ({
    id: row.route_id,
    shortName: row.route_short_name,
    longName: row.route_long_name,
    color: nullableString(row.route_color),
    textColor: nullableString(row.route_text_color),
  }));
}

function mapStops(rows: CsvRow[]): TransitStop[] {
  return rows.map((row) => ({
    id: row.stop_id,
    name: row.stop_name,
    description: nullableString(row.stop_desc),
    location: {
      lat: Number(row.stop_lat),
      lon: Number(row.stop_lon),
    },
    parentStationId: nullableString(row.parent_station),
  }));
}

function mapTrips(rows: CsvRow[]): TransitTrip[] {
  return rows.map((row) => ({
    id: row.trip_id,
    routeId: row.route_id,
    serviceId: row.service_id,
    shapeId: nullableString(row.shape_id),
    headsign: nullableString(row.trip_headsign),
  }));
}

function mapStopTimes(rows: CsvRow[]): TripStopTime[] {
  return rows.map((row) => ({
    tripId: row.trip_id,
    stopId: row.stop_id,
    stopSequence: Number(row.stop_sequence),
    arrivalTime: row.arrival_time,
    departureTime: row.departure_time,
    stopHeadsign: nullableString(row.stop_headsign),
    pickupType: nullableNumber(row.pickup_type),
    dropOffType: nullableNumber(row.drop_off_type),
  }));
}

function mapCalendars(rows: CsvRow[]): ServiceCalendar[] {
  return rows.map((row) => ({
    id: row.service_id,
    monday: row.monday === '1',
    tuesday: row.tuesday === '1',
    wednesday: row.wednesday === '1',
    thursday: row.thursday === '1',
    friday: row.friday === '1',
    saturday: row.saturday === '1',
    sunday: row.sunday === '1',
    startDate: row.start_date,
    endDate: row.end_date,
  }));
}

function mapServiceExceptions(rows: CsvRow[]): ServiceException[] {
  return rows.map((row) => ({
    serviceId: row.service_id,
    date: row.date,
    exceptionType: Number(row.exception_type) as 1 | 2,
  }));
}

function mapShapePoints(rows: CsvRow[]): ShapePoint[] {
  return rows.map((row) => ({
    shapeId: row.shape_id,
    sequence: Number(row.shape_pt_sequence),
    location: {
      lat: Number(row.shape_pt_lat),
      lon: Number(row.shape_pt_lon),
    },
    distanceTraveledKm: nullableNumber(row.shape_dist_traveled),
  }));
}

function nullableString(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  return value;
}

function nullableNumber(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  return Number(value);
}
