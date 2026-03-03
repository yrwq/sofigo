import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ApiRouteTrip } from '@sofigo/transit-models';
import { useQuery } from '@tanstack/react-query';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { getApiBaseUrl } from '@/lib/api';
import { fetchJson } from '@/lib/http';
import type { RoutesStackParamList } from '@/screens/routes/RoutesStack';
import { palette, spacing } from '@/theme/theme';
import {
  formatClockTime,
  formatDisplayTime,
  timeToSeconds,
} from '@/utils/time';

type Props = NativeStackScreenProps<RoutesStackParamList, 'RouteTrips'>;

export function RouteTripsScreen({ route, navigation }: Props) {
  const apiBaseUrl = getApiBaseUrl();
  const { routeId, routeName } = route.params;

  const { data, isError, refetch } = useQuery({
    queryKey: ['routes', routeId, 'trips', apiBaseUrl],
    queryFn: () =>
      fetchJson<ApiRouteTrip[]>(
        `${apiBaseUrl}/routes/${routeId}/trips?limit=200&time=${formatClockTime()}`,
      ),
  });

  const trips = (data ?? []).map((trip) => {
    const first =
      timeToSeconds(trip.firstDepartureTime) ??
      timeToSeconds(trip.firstArrivalTime) ??
      null;
    const last =
      timeToSeconds(trip.lastDepartureTime) ??
      timeToSeconds(trip.lastArrivalTime) ??
      null;
    const current =
      timeToSeconds(trip.currentDepartureTime) ??
      timeToSeconds(trip.currentArrivalTime) ??
      null;

    const status = trip.isActive ? 'active' : trip.isPast ? 'past' : 'upcoming';

    return {
      ...trip,
      status,
      sortKey: current ?? first ?? last ?? 0,
    };
  });

  const orderedTrips = trips.sort((a, b) => {
    const rank = (value: typeof a.status) =>
      value === 'past' ? 0 : value === 'active' ? 1 : 2;
    const rankDiff = rank(a.status) - rank(b.status);
    if (rankDiff !== 0) {
      return rankDiff;
    }
    return a.sortKey - b.sortKey;
  });

  return (
    <Screen>
      {isError ? (
        <Pressable onPress={() => void refetch()}>
          <Text style={styles.errorText}>Could not load departures.</Text>
        </Pressable>
      ) : null}
      <FlatList
        data={orderedTrips}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, item.status === 'past' && styles.cardVisited]}
            onPress={() =>
              navigation.navigate('TripStops', {
                tripId: item.id,
                routeName,
                headsign: item.headsign,
                currentStopId: item.currentStopId,
                isPast: item.status === 'past',
              })
            }
          >
            <View style={styles.row}>
              <View
                style={[
                  styles.line,
                  item.status === 'past' && styles.lineVisited,
                  item.status === 'active' && styles.lineActive,
                ]}
              />
              <View style={styles.content}>
                <Text style={styles.time}>
                  {formatDisplayTime(
                    item.currentDepartureTime ??
                      item.currentArrivalTime ??
                      item.firstDepartureTime ??
                      item.firstArrivalTime,
                  )}
                </Text>
                <Text style={styles.headsign}>
                  {item.currentStopName ||
                    item.headsign ||
                    item.firstStopName ||
                    'Direction not specified'}
                </Text>
              </View>
            </View>
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
  cardVisited: {
    backgroundColor: '#edf2f7',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  line: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 999,
    backgroundColor: palette.border,
  },
  lineActive: {
    backgroundColor: palette.accent,
  },
  lineVisited: {
    backgroundColor: palette.muted,
  },
  content: {
    flex: 1,
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
