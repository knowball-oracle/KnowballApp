import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import type { Team } from '@/types/api';
import { category, colors, radius } from '@/theme/tokens';
import { initials } from '@/utils/text';

const PALETTE = [category.SUB_13, category.SUB_15, category.SUB_17, category.SUB_20];

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Escudo do time (logoUrl) ou iniciais com cor estável pelo nome. */
export function TeamBadge({ team, size = 36 }: { team?: Team; size?: number }) {
  const [failed, setFailed] = useState(false);
  const box = { width: size, height: size, borderRadius: radius.full };

  if (!team) {
    return (
      <View style={[styles.base, box, styles.empty]} accessibilityLabel="Time a definir">
        <Text variant="caption">?</Text>
      </View>
    );
  }
  if (team.logoUrl && !failed) {
    return (
      <View style={[styles.base, box, styles.logoBg]}>
        <Image
          source={{ uri: team.logoUrl }}
          style={{ width: size * 0.78, height: size * 0.78 }}
          contentFit="contain"
          onError={() => setFailed(true)}
          accessibilityLabel={`Escudo do ${team.name}`}
        />
      </View>
    );
  }
  const tone = PALETTE[hash(team.name) % PALETTE.length];
  return (
    <View style={[styles.base, box, { backgroundColor: tone.bg }]} accessibilityLabel={team.name}>
      <Text variant="badge" color={tone.fg}>
        {initials(team.name) || '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  empty: { backgroundColor: colors.card },
  logoBg: { backgroundColor: colors.cardHover },
});
