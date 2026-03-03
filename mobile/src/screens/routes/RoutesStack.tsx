import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RoutesListScreen } from '@/screens/routes/RoutesListScreen';
import { RouteTripsScreen } from '@/screens/routes/RouteTripsScreen';
import { TripStopsScreen } from '@/screens/routes/TripStopsScreen';
import { palette, spacing } from '@/theme/theme';

export type RoutesStackParamList = {
  RoutesList: undefined;
  RouteTrips: { routeId: string; routeName: string };
  TripStops: {
    tripId: string;
    routeName: string;
    headsign?: string | null;
    currentStopId?: string | null;
    isPast?: boolean;
  };
};

const Stack = createNativeStackNavigator<RoutesStackParamList>();

export function RoutesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.surface },
        headerTitleStyle: { color: palette.ink, fontWeight: '700' },
        headerTintColor: palette.ink,
        contentStyle: { backgroundColor: palette.surface },
      }}
    >
      <Stack.Screen
        name="RoutesList"
        component={RoutesListScreen}
        options={{ title: 'Routes' }}
      />
      <Stack.Screen
        name="RouteTrips"
        component={RouteTripsScreen}
        options={({ route, navigation }) => ({
          title: route.params.routeName,
          headerLeft: () => (
            <BackButton
              onPress={() => {
                navigation.navigate('RoutesList');
              }}
            />
          ),
        })}
      />
      <Stack.Screen
        name="TripStops"
        component={TripStopsScreen}
        options={({ route, navigation }) => ({
          title: route.params.headsign
            ? `${route.params.routeName} · ${route.params.headsign}`
            : route.params.routeName,
          headerLeft: () => (
            <BackButton
              onPress={() => {
                navigation.navigate('RoutesList');
              }}
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
}

type BackButtonProps = {
  onPress: () => void;
};

function BackButton({ onPress }: BackButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.backButton}>
      <Ionicons name="chevron-back" size={20} color={palette.ink} />
      <Text style={styles.backLabel}>Back</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
  },
  backLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.ink,
  },
});
