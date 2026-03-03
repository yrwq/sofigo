import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NearbyScreen } from '@/screens/NearbyScreen';
import { RoutesStack } from '@/screens/routes/RoutesStack';
import { navigationTheme } from '@/theme/theme';

const Tab = createBottomTabNavigator();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer theme={navigationTheme}>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: navigationTheme.colors.card,
                borderTopColor: navigationTheme.colors.border,
              },
            }}
          >
            <Tab.Screen
              name="Nearby"
              component={NearbyScreen}
              options={{
                headerShown: true,
                headerTitle: 'Nearby',
                headerStyle: {
                  backgroundColor: navigationTheme.colors.background,
                },
                headerTitleStyle: {
                  color: navigationTheme.colors.text,
                  fontWeight: '700',
                },
              }}
            />
            <Tab.Screen name="Routes" component={RoutesStack} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
      <StatusBar style="dark" />
    </QueryClientProvider>
  );
}
