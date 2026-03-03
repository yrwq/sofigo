import 'dotenv/config';
import type { ExpoConfig, ConfigContext } from 'expo/config';
import appJson from './app.json';

export default ({ config }: ConfigContext): ExpoConfig => {
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
