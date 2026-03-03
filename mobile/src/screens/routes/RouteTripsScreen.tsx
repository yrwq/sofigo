import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ApiRouteTrip } from '@sofigo/transit-models';
import { useQuery } from '@tanstack/react-query';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { getApiBaseUrl } from '@/lib/api';
import { fetchJson } from '@/lib/http';
import type { RoutesStackParamList } from '@/screens/routes/RoutesStack';
import { palette, spacing } from '@/theme/theme';
import { formatClockTime, formatDisplayTime } from '@/utils/time';

type Props = NativeStackScreenProps<RoutesStackParamList, 'RouteTrips'>;

export function RouteTripsScreen({ route, navigation }: Props) {
  const apiBaseUrl = getApiBaseUrl();
  const { routeId, routeName } = route.params;

  const { data, isError, refetch } = useQuery({
    queryKey: ['routes', routeId, 'trips', apiBaseUrl],
    queryFn: () =>
      fetchJson<ApiRouteTrip[]>(
        `${apiBaseUrl}/routes/${routeId}/trips?limit=80&time=${formatClockTime()}`,
      ),
  });

  return (
    <Screen>
      {isError ? (
        <Pressable onPress={() => void refetch()}>
          <Text style={styles.errorText}>Could not load departures.</Text>
        </Pressable>
      ) : null}
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate('TripStops', {
                tripId: item.id,
                routeName,
                headsign: item.headsign,
              })
            }
          >
            <Text style={styles.time}>
              {formatDisplayTime(
                item.firstDepartureTime ?? item.firstArrivalTime,
              )}
            </Text>
            <Text style={styles.headsign}>
              {item.headsign || item.firstStopName || 'Direction not specified'}
            </Text>
          </Pressable>
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
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    gap: spacing.xs,
  },
  time: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.ink,
  },
  headsign: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.ink,
  },
  errorText: {
    color: palette.danger,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
});
