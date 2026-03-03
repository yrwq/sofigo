import { Ionicons } from '@expo/vector-icons';
import {
  type BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
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

function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const barWidth = 128;
  const offsetBottom = Math.max(insets.bottom, 0);

  return (
    <View style={[styles.floatingWrap, { bottom: offsetBottom, width: barWidth, marginLeft: -barWidth / 2 }]}>
      <BlurView intensity={90} tint="light" style={styles.floatingBlur}>
        <View style={styles.floatingBar}>
          <View style={styles.floatingHighlight} />
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const iconName =
              route.name === 'Nearby'
                ? 'locate'
                : route.name === 'Routes'
                  ? 'bus'
                  : 'ellipse';
            const iconColor = isFocused ? '#0f172a' : 'rgba(15,23,42,0.45)';

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    void Haptics.selectionAsync();
                  }
                  navigation.navigate(route.name);
                }}
                style={({ pressed }) => [
                  styles.floatingItem,
                  pressed && styles.floatingItemPressed,
                ]}
              >
                {isFocused ? (
                  <View style={styles.floatingActivePill}>
                    <Ionicons name={iconName} size={24} color={iconColor} />
                  </View>
                ) : (
                  <Ionicons name={iconName} size={24} color={iconColor} />
                )}
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

function AppShell() {
  const insets = useSafeAreaInsets();
  const isIos = Platform.OS === 'ios';
  const tabBarWidth = 128;
  const tabBarStyle = [
    styles.tabBar,
    Platform.OS === 'web' ? styles.tabBarWeb : null,
    {
      bottom: Math.max(insets.bottom, 0) + (Platform.OS === 'web' ? 12 : 0),
      width: tabBarWidth,
      left: '50%',
      marginLeft: -tabBarWidth / 2,
      right: undefined,
      backgroundColor: isIos ? 'transparent' : 'rgba(255,255,255,0.94)',
    },
  ];

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#0f172a',
          tabBarInactiveTintColor: 'rgba(15,23,42,0.45)',
          tabBarStyle: isIos ? undefined : tabBarStyle,
          tabBarItemStyle: isIos ? undefined : styles.tabBarItem,
          tabBarBackground: isIos
            ? undefined
            : () => <View style={styles.tabBarBackground} />,
          tabBarIcon: ({ color, size }) => {
            const iconName =
              route.name === 'Nearby'
                ? 'locate'
                : route.name === 'Routes'
                  ? 'bus'
                  : 'ellipse';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
        tabBar={isIos ? (props) => <FloatingTabBar {...props} /> : undefined}
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
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppShell />
      </SafeAreaProvider>
      <StatusBar style="dark" />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  floatingWrap: {
    position: 'absolute',
    left: '50%',
    height: 56,
    borderRadius: 22,
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    overflow: 'hidden',
  },
  floatingBlur: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
  },
  floatingBar: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  floatingHighlight: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  floatingItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingItemPressed: {
    opacity: 0.6,
  },
  floatingActivePill: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  tabBar: {
    position: 'absolute',
    height: 56,
    borderRadius: 22,
    borderTopWidth: 0,
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    overflow: 'hidden',
  },
  tabBarWeb: {
    alignSelf: 'center',
  },
  tabBarBackground: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  tabBarItem: {
    paddingVertical: 8,
  },
});
