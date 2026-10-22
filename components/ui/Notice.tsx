import type { LucideIcon } from 'lucide-react-native';
import { CircleAlert, Info, Lock, TriangleAlert } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, size, space, ui } from '@/theme/tokens';
import { Text } from './Text';

export type NoticeTone = 'error' | 'warn' | 'info' | 'lock';

export interface NoticeProps {
  tone?: NoticeTone;
  title?: string;
  children?: ReactNode;
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
}

const tones: Record<NoticeTone, { icon: LucideIcon; fg: string; bg: string; border: string }> = {
  error: { icon: CircleAlert, fg: colors.accent, bg: ui.dangerBg, border: colors.border },
  warn: { icon: TriangleAlert, fg: ui.warnFg, bg: ui.warnBg, border: ui.warnBorder },
  info: { icon: Info, fg: colors.textSecondary, bg: ui.fill, border: colors.border },
  lock: { icon: Lock, fg: colors.textSecondary, bg: colors.card, border: colors.border },
};

/** Caixa de aviso em linha (erro de formulário, alerta âmbar, confidencialidade). */
export function Notice({ tone = 'info', title, children, icon, style }: NoticeProps) {
  const t = tones[tone];
  const Icon = icon ?? t.icon;
  return (
    <View
      style={[styles.box, { backgroundColor: t.bg, borderColor: t.border }, style]}
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
    >
      <Icon size={size.icon} color={t.fg} />
      <View style={styles.text}>
        {title ? (
          <Text variant="label" color={tone === 'info' || tone === 'lock' ? colors.text : t.fg}>
            {title}
          </Text>
        ) : null}
        {typeof children === 'string' ? (
          <Text variant="caption" color={tone === 'error' ? colors.text : colors.textSecondary}>
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md + 2,
  },
  text: { flex: 1, gap: 2 },
});
