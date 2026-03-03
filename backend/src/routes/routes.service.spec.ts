import { RoutesService } from '@/routes/routes.service';

describe('RoutesService', () => {
  it('lists routes ordered by short name', async () => {
    const prisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: '100' }]),
    } as unknown as {
      $queryRaw: () => Promise<unknown>;
    };

    const service = new RoutesService(prisma);
    const result = await service.listRoutes();

    expect(prisma.$queryRaw).toHaveBeenCalled();
    expect(result).toEqual([{ id: '100' }]);
  });

  it('fetches a route by id', async () => {
    const prisma = {
      route: {
        findUnique: jest.fn().mockResolvedValue({ id: '200' }),
      },
      $queryRaw: jest.fn(),
    } as unknown as {
      route: { findUnique: (args: unknown) => Promise<{ id: string }> };
      $queryRaw: () => Promise<unknown>;
    };

    const service = new RoutesService(prisma);
    const result = await service.getRoute('200');

    expect(prisma.route.findUnique).toHaveBeenCalledWith({
      where: { id: '200' },
    });
    expect(result).toEqual({ id: '200' });
  });

  it('lists trips for a route', async () => {
    const prisma = {
      route: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      $queryRaw: jest.fn().mockResolvedValue([]),
    } as unknown as {
      $queryRaw: () => Promise<unknown>;
    };

    const service = new RoutesService(prisma);
    await service.listTrips('300', {
      date: '2026-03-03',
      time: '08:00:00',
      limit: 5,
    });

    expect(prisma.$queryRaw).toHaveBeenCalled();
  });

  it('lists stops for a route', async () => {
    const prisma = {
      route: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      $queryRaw: jest.fn().mockResolvedValue([]),
    } as unknown as {
      $queryRaw: () => Promise<unknown>;
    };

    const service = new RoutesService(prisma);
    await service.listStops('400', { date: '2026-03-03', limit: 50 });

    expect(prisma.$queryRaw).toHaveBeenCalled();
  });
});
