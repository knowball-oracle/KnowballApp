import { router } from 'expo-router';
import { Search, SearchX } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { GameCard } from '@/components/game/GameCard';
import {
  Button,
  Chip,
  EmptyState,
  ErrorState,
  Input,
  Notice,
  ProgressHeader,
  Screen,
  SkeletonList,
  Text,
} from '@/components/ui';
import { useReportDraft } from '@/features/reports/DraftContext';
import { useGamesWithTeams, type GameWithTeams } from '@/features/reports/hooks';
import type { Category } from '@/types/api';
import { category as categoryTokens, space } from '@/theme/tokens';
import { CATEGORY_ORDER, categoryLabel } from '@/utils/labels';
import { normalize } from '@/utils/text';

function searchText(g: GameWithTeams): string {
  return normalize(
    [g.teams.home?.name, g.teams.away?.name, g.championship?.name, g.place, g.championship ? categoryLabel(g.championship.category) : '']
      .filter(Boolean)
      .join(' '),
  );
}

export default function PassoPartida() {
  const { draft, update, restored, clear, ready } = useReportDraft();
  const games = useGamesWithTeams();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<Category | null>(null);

  const counts = useMemo(() => {
    const c: Partial<Record<Category, number>> = {};
    for (const g of games.data ?? []) if (g.championship) c[g.championship.category] = (c[g.championship.category] ?? 0) + 1;
    return c;
  }, [games.data]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return (games.data ?? []).filter(
      (g) => (!cat || g.championship?.category === cat) && (!q || searchText(g).includes(q)),
    );
  }, [games.data, query, cat]);

  const hasFilters = !!query || !!cat;
  const selected = games.data?.find((g) => g.id === draft.gameId);

  return (
    <Screen
      keyboard
      refreshing={games.isRefetching}
      onRefresh={() => void games.refetch()}
      footer={
        <Button
          title={selected ? 'Continuar' : 'Selecione a partida'}
          disabled={!selected}
          onPress={() => router.push('/(user)/nova-denuncia/arbitro')}
        />
      }
    >
      <ProgressHeader step={1} total={3} stepLabel="Partida" title="Em qual jogo aconteceu?" back />

      {ready && restored ? (
        <Notice tone="info" title="Rascunho recuperado">
          <View style={styles.restored}>
            <Text variant="caption">Continuamos de onde você parou.</Text>
            <Button title="Descartar rascunho" variant="ghost" icon={null} block={false} onPress={() => void clear()} />
          </View>
        </Notice>
      ) : null}

      <Input
        placeholder="Buscar time, campeonato ou local..."
        icon={Search}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Buscar partida"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
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

      {games.teamsError ? <Notice tone="warn">Erro ao carregar os times das partidas. Elas aparecem como “A definir”.</Notice> : null}

      {games.isPending ? (
        <SkeletonList count={3} lines={3} />
      ) : games.isError ? (
        <ErrorState error={games.error} title="Erro ao carregar partidas." onRetry={() => void games.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={hasFilters ? 'Nenhuma partida encontrada.' : 'Nenhuma partida cadastrada.'}
          message={hasFilters ? 'Tente outro termo ou limpe os filtros.' : 'Quando houver partidas cadastradas, elas aparecem aqui.'}
          actionLabel={hasFilters ? 'Limpar filtros' : undefined}
          onAction={() => {
            setQuery('');
            setCat(null);
          }}
        />
      ) : (
        <View style={styles.list}>
          <Text variant="caption">
            {filtered.length} {filtered.length === 1 ? 'partida' : 'partidas'}
          </Text>
          {filtered.map((g) => (
            <GameCard
              key={g.id}
              game={g}
              teams={g.teams}
              selected={g.id === draft.gameId}
              onPress={() => update({ gameId: g.id })}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { gap: space.sm, paddingVertical: space.xs },
  list: { gap: space.md },
  restored: { gap: space.xs, alignItems: 'flex-start' },
});
