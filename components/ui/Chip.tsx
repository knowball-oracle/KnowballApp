import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, size, space, ui } from '@/theme/tokens';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  /** Cor da categoria/status: ponto e borda ativa a 60%. */
  color?: string;
  count?: number;
  style?: StyleProp<ViewStyle>;
}

/** Hex "#RRGGBB" + alfa. Cores rgba() caem na borda forte. */
function withAlpha(hex: string | undefined, alpha: number): string {
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return ui.focus;
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `${hex}${a}`;
}

export function Chip({ label, active, onPress, color, count, style }: ChipProps) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      accessibilityLabel={count === undefined ? label : `${label}, ${count}`}
      hitSlop={(size.touch - size.chip) / 2}
      style={[
        styles.chip,
        active && { backgroundColor: colors.cardHover, borderColor: withAlpha(color, 0.6) },
        style,
      ]}
    >
      {color ? <View style={[styles.dot, { backgroundColor: color }]} /> : null}
      <Text variant="badge" color={active ? colors.textStrong : colors.textSecondary}>
        {label}
      </Text>
      {count !== undefined ? (
        <Text variant="badge" color={colors.textMuted}>
          {count}
        </Text>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: size.chip,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: ui.fill,
  },
  dot: { width: 8, height: 8, borderRadius: radius.full },
});
