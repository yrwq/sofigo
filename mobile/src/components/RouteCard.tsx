import { StyleSheet, Text, View } from 'react-native';
import { palette, spacing } from '@/theme/theme';

type RouteCardProps = {
  shortName: string;
  longName: string;
  color?: string | null;
  textColor?: string | null;
};

function normalizeColor(color?: string | null) {
  if (!color) {
    return palette.accent;
  }
  return color.startsWith('#') ? color : `#${color}`;
}

export function RouteCard({
  shortName,
  longName,
  color,
  textColor,
}: RouteCardProps) {
  const badgeColor = normalizeColor(color);
  const badgeTextColor = normalizeColor(textColor ?? '#ffffff');

  return (
    <View style={styles.card}>
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={[styles.badgeText, { color: badgeTextColor }]}>
          {shortName || '-'}
        </Text>
      </View>
      <View style={styles.texts}>
        <Text style={styles.name}>{longName || 'Unnamed'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.md,
    elevation: 2,
  },
  badge: {
    width: 56,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  texts: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: palette.ink,
  },
});
