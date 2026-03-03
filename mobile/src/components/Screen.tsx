import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, spacing } from '@/theme/theme';

type ScreenProps = PropsWithChildren<{
  padded?: boolean;
  topPadding?: number;
  horizontalPadding?: number;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
}>;

export function Screen({
  children,
  padded = false,
  topPadding = 10,
  horizontalPadding,
  edges = ['left', 'right'],
}: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      <View
        style={[
          styles.container,
          padded && styles.padded,
          topPadding !== undefined && { paddingTop: topPadding },
          horizontalPadding !== undefined && {
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.surface,
  },
  container: {
    flex: 1,
    backgroundColor: palette.surface,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
});
