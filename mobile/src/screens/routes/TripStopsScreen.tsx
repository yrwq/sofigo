import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ApiShapePoint, ApiTripStopTime } from '@sofigo/transit-models';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  InteractionManager,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type MapViewType from 'react-native-maps';
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
  const [showMap, setShowMap] = useState(true);

  const { data, isError } = useQuery({
    queryKey: ['trips', tripId, 'stop-times', apiBaseUrl],
    queryFn: () =>
      fetchJson<ApiTripStopTime[]>(
        `${apiBaseUrl}/trips/${tripId}/stop-times?limit=200`,
      ),
  });

  const { data: shapePoints } = useQuery({
    queryKey: ['trips', tripId, 'shape', apiBaseUrl],
    enabled: showMap,
    queryFn: () => fetchJson<ApiShapePoint[]>(`${apiBaseUrl}/trips/${tripId}/shape`),
  });

  const listRef = useRef<FlatList<ApiTripStopTime>>(null);
  const mapRef = useRef<MapViewType>(null);
  const stopIndex = useMemo(() => {
    if (!currentStopId) {
      return -1;
    }
    return (data ?? []).findIndex((stop) => stop.stopId === currentStopId);
  }, [currentStopId, data]);

  useFocusEffect(
    useCallback(() => {
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
  }, [stopIndex]));

  const mapCoords = useMemo(
    () =>
      (shapePoints ?? []).map((point) => ({
        latitude: point.lat,
        longitude: point.lon,
      })),
    [shapePoints],
  );

  useFocusEffect(
    useCallback(() => {
    if (!showMap || mapCoords.length === 0) {
      return;
    }
    const task = InteractionManager.runAfterInteractions(() => {
      const timer = setTimeout(() => {
        mapRef.current?.fitToCoordinates(mapCoords, {
          edgePadding: {
            top: 40,
            right: 40,
            bottom: 40,
            left: 40,
          },
          animated: true,
        });
      }, 160);
      return () => clearTimeout(timer);
    });
    return () => task.cancel();
  }, [mapCoords, showMap]));

  const maps = Platform.OS === 'web' ? null : require('react-native-maps');
  const MapView = maps?.default as typeof MapViewType | undefined;
  const Polyline = maps?.Polyline as
    | ((props: { coordinates: Array<{ latitude: number; longitude: number }>; strokeColor: string; strokeWidth: number }) => JSX.Element)
    | undefined;

  return (
    <Screen>
      <FlatList
        data={data ?? []}
        ref={listRef}
        keyExtractor={(item) => `${item.stopId}-${item.stopSequence}`}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: spacing.lg + tabBarHeight },
        ]}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Stops</Text>
              <Text
                style={styles.toggle}
                onPress={() => setShowMap((value) => !value)}
              >
                {showMap ? 'Hide map' : 'Show map'}
              </Text>
            </View>
            {isError ? (
              <Text style={styles.errorText}>Could not load stops.</Text>
            ) : null}
            {showMap ? (
              !MapView || !Polyline ? (
                <View style={styles.mapPlaceholder}>
                  <Text style={styles.mapPlaceholderText}>
                    Map view not supported on this platform.
                  </Text>
                </View>
              ) : mapCoords.length === 0 ? (
                <View style={styles.mapPlaceholder}>
                  <Text style={styles.mapPlaceholderText}>
                    No shape data for this trip.
                  </Text>
                </View>
              ) : (
                <View style={styles.mapWrap}>
                  <MapView ref={mapRef} style={styles.map} showsUserLocation={false}>
                    <Polyline
                      coordinates={mapCoords}
                      strokeColor={palette.accent}
                      strokeWidth={4}
                    />
                  </MapView>
                </View>
              )
            ) : null}
          </View>
        }
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.ink,
  },
  toggle: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.accent,
  },
  mapWrap: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    height: 120,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  mapPlaceholderText: {
    fontSize: 13,
    color: palette.muted,
  },
  list: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
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
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 2,
      },
      default: {
        borderWidth: 1,
        borderColor: palette.border,
      },
    }),
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
