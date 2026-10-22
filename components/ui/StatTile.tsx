import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, size, space, ui } from '@/theme/tokens';
import { Card } from './Card';
import { Text } from './Text';

export interface StatTileProps {
  value: number | string;
  label: string;
  icon?: LucideIcon;
  /** Cor do número (ex.: cor do status). */
  color?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function StatTile({ value, label, icon: Icon, color = colors.textStrong, onPress, style }: StatTileProps) {
  const display = typeof value === 'number' ? value.toLocaleString('pt-BR') : value;
  return (
    <Card onPress={onPress} accessibilityLabel={`${label}: ${display}`} style={[styles.tile, style]}>
      {Icon ? (
        <View style={styles.icon}>
          <Icon size={size.icon} color={color} />
        </View>
      ) : null}
      <Text variant="h1" color={color}>
        {display}
      </Text>
      <Text variant="caption" numberOfLines={2}>
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, gap: space.xs, minWidth: 140 },
  icon: {
    width: size.statIcon,
    height: size.statIcon,
    borderRadius: size.statIconRadius,
    backgroundColor: ui.fill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
});

/** Grade de StatTiles em duas colunas. */
export function StatGrid({ children }: { children: ReactNode }) {
  return <View style={gridStyles.grid}>{children}</View>;
}

const gridStyles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
});
