import { resolve } from 'node:path';
import { loadStaticGtfsDataset } from './gtfs-loader';

describe('loadStaticGtfsDataset', () => {
  it('reads GTFS tables from zip', async () => {
    const dataset = await loadStaticGtfsDataset(
      resolve(__dirname, '../../../gtfs/20251217.zip'),
    );

    expect(dataset.routes.length).toBeGreaterThan(0);
    expect(dataset.stops.length).toBeGreaterThan(0);
    expect(dataset.trips.length).toBeGreaterThan(0);
    expect(dataset.stopTimes.length).toBeGreaterThan(0);
    expect(dataset.calendars.length).toBeGreaterThan(0);
    expect(dataset.serviceExceptions.length).toBeGreaterThan(0);
    expect(dataset.shapePoints.length).toBeGreaterThan(0);
  });

  it('maps fields into models', async () => {
    const dataset = await loadStaticGtfsDataset(
      resolve(__dirname, '../../../gtfs/20251217.zip'),
    );

    expect(dataset.routes[0]).toEqual({
      id: '100',
      shortName: '1',
      longName: 'Uránváros - Csontváry utca - Uránváros',
      color: '2FB457',
      textColor: 'FFFFFF',
    });

    expect(dataset.stops[0]).toEqual({
      id: '101',
      name: 'Kertváros',
      description: '1-es kocsiállás',
      location: {
        lat: 46.036198,
        lon: 18.229284,
      },
      parentStationId: null,
    });

    expect(dataset.trips[0]).toEqual({
      id: '1-d24-1010-265117',
      routeId: '100',
      serviceId: 'd24',
      shapeId: '1',
      headsign: null,
    });

    expect(dataset.stopTimes[0]).toEqual({
      tripId: '1-d24-1010-265117',
      stopId: '54901',
      stopSequence: 0,
      arrivalTime: '10:10:00',
      departureTime: '10:10:00',
      stopHeadsign: 'Csontváry utca',
      pickupType: 0,
      dropOffType: 0,
    });

    expect(dataset.calendars[0]).toEqual({
      id: 'd24',
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: true,
      sunday: false,
      startDate: '20251217',
      endDate: '20260619',
    });

    expect(dataset.serviceExceptions[0]).toEqual({
      serviceId: 'd24',
      date: '20251217',
      exceptionType: 2,
    });

    expect(dataset.shapePoints[0]).toEqual({
      shapeId: '1',
      sequence: 0,
      location: {
        lat: 46.065634,
        lon: 18.187791,
      },
      distanceTraveledKm: 0,
    });
  });
});
