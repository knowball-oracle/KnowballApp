import type { LucideIcon } from 'lucide-react-native';
import { ArrowRight } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, size, space, ui } from '@/theme/tokens';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  /** Ícone à direita. No primary, o padrão é ArrowRight; passe `null` para não ter ícone. */
  icon?: LucideIcon | null;
  /** Ícone à esquerda (ex.: Copy, Share2). */
  leftIcon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  /** Ocupa a largura toda (padrão: true). */
  block?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: ui.white, fg: colors.onPrimary },
  secondary: { bg: ui.fill, fg: colors.textStrong, border: colors.borderStrong },
  ghost: { bg: ui.transparent, fg: colors.textSecondary },
  danger: { bg: ui.dangerBg, fg: colors.accent },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  leftIcon: LeftIcon,
  loading,
  disabled,
  block = true,
  accessibilityLabel,
  accessibilityHint,
  style,
}: ButtonProps) {
  const p = palette[variant];
  const RightIcon = icon === undefined ? (variant === 'primary' ? ArrowRight : null) : icon;
  const inactive = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      haptic={variant === 'primary'}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={[
        styles.base,
        { backgroundColor: p.bg, borderColor: p.border ?? ui.transparent },
        block ? styles.block : styles.inline,
        disabled && styles.disabled,
        style,
      ]}
    >
      {LeftIcon ? <LeftIcon size={size.iconSm} color={p.fg} /> : null}
      <Text variant="label" color={p.fg} numberOfLines={1}>
        {title}
      </Text>
      {loading ? (
        <ActivityIndicator size="small" color={p.fg} style={styles.icon} />
      ) : RightIcon ? (
        <RightIcon size={size.iconSm} color={p.fg} />
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    height: size.button,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  block: { alignSelf: 'stretch' },
  inline: { alignSelf: 'flex-start' },
  disabled: { opacity: 0.5 },
  icon: { width: size.iconSm, height: size.iconSm },
});
