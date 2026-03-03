import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createSqlClient } from '@/db/postgres';

const DEFAULT_DB_URL = 'postgresql://postgres:postgres@localhost:5432/sofigo';

async function main() {
  const schemaPath =
    process.argv[2] ??
    process.env.DB_SCHEMA_PATH ??
    resolve(process.cwd(), '../docker/postgres/init/02-schema.sql');
  const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DB_URL;

  const sql = createSqlClient(databaseUrl);
  const schemaSql = await readFile(schemaPath, 'utf-8');

  await sql.unsafe(schemaSql);
  await sql.end({ timeout: 5 });

  console.log('Database schema applied.');
}

void main();
