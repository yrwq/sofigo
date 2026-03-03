import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ApiRouteSummary } from '@sofigo/transit-models';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { RouteCard } from '@/components/RouteCard';
import { Screen } from '@/components/Screen';
import { getApiBaseUrl } from '@/lib/api';
import { fetchJson } from '@/lib/http';
import type { RoutesStackParamList } from '@/screens/routes/RoutesStack';
import { palette, spacing } from '@/theme/theme';
import { normalizeText } from '@/utils/text';

type Props = NativeStackScreenProps<RoutesStackParamList, 'RoutesList'>;

export function RoutesListScreen({ navigation }: Props) {
  const apiBaseUrl = getApiBaseUrl();
  const [query, setQuery] = useState('');

  const { data, isError, refetch } = useQuery({
    queryKey: ['routes', apiBaseUrl],
    queryFn: () => fetchJson<ApiRouteSummary[]>(`${apiBaseUrl}/routes`),
  });

  const filtered = useMemo(() => {
    if (!data) {
      return [];
    }
    const lowered = normalizeText(query.trim());
    if (!lowered) {
      return data;
    }
    return data.filter((route) =>
      normalizeText(`${route.shortName} ${route.longName}`).includes(lowered),
    );
  }, [data, query]);

  return (
    <Screen>
      <TextInput
        style={styles.search}
        placeholder="Search"
        placeholderTextColor={palette.muted}
        value={query}
        onChangeText={setQuery}
      />
      {isError ? (
        <Pressable onPress={() => void refetch()}>
          <Text style={styles.errorText}>
            Could not load routes. Tap to retry.
          </Text>
        </Pressable>
      ) : null}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate('RouteTrips', {
                routeId: item.id,
                routeName: item.shortName || item.longName || 'Route',
              })
            }
          >
            <RouteCard
              shortName={item.shortName}
              longName={item.longName}
              color={item.color}
              textColor={item.textColor}
            />
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: palette.card,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: palette.ink,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  errorText: {
    color: palette.danger,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
});
