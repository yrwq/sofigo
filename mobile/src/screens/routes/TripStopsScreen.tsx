import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ApiTripStopTime } from '@sofigo/transit-models';
import { useQuery } from '@tanstack/react-query';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { getApiBaseUrl } from '@/lib/api';
import { fetchJson } from '@/lib/http';
import type { RoutesStackParamList } from '@/screens/routes/RoutesStack';
import { palette, spacing } from '@/theme/theme';
import { formatDisplayTime } from '@/utils/time';

type Props = NativeStackScreenProps<RoutesStackParamList, 'TripStops'>;

export function TripStopsScreen({ route }: Props) {
  const apiBaseUrl = getApiBaseUrl();
  const { tripId } = route.params;

  const { data, isError } = useQuery({
    queryKey: ['trips', tripId, 'stop-times', apiBaseUrl],
    queryFn: () =>
      fetchJson<ApiTripStopTime[]>(
        `${apiBaseUrl}/trips/${tripId}/stop-times?limit=200`,
      ),
  });

  return (
    <Screen>
      {isError ? (
        <Text style={styles.errorText}>Could not load stops.</Text>
      ) : null}
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => `${item.stopId}-${item.stopSequence}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.card}>
              <Text style={styles.stopName}>{item.stopName}</Text>
              <Text style={styles.meta}>
                {formatDisplayTime(item.departureTime || item.arrivalTime)}
              </Text>
            </View>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: 14,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 4,
  },
  stopName: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.ink,
  },
  meta: {
    fontSize: 12,
    color: palette.muted,
  },
  errorText: {
    color: palette.danger,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
});
