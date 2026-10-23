import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { colors, radius, space } from '@/theme/tokens';

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

/** Barras verticais simples (ex.: denúncias por mês). */
export function ColumnChart({ data, color = colors.textStrong, height = 140 }: { data: BarDatum[]; color?: string; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={styles.columns} accessibilityRole="image" accessibilityLabel={data.map((d) => `${d.label}: ${d.value}`).join(', ')}>
      {data.map((d) => (
        <View key={d.label} style={styles.column}>
          <Text variant="caption" color={colors.textSecondary}>
            {d.value}
          </Text>
          <View style={[styles.track, { height }]}>
            <View style={[styles.fill, { height: `${(d.value / max) * 100}%`, backgroundColor: d.color ?? color }]} />
          </View>
          <Text variant="caption" numberOfLines={1}>
            {d.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Barras horizontais com rótulo e valor (status, top árbitros). */
export function BarList({ data, color = colors.textStrong, total }: { data: BarDatum[]; color?: string; total?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={styles.list}>
      {data.map((d) => {
        const pct = total ? Math.round((d.value / Math.max(1, total)) * 1000) / 10 : null;
        return (
          <View key={d.label} style={styles.item} accessibilityLabel={`${d.label}: ${d.value}${pct !== null ? `, ${pct}%` : ''}`}>
            <View style={styles.itemHeader}>
              <Text variant="label" numberOfLines={1} style={styles.flex}>
                {d.label}
              </Text>
              <Text variant="label" color={d.color ?? color}>
                {d.value}
                {pct !== null ? <Text variant="caption">{`  ${String(pct).replace('.', ',')}%`}</Text> : null}
              </Text>
            </View>
            <View style={styles.hTrack}>
              <View style={[styles.hFill, { width: `${(d.value / max) * 100}%`, backgroundColor: d.color ?? color }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  column: { flex: 1, alignItems: 'center', gap: space.xs },
  track: { width: '70%', justifyContent: 'flex-end', borderRadius: radius.sm, backgroundColor: colors.card, overflow: 'hidden' },
  fill: { width: '100%', borderRadius: radius.sm, minHeight: 2 },
  list: { gap: space.md },
  item: { gap: space.xs },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flex: { flex: 1 },
  hTrack: { height: 8, borderRadius: radius.full, backgroundColor: colors.card, overflow: 'hidden' },
  hFill: { height: '100%', borderRadius: radius.full, minWidth: 2 },
});
