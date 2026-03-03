import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import type { ConfigContext, ExpoConfig } from 'expo/config';
import appJson from './app.json';

export default ({ config }: ConfigContext): ExpoConfig => {
  const rootEnv = resolve(process.cwd(), '..', '.env');
  const localEnv = resolve(process.cwd(), '.env');

  if (existsSync(localEnv)) {
    dotenv.config({ path: localEnv });
  } else if (existsSync(rootEnv)) {
    dotenv.config({ path: rootEnv });
  }

  const baseConfig = appJson.expo;

  return {
    ...config,
    ...baseConfig,
    extra: {
      ...baseConfig.extra,
      apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:3000',
    },
  };
};
