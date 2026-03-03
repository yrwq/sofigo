import { StopsService } from '@/stops/stops.service';

describe('StopsService', () => {
  it('returns nearby stops from raw query', async () => {
    const prisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: '1', name: 'Test' }]),
    } as unknown as {
      $queryRaw: () => Promise<Array<{ id: string; name: string }>>;
    };
    const service = new StopsService(prisma);

    const result = await service.nearbyStops({
      lat: 46.0,
      lon: 18.0,
      radiusMeters: 500,
      limit: 10,
    });

    expect(prisma.$queryRaw).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1', name: 'Test' }]);
  });

  it('lists routes for a stop', async () => {
    const prisma = {
      $queryRaw: jest.fn().mockResolvedValue([]),
    } as unknown as {
      $queryRaw: () => Promise<unknown>;
    };
    const service = new StopsService(prisma);

    await service.stopRoutes('stop-1', { date: '2026-03-03', limit: 10 });

    expect(prisma.$queryRaw).toHaveBeenCalled();
  });
});
