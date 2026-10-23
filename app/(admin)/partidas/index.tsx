import { router } from 'expo-router';
import { Search, SearchX, Shield } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AdminHero } from '@/components/admin/AdminHero';
import { GameFormSheet } from '@/components/admin/GameFormSheet';
import { GameCard } from '@/components/game/GameCard';
import { Chip, EmptyState, ErrorState, Input, Notice, Panel, Screen, SkeletonList, Text } from '@/components/ui';
import { useGamesWithTeams, type GameWithTeams } from '@/features/reports/hooks';
import type { Category } from '@/types/api';
import { category as categoryTokens, colors, size, space } from '@/theme/tokens';
import { CATEGORY_ORDER, categoryLabel } from '@/utils/labels';
import { normalize } from '@/utils/text';

const image = require('@/assets/images/games.jpg');

export default function Partidas() {
  const games = useGamesWithTeams();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);

  const counts = useMemo(() => {
    const c: Partial<Record<Category, number>> = {};
    for (const g of games.data ?? []) if (g.championship) c[g.championship.category] = (c[g.championship.category] ?? 0) + 1;
    return c;
  }, [games.data]);

  // Agrupadas por campeonato (nome + ano), grupos em ordem alfabética.
  const groups = useMemo(() => {
    const q = normalize(query);
    const map = new Map<string, { title: string; year: number; items: GameWithTeams[] }>();
    for (const g of games.data ?? []) {
      if (cat && g.championship?.category !== cat) continue;
      const text = normalize([g.teams.home?.name, g.teams.away?.name, g.championship?.name, g.place].filter(Boolean).join(' '));
      if (q && !text.includes(q)) continue;
      const key = `${g.championship?.id ?? 0}`;
      const entry = map.get(key) ?? { title: g.championship?.name ?? 'Sem campeonato', year: g.championship?.year ?? 0, items: [] };
      entry.items.push(g);
      map.set(key, entry);
    }
    return [...map.values()].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  }, [games.data, query, cat]);

  const total = (games.data ?? []).length;
  const withoutTeams = (games.data ?? []).filter((g) => !g.teams.home || !g.teams.away).length;

  return (
    <Screen keyboard refreshing={games.isRefetching} onRefresh={() => void games.refetch()}>
      <AdminHero
        image={image}
        eyebrow="Partidas"
        title="Acompanhe cada partida"
        titleLight="onde a base ganha futuro."
        newLabel="Nova"
        onNew={() => setCreating(true)}
        imageAccessibilityLabel="Jogadores das categorias de base reunidos antes de uma partida"
      />

      <Panel>
        <Text variant="eyebrow">Panorama</Text>
        <Text variant="h1">{total}</Text>
        <Text variant="caption">partidas cadastradas</Text>
        {withoutTeams ? <Text variant="caption">{withoutTeams} sem os dois times definidos.</Text> : null}
      </Panel>

      <Input placeholder="Buscar time, campeonato ou local..." icon={Search} value={query} onChangeText={setQuery} accessibilityLabel="Buscar partida" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="Todas" count={total} active={!cat} onPress={() => setCat(null)} />
        {CATEGORY_ORDER.map((c) => (
          <Chip
            key={c}
            label={categoryLabel(c)}
            color={categoryTokens[c].fg}
            count={counts[c] ?? 0}
            active={cat === c}
            onPress={() => setCat(cat === c ? null : c)}
          />
        ))}
      </ScrollView>

      {games.teamsError ? <Notice tone="warn">Erro ao carregar os times das partidas.</Notice> : null}

      {games.isPending ? (
        <SkeletonList count={3} lines={3} />
      ) : games.isError ? (
        <ErrorState error={games.error} title="Erro ao carregar partidas." onRetry={() => void games.refetch()} />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={query || cat ? 'Nenhuma partida encontrada.' : 'Nenhuma partida cadastrada.'}
          actionLabel={query || cat ? 'Limpar filtros' : 'Cadastrar partida'}
          onAction={() => (query || cat ? (setQuery(''), setCat(null)) : setCreating(true))}
        />
      ) : (
        groups.map((group) => (
          <View key={`${group.title}-${group.year}`} style={styles.group}>
            <View style={styles.groupHeader}>
              <Shield size={size.iconSm} color={colors.textMuted} />
              <Text variant="label" style={styles.flex} numberOfLines={1}>
                {group.title} · {group.year}
              </Text>
              <Text variant="caption">
                {group.items.length} {group.items.length === 1 ? 'partida' : 'partidas'}
              </Text>
            </View>
            {group.items.map((g) => (
              <GameCard key={g.id} game={g} teams={g.teams} onPress={() => router.push(`/(admin)/partidas/${g.id}`)} />
            ))}
          </View>
        ))
      )}

      <GameFormSheet
        visible={creating}
        game={null}
        onClose={() => setCreating(false)}
        onSaved={(g) => g?.id && router.push(`/(admin)/partidas/${g.id}`)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { gap: space.sm, paddingVertical: space.xs },
  group: { gap: space.md },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  flex: { flex: 1 },
});
