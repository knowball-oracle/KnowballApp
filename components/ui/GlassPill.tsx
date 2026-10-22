import { BlurView } from 'expo-blur';
import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, size, space, ui } from '@/theme/tokens';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface GlassPillProps {
  onPress?: () => void;
  label?: string;
  icon?: LucideIcon;
  /** Obrigatório quando não há label (botão só de ícone). */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/** Ação de vidro sobre imagem (ex.: "+ Nova", voltar). */
export function GlassPill({ onPress, label, icon: Icon, accessibilityLabel, style }: GlassPillProps) {
  const iconOnly = !label;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={(size.touch - size.pill) / 2}
      style={[styles.pill, iconOnly && styles.iconOnly, style]}
    >
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      {Icon ? <Icon size={size.iconSm} color={colors.textStrong} /> : null}
      {label ? (
        <Text variant="label" color={colors.textStrong}>
          {label}
        </Text>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: size.pill,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: ui.glass,
    paddingHorizontal: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  iconOnly: { width: size.pill, paddingHorizontal: 0 },
});
