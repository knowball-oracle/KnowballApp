import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { AnalysisResult, Category, ReportStatus } from '@/types/api';
import { category, colors, radius, result, space, status, ui } from '@/theme/tokens';
import { Text } from './Text';

export interface Tone {
  fg: string;
  bg: string;
  border?: string;
}

export const neutralTone: Tone = { fg: colors.textSecondary, bg: ui.fill, border: colors.border };

export interface BadgeProps {
  label: string;
  tone?: Tone;
  /** Ponto colorido antes do texto. */
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ label, tone = neutralTone, dot, style }: BadgeProps) {
  return (
    <View
      style={[styles.badge, { backgroundColor: tone.bg, borderColor: tone.border ?? ui.transparent }, style]}
      accessibilityLabel={label}
    >
      {dot ? <View style={[styles.dot, { backgroundColor: tone.fg }]} /> : null}
      <Text variant="badge" color={tone.fg}>
        {label}
      </Text>
    </View>
  );
}

export const StatusBadge = ({ value, style }: { value: ReportStatus; style?: StyleProp<ViewStyle> }) => (
  <Badge label={status[value].label} tone={status[value]} dot style={style} />
);

export const ResultBadge = ({ value, style }: { value: AnalysisResult; style?: StyleProp<ViewStyle> }) => (
  <Badge label={result[value].label} tone={result[value]} style={style} />
);

export const CategoryBadge = ({ value, style }: { value: Category; style?: StyleProp<ViewStyle> }) => (
  <Badge label={category[value].label} tone={category[value]} style={style} />
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  dot: { width: 6, height: 6, borderRadius: radius.full },
});
