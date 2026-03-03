import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getApiBaseUrl } from '@/lib/api';

export default function App() {
  const [message, setMessage] = useState('loading');
  const [error, setError] = useState<string | null>(null);
  const apiBaseUrl = getApiBaseUrl();

  const loadGreeting = useCallback(async () => {
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/`);

      if (!response.ok) {
        throw new Error(`failed with status ${response.status}`);
      }

      const text = await response.text();
      setMessage(text);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'unknown network error',
      );
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    void loadGreeting();
  }, [loadGreeting]);

  return (
    <View style={styles.container}>
      <Text style={styles.url}>{apiBaseUrl}</Text>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <Text style={styles.message}>{message}</Text>
      )}
      <Pressable onPress={() => void loadGreeting()} style={styles.button}>
        <Text style={styles.buttonLabel}>retry</Text>
      </Pressable>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  url: {
    color: '#0f172a',
    fontSize: 14,
    opacity: 0.7,
  },
  message: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '600',
  },
  error: {
    color: '#b91c1c',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonLabel: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
});
