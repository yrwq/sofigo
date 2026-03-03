import type { ApiNearbyStop, ApiStopDeparture } from '@sofigo/transit-models';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useQueries, useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { getApiBaseUrl } from '@/lib/api';
import { fetchJson } from '@/lib/http';
import { palette, spacing } from '@/theme/theme';
import {
  formatClockTime,
  formatDisplayTime,
  timeToSeconds,
} from '@/utils/time';

export function NearbyScreen() {
  const apiBaseUrl = getApiBaseUrl();
  const [permission, setPermission] = useState<
    Location.PermissionStatus | 'unknown'
  >('unknown');
  const [position, setPosition] = useState<Location.LocationObject | null>(
    null,
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<any>();

  useEffect(() => {
    void requestLocation();
  }, []);

  const requestLocation = async () => {
    setLocationError(null);
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermission(status);
    if (status !== 'granted') {
      return;
    }
    try {
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      setPosition(current);
    } catch {
      setLocationError('Could not fetch your location.');
    }
  };

  const { data: stops, isFetching: isStopsLoading } = useQuery({
    queryKey: [
      'nearby-stops',
      position?.coords.latitude,
      position?.coords.longitude,
      apiBaseUrl,
    ],
    enabled: permission === 'granted' && !!position,
    queryFn: () =>
      fetchJson<ApiNearbyStop[]>(
        `${apiBaseUrl}/stops/nearby?lat=${position?.coords.latitude}&lon=${position?.coords.longitude}&radiusMeters=700&limit=12`,
      ),
  });

  const departuresQueries = useQueries({
    queries: (stops ?? []).map((stop) => ({
      queryKey: ['stops', stop.id, 'departures', apiBaseUrl],
      enabled: permission === 'granted',
      queryFn: () =>
      fetchJson<ApiStopDeparture[]>(
          `${apiBaseUrl}/stops/${stop.id}/departures?limit=3&time=${formatClockTime()}&lookbackMinutes=10`,
        ),
      staleTime: 20_000,
    })),
  });

  const departuresByStop = useMemo(() => {
    const map = new Map<string, ApiStopDeparture[]>();
    (stops ?? []).forEach((stop, index) => {
      const data = departuresQueries[index]?.data ?? [];
      map.set(stop.id, data);
    });
    return map;
  }, [departuresQueries, stops]);

  const content = () => {
    if (permission === 'unknown') {
      return (
        <View style={styles.card}>
          <Text style={styles.title}>Checking location</Text>
          <Text style={styles.body}>
            We only use your location to show nearby stops and departures.
          </Text>
        </View>
      );
    }

    if (permission !== 'granted') {
      return (
        <View style={styles.card}>
          <Text style={styles.title}>Enable location</Text>
          <Text style={styles.body}>
            We only use your location to show nearby stops and departures.
          </Text>
          <Pressable onPress={() => void requestLocation()}>
            <Text style={styles.action}>Allow location access</Text>
          </Pressable>
        </View>
      );
    }

    if (locationError) {
      return (
        <View style={styles.card}>
          <Text style={styles.title}>Location unavailable</Text>
          <Text style={styles.body}>{locationError}</Text>
          <Pressable onPress={() => void requestLocation()}>
            <Text style={styles.action}>Try again</Text>
          </Pressable>
        </View>
      );
    }

    return null;
  };

  const topContent = content();

  return (
    <Screen>
      {topContent ? <View style={styles.topSection}>{topContent}</View> : null}
      <FlatList
        data={stops ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: spacing.lg + tabBarHeight },
        ]}
        renderItem={({ item }) => {
          const departures = departuresByStop.get(item.id) ?? [];
          const nowSeconds = timeToSeconds(formatClockTime()) ?? 0;
          return (
            <View style={styles.stopCard}>
              <View style={styles.stopHeader}>
                <Text style={styles.stopName}>{item.name}</Text>
                <Text style={styles.distance}>
                  {formatDistance(item.distanceMeters)}
                </Text>
              </View>
              {item.description ? (
                <Text style={styles.stopDescription}>{item.description}</Text>
              ) : null}
              {departures.length === 0 ? (
                <Text style={styles.noDepartures}>No departures soon.</Text>
              ) : (
                <View style={styles.departures}>
                  {departures.map((dep) => {
                    const isActive = false;
                    return (
                      <Pressable
                        key={`${dep.tripId}-${dep.stopSequence}`}
                        onPress={() =>
                          navigation.navigate('Routes', {
                            screen: 'TripStops',
                            params: {
                              tripId: dep.tripId,
                              routeName:
                                dep.routeShortName && dep.routeLongName
                                  ? `${dep.routeShortName} · ${dep.routeLongName}`
                                  : dep.routeShortName || dep.routeLongName || 'Route',
                              headsign: dep.headsign,
                              currentStopId: item.id,
                              isPast: false,
                            },
                          })
                        }
                        style={styles.departureCard}
                      >
                        <View style={styles.routeBadgeWrap}>
                          <View
                            style={[
                              styles.routeBadge,
                              isActive && styles.routeBadgeActive,
                            ]}
                          >
                            <Text style={styles.routeBadgeText}>
                              {dep.routeShortName || '-'}
                            </Text>
                          </View>
                          {isActive ? <View style={styles.activeDot} /> : null}
                        </View>
                        <View style={styles.departureMeta}>
                          <View style={styles.departureRowHeader}>
                            <Text style={styles.departureTime}>
                              {formatDisplayTime(
                                dep.arrivalTime || dep.departureTime,
                              )}
                            </Text>
                            <Text style={styles.departureLabel}>
                              {formatMinutesAway(
                                dep.arrivalTime || dep.departureTime,
                                nowSeconds,
                              )}
                            </Text>
                          </View>
                          <Text style={styles.departureHeadsign}>
                            {dep.headsign
                              ? dep.headsign
                              : dep.routeLongName || 'Direction not specified'}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          );
        }}
      />
    </Screen>
  );
}

function formatDistance(distanceMeters: number) {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }
  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

function formatMinutesAway(timeValue: string | null | undefined, nowSeconds: number) {
  const target = timeToSeconds(timeValue);
  if (target === null) {
    return '';
  }
  const diff = Math.max(0, Math.round((target - nowSeconds) / 60));
  return diff === 0 ? 'now' : `${diff} min`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: 18,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.ink,
  },
  body: {
    fontSize: 14,
    color: palette.muted,
  },
  action: {
    marginTop: spacing.sm,
    color: palette.accent,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  list: {
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  topSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  stopCard: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: spacing.md,
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
    gap: spacing.xs,
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  stopName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: palette.ink,
  },
  stopDescription: {
    fontSize: 13,
    color: palette.muted,
  },
  distance: {
    fontSize: 13,
    color: palette.muted,
  },
  departures: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  departureCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: palette.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 1,
      },
      default: {
        borderWidth: 1,
        borderColor: palette.border,
      },
    }),
  },
  routeBadgeWrap: {
    alignItems: 'center',
    gap: 4,
  },
  departureRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  routeBadge: {
    width: 42,
    height: 28,
    borderRadius: 10,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: palette.accent,
  },
  departureMeta: {
    flex: 1,
    gap: 2,
  },
  departureTime: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.ink,
  },
  departureLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.muted,
  },
  routeBadgeActive: {
    backgroundColor: '#0f172a',
  },
  departureHeadsign: {
    fontSize: 13,
    color: palette.muted,
  },
  noDepartures: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: palette.muted,
  },
});
