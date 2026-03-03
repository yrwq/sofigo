import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { palette, spacing } from '@/theme/theme';

export function NearbyScreen() {
  return (
    <Screen>
      <View style={styles.card}>
        <Text style={styles.title}>Enable location</Text>
        <Text style={styles.body}>We use it to show stops near you.</Text>
      </View>
    </Screen>
  );
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
});
