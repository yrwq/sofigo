import { TripsService } from '@/trips/trips.service';

describe('TripsService', () => {
  it('lists stop times for a trip', async () => {
    const prisma = {
      $queryRaw: jest.fn().mockResolvedValue([]),
    } as unknown as {
      $queryRaw: () => Promise<unknown>;
    };

    const service = new TripsService(prisma);
    await service.listStopTimes('T1', { limit: 5 });

    expect(prisma.$queryRaw).toHaveBeenCalled();
  });
});
