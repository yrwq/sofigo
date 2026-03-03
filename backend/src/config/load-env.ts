import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

export function loadEnv() {
  const cwdEnv = resolve(process.cwd(), '.env');
  const rootEnv = resolve(process.cwd(), '..', '.env');

  if (existsSync(cwdEnv)) {
    dotenv.config({ path: cwdEnv });
    return;
  }

  if (existsSync(rootEnv)) {
    dotenv.config({ path: rootEnv });
  }
}
