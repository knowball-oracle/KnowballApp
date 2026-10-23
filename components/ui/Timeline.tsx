import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import type { AnalysisResult, ReportStatus } from '@/types/api';
import { colors, radius, space, status as statusTokens } from '@/theme/tokens';
import { STATUS_ORDER, resultLabel, statusDescription } from '@/utils/labels';
import { Text } from './Text';

export interface TimelineProps {
  status: ReportStatus;
  analysisResult?: AnalysisResult | null;
  /** Texto extra por etapa (ex.: data do registro na etapa "Nova"). */
  details?: Partial<Record<ReportStatus, string>>;
}

/** Nova → Em análise → Resolvida. Atual preenchido na cor do status; futuros só contorno. */
export function Timeline({ status, analysisResult, details }: TimelineProps) {
  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <View accessibilityRole="list">
      {STATUS_ORDER.map((step, index) => {
        const tone = statusTokens[step];
        const done = index < currentIndex;
        const current = index === currentIndex;
        const future = index > currentIndex;
        const last = index === STATUS_ORDER.length - 1;
        const description =
          step === 'RESOLVED' && current && analysisResult
            ? `Resultado da análise: ${resultLabel(analysisResult)}.`
            : statusDescription[step];

        return (
          <View
            key={step}
            style={styles.row}
            accessibilityLabel={`${tone.label}${current ? ', etapa atual' : done ? ', concluída' : ', pendente'}`}
          >
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  future && styles.dotFuture,
                  done && { backgroundColor: tone.bg, borderColor: tone.border },
                  current && { backgroundColor: tone.fg, borderColor: tone.fg },
                ]}
              >
                {done ? <Check size={12} color={tone.fg} strokeWidth={3} /> : null}
              </View>
              {!last ? <View style={[styles.line, index < currentIndex && { backgroundColor: tone.border }]} /> : null}
            </View>
            <View style={[styles.body, !last && styles.bodySpacing]}>
              <Text variant="label" color={future ? colors.textMuted : current ? tone.fg : colors.text}>
                {tone.label}
              </Text>
              <Text variant="caption" color={future ? colors.textFaint : colors.textMuted}>
                {description}
              </Text>
              {details?.[step] ? <Text variant="caption">{details[step]}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const DOT = 20;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.md },
  rail: { alignItems: 'center', width: DOT },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotFuture: { borderColor: colors.textFaint, backgroundColor: 'transparent' },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: space.xs },
  body: { flex: 1, gap: 2, paddingTop: 1 },
  bodySpacing: { paddingBottom: space.xl },
});
