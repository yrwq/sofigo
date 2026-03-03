import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RoutesListScreen } from '@/screens/routes/RoutesListScreen';
import { RouteTripsScreen } from '@/screens/routes/RouteTripsScreen';
import { TripStopsScreen } from '@/screens/routes/TripStopsScreen';
import { palette } from '@/theme/theme';

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
        options={({ route }) => ({ title: route.params.routeName })}
      />
      <Stack.Screen
        name="TripStops"
        component={TripStopsScreen}
        options={({ route }) => ({
          title: route.params.headsign ?? route.params.routeName,
        })}
      />
    </Stack.Navigator>
  );
}
