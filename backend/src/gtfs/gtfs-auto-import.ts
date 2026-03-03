import { readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { DEFAULT_DB_URL, importGtfsZip } from '@/gtfs/gtfs-importer';

const DEFAULT_GTFS_DIR = resolve(process.cwd(), '..', 'gtfs');

export async function autoImportGtfsIfNeeded() {
  const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DB_URL;
  let prisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  });

  try {
    const routeCount = await prisma.route.count();
    const stopTimeCount = await prisma.stopTime.count();
    if (routeCount > 0 && stopTimeCount > 0) {
      return;
    }
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === 'P2021') {
      await prisma.$disconnect();
      const pushed = runPrismaPush();
      if (!pushed) {
        return;
      }
      prisma = new PrismaClient({
        datasources: { db: { url: databaseUrl } },
      });
      const routeCount = await prisma.route.count();
      const stopTimeCount = await prisma.stopTime.count();
      if (routeCount > 0 && stopTimeCount > 0) {
        return;
      }
    } else {
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }

  const zipPath = await resolveAutoZipPath();
  if (!zipPath) {
    console.warn(
      'GTFS auto-import skipped: no zip found in /gtfs.',
    );
    return;
  }

  console.log(`GTFS auto-import starting from ${zipPath}`);
  await importGtfsZip({ zipPath, databaseUrl });
}

async function resolveAutoZipPath(): Promise<string | null> {
  const dir = DEFAULT_GTFS_DIR;

  try {
    const entries = await readdir(dir);
    const zips = entries.filter((entry) => entry.toLowerCase().endsWith('.zip'));
    if (zips.length === 0) {
      return null;
    }
    const stats = await Promise.all(
      zips.map(async (zip) => ({
        name: zip,
        info: await stat(resolve(dir, zip)),
      })),
    );
    stats.sort((a, b) => b.info.mtimeMs - a.info.mtimeMs);
    return resolve(dir, stats[0].name);
  } catch {
    return null;
  }
}

function runPrismaPush() {
  console.log('Applying Prisma schema (auto).');
  const result = spawnSync('bun', ['run', 'prisma:push'], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  if (result.status !== 0) {
    console.warn('Prisma schema apply failed. Skipping GTFS auto-import.');
    return false;
  }
  return true;
}
