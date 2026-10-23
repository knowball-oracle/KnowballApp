import { Redirect, router } from 'expo-router';
import { CircleCheck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Badge, Button, Card, ErrorState, Notice, ProgressHeader, Screen, SkeletonList, Text } from '@/components/ui';
import { gameTitle } from '@/components/game/GameCard';
import { useReportDraft } from '@/features/reports/DraftContext';
import { useGamesWithTeams, useRefereeings } from '@/features/reports/hooks';
import { colors, radius, size, space, ui } from '@/theme/tokens';
import { refereeingRoleLabel, REFEREEING_ROLE_ORDER, refereeStatusLabel } from '@/utils/labels';
import { initials } from '@/utils/text';

export default function PassoArbitro() {
  const { draft, update, ready } = useReportDraft();
  const games = useGamesWithTeams();
  const refereeings = useRefereeings(draft.gameId);

  if (ready && !draft.gameId) return <Redirect href="/(user)/nova-denuncia/partida" />;

  const game = games.data?.find((g) => g.id === draft.gameId);
  const list = [...(refereeings.data ?? [])].sort(
    (a, b) => REFEREEING_ROLE_ORDER.indexOf(a.role) - REFEREEING_ROLE_ORDER.indexOf(b.role),
  );
  const selected = list.find((r) => r.referee.id === draft.refereeId);

  return (
    <Screen
      refreshing={refereeings.isRefetching}
      onRefresh={() => void refereeings.refetch()}
      footer={
        <Button
          title={selected ? 'Continuar' : 'Selecione o árbitro'}
          disabled={!selected}
          onPress={() => router.push('/(user)/nova-denuncia/relato')}
        />
      }
    >
      <ProgressHeader step={2} total={3} stepLabel="Árbitro" title="Quem estava escalado?" back />
      {game ? (
        <Text variant="body">
          Árbitros escalados em <Text variant="label">{gameTitle(game.teams)}</Text>.
        </Text>
      ) : null}

      {refereeings.isPending ? (
        <SkeletonList count={2} lines={1} />
      ) : refereeings.isError ? (
        <ErrorState error={refereeings.error} title="Erro ao carregar árbitros da partida." onRetry={() => void refereeings.refetch()} />
      ) : list.length === 0 ? (
        <Notice tone="warn" title="Nenhum árbitro vinculado a esta partida.">
          <View style={styles.noneBox}>
            <Text variant="caption" color={colors.textSecondary}>
              Só é possível denunciar um árbitro que estava escalado no jogo. Escolha outra partida.
            </Text>
            <Button title="Escolher outra partida" variant="secondary" icon={null} block={false} onPress={() => router.back()} />
          </View>
        </Notice>
      ) : (
        <View style={styles.list} accessibilityRole="radiogroup">
          {list.map((r) => {
            const active = r.referee.id === draft.refereeId;
            return (
              <Card
                key={r.referee.id}
                onPress={() => update({ refereeId: r.referee.id })}
                accessibilityLabel={`${r.referee.name}, ${refereeingRoleLabel[r.role]}${active ? ', selecionado' : ''}`}
                style={[styles.card, active && styles.active]}
              >
                <View style={styles.avatar}>
                  <Text variant="label">{initials(r.referee.name)}</Text>
                </View>
                <View style={styles.flex}>
                  <Text variant="label">{r.referee.name}</Text>
                  <Text variant="caption">{refereeingRoleLabel[r.role]}</Text>
                </View>
                {r.referee.status === 'SUSPENDED' ? <Badge label={refereeStatusLabel.SUSPENDED} /> : null}
                {active ? <CircleCheck size={size.icon} color={ui.successFg} /> : null}
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.md },
  card: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  active: { borderColor: ui.successFg, backgroundColor: colors.cardHover },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: ui.fill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1, gap: 2 },
  noneBox: { gap: space.sm, alignItems: 'flex-start' },
});
