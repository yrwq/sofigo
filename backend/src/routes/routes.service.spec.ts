import { RoutesService } from '@/routes/routes.service';

describe('RoutesService', () => {
  it('lists routes ordered by short name', async () => {
    const prisma = {
      route: {
        findMany: jest.fn().mockResolvedValue([{ id: '100' }]),
      },
    } as unknown as {
      route: { findMany: (args: unknown) => Promise<Array<{ id: string }>> };
    };

    const service = new RoutesService(prisma);
    const result = await service.listRoutes();

    expect(prisma.route.findMany).toHaveBeenCalledWith({
      orderBy: [{ shortName: 'asc' }],
    });
    expect(result).toEqual([{ id: '100' }]);
  });
});
