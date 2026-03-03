import { BadRequestException } from '@nestjs/common';
import { StopsController } from '@/stops/stops.controller';

describe('StopsController', () => {
  it('rejects invalid nearby query params', async () => {
    const service = {
      nearbyStops: jest.fn(),
      stopDepartures: jest.fn(),
    } as unknown as {
      nearbyStops: (query: unknown) => Promise<unknown>;
      stopDepartures: (id: string, query: unknown) => Promise<unknown>;
    };
    const controller = new StopsController(service);

    await expect(controller.nearby({})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects invalid departures query params', async () => {
    const service = {
      nearbyStops: jest.fn(),
      stopDepartures: jest.fn(),
    } as unknown as {
      nearbyStops: (query: unknown) => Promise<unknown>;
      stopDepartures: (id: string, query: unknown) => Promise<unknown>;
    };
    const controller = new StopsController(service);

    await expect(
      controller.departures('1', { time: '99:99' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
