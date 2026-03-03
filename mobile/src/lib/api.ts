import Constants from 'expo-constants';

function getExpoHost() {
  const expoHostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (!expoHostUri) {
    return null;
  }

  return expoHostUri.split(':')[0] ?? null;
}

export function getApiBaseUrl() {
  const explicitUrl = process.env.EXPO_PUBLIC_API_URL;

  if (explicitUrl) {
    return explicitUrl;
  }

  const host = getExpoHost();

  if (!host) {
    return 'http://127.0.0.1:3000';
  }

  return `http://${host}:3000`;
}
