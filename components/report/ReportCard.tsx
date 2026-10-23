import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, ResultBadge, StatusBadge, Text } from '@/components/ui';
import type { Report } from '@/types/api';
import { colors, size, space } from '@/theme/tokens';
import { formatInstant, formatLocalDateTime } from '@/utils/dates';
import { statusLabel } from '@/utils/labels';

export interface ReportCardProps {
  report: Report;
  onPress?: () => void;
  /** Versão de uma linha (Início). */
  compact?: boolean;
  /** Ações rápidas no rodapé (fila do admin). */
  footer?: ReactNode;
}

export function ReportCard({ report, onPress, compact, footer }: ReportCardProps) {
  const a11y = `Protocolo ${report.protocol}, ${statusLabel(report.status)}, registrada em ${formatInstant(report.date)}`;

  if (compact) {
    return (
      <Card onPress={onPress} accessibilityLabel={a11y} style={styles.compact}>
        <View style={styles.flex}>
          <Text variant="mono">{report.protocol}</Text>
          <Text variant="caption">Registrada em {formatInstant(report.date)}</Text>
        </View>
        <StatusBadge value={report.status} />
        <ChevronRight size={size.iconSm} color={colors.textMuted} />
      </Card>
    );
  }

  return (
    <Card onPress={onPress} accessibilityLabel={a11y} style={styles.card}>
      <View style={styles.top}>
        <View style={styles.flex}>
          <Text variant="eyebrow">Protocolo</Text>
          <Text variant="mono">{report.protocol}</Text>
        </View>
        <StatusBadge value={report.status} />
      </View>
      <View style={styles.cols}>
        <View style={styles.flex}>
          <Text variant="caption">Denúncia</Text>
          <Text variant="label">{formatInstant(report.date)}</Text>
        </View>
        <View style={styles.flex}>
          <Text variant="caption">Partida</Text>
          <Text variant="label">{formatLocalDateTime(report.game?.matchDate, 'date')}</Text>
        </View>
      </View>
      <View style={styles.bottom}>
        <Text variant="caption">Resultado</Text>
        {report.analysisResult ? (
          <ResultBadge value={report.analysisResult} />
        ) : (
          <Text variant="caption" color={colors.textFaint}>
            Ainda não definido
          </Text>
        )}
      </View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  compact: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  card: { gap: space.md },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  cols: { flexDirection: 'row', gap: space.md },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: space.md,
  },
  footer: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },
});
