import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ApiTripStopTime } from '@sofigo/transit-models';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
import {
  FlatList,
  InteractionManager,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/Screen';
import { getApiBaseUrl } from '@/lib/api';
import { fetchJson } from '@/lib/http';
import type { RoutesStackParamList } from '@/screens/routes/RoutesStack';
import { palette, spacing } from '@/theme/theme';
import { formatDisplayTime } from '@/utils/time';

type Props = NativeStackScreenProps<RoutesStackParamList, 'TripStops'>;

export function TripStopsScreen({ route }: Props) {
  const apiBaseUrl = getApiBaseUrl();
  const { tripId, currentStopId, isPast } = route.params;
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const { data, isError } = useQuery({
    queryKey: ['trips', tripId, 'stop-times', apiBaseUrl],
    queryFn: () =>
      fetchJson<ApiTripStopTime[]>(
        `${apiBaseUrl}/trips/${tripId}/stop-times?limit=200`,
      ),
  });

  const listRef = useRef<FlatList<ApiTripStopTime>>(null);
  const stopIndex = useMemo(() => {
    if (!currentStopId) {
      return -1;
    }
    return (data ?? []).findIndex((stop) => stop.stopId === currentStopId);
  }, [currentStopId, data]);

  useFocusEffect(() => {
    if (stopIndex <= 0) {
      return;
    }
    const task = InteractionManager.runAfterInteractions(() => {
      const timer = setTimeout(() => {
        listRef.current?.scrollToIndex({
          index: stopIndex,
          animated: true,
          viewPosition: 0.15,
        });
      }, 120);
      return () => clearTimeout(timer);
    });
    return () => task.cancel();
  });

  return (
    <Screen>
      {isError ? (
        <Text style={styles.errorText}>Could not load stops.</Text>
      ) : null}
      <FlatList
        data={data ?? []}
        ref={listRef}
        keyExtractor={(item) => `${item.stopId}-${item.stopSequence}`}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: spacing.xl + tabBarHeight + insets.bottom },
        ]}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.timeline}>
              <View
                style={[
                  styles.line,
                  (isPast ||
                    isPastStop(data ?? [], currentStopId ?? '', item.stopId)) &&
                    styles.lineVisited,
                  item.stopId === currentStopId && styles.lineCurrent,
                ]}
              />
            </View>
            <View
              style={[
                styles.card,
                (isPast ||
                  (currentStopId &&
                    item.stopId !== currentStopId &&
                    isPastStop(data ?? [], currentStopId, item.stopId))) &&
                  styles.cardVisited,
              ]}
            >
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

function isPastStop(
  stops: ApiTripStopTime[],
  currentId: string,
  stopId: string,
) {
  const currentIndex = stops.findIndex((stop) => stop.stopId === currentId);
  const stopIndex = stops.findIndex((stop) => stop.stopId === stopId);
  if (currentIndex === -1 || stopIndex === -1) {
    return false;
  }
  return stopIndex < currentIndex;
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'stretch',
  },
  timeline: {
    width: 12,
    alignItems: 'center',
    justifyContent: 'stretch',
  },
  line: {
    width: 3,
    flex: 1,
    backgroundColor: palette.border,
    borderRadius: 999,
  },
  lineVisited: {
    backgroundColor: palette.muted,
  },
  lineCurrent: {
    backgroundColor: palette.accent,
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
  cardVisited: {
    backgroundColor: '#edf2f7',
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
