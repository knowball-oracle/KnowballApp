import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { colors, radius, space, ui } from '@/theme/tokens';

export interface PanelProps extends ViewProps {
  /** Borda colorida a 15% (verde no USER). */
  tone?: 'neutral' | 'green';
  style?: StyleProp<ViewStyle>;
}

/** Bloco de destaque, como "Uma base mais transparente" do web. */
export function Panel({ tone = 'neutral', style, ...rest }: PanelProps) {
  return <View {...rest} style={[styles.panel, tone === 'green' && styles.green, style]} />;
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: space.md,
  },
  green: { borderColor: ui.panelGreen },
});
