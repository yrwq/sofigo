import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { loadEnv } from '../src/config/load-env';

loadEnv();

if (!process.env.DATABASE_URL) {
  const user = process.env.POSTGRES_USER ?? 'postgres';
  const password = process.env.POSTGRES_PASSWORD ?? 'postgres';
  const database = process.env.POSTGRES_DB ?? 'sofigo';
  const host = process.env.POSTGRES_HOST ?? 'localhost';
  const port = process.env.POSTGRES_PORT ?? '5432';
  process.env.DATABASE_URL = `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

const prismaBin = resolve(process.cwd(), 'node_modules', '.bin', 'prisma');
const args = process.argv.slice(2);

const result = spawnSync(prismaBin, args, {
  stdio: 'inherit',
  env: process.env,
});

if (result.status === null) {
  process.exit(1);
}

process.exit(result.status);
