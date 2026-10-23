import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Pencil, Plus, Search, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { GameFormSheet } from '@/components/admin/GameFormSheet';
import { TeamBadge } from '@/components/game/TeamBadge';
import {
  Badge,
  Button,
  Card,
  CategoryBadge,
  Chip,
  EmptyState,
  ErrorState,
  GlassPill,
  Input,
  Notice,
  Screen,
  Sheet,
  SkeletonList,
  Text,
  useToast,
} from '@/components/ui';
import { confirmDelete } from '@/features/admin/confirm';
import { useGamesWithTeams, useRefereeings } from '@/features/reports/hooks';
import { gamesService } from '@/services/games';
import { invalidate } from '@/services/invalidation';
import { participationsService } from '@/services/participations';
import { qk } from '@/services/queryKeys';
import { refereeingsService } from '@/services/refereeings';
import { refereesService } from '@/services/referees';
import { teamsService } from '@/services/teams';
import type { ParticipationType, RefereeingRole, Team } from '@/types/api';
import { colors, radius, space, ui } from '@/theme/tokens';
import { formatLocalDateTime, gameMoment } from '@/utils/dates';
import { participationLabel, REFEREEING_ROLE_ORDER, refereeingRoleLabel, refereeStatusLabel } from '@/utils/labels';
import { errorMessage } from '@/utils/parseApiError';
import { normalize } from '@/utils/text';

const field = require('@/assets/images/soccer-field.jpg');
const MOMENT = { today: 'Hoje', finished: 'Fim de jogo', scheduled: 'Agendado' } as const;

export default function PartidaDetalhe() {
  const id = Number(useLocalSearchParams<{ id: string }>().id);
  const qc = useQueryClient();
  const toast = useToast();
  const games = useGamesWithTeams();
  const refereeings = useRefereeings(id);
  const teams = useQuery({ queryKey: qk.teams, queryFn: teamsService.list });
  const referees = useQuery({ queryKey: qk.referees, queryFn: refereesService.list });

  const [editing, setEditing] = useState(false);
  const [teamSlot, setTeamSlot] = useState<ParticipationType | null>(null);
  const [teamQuery, setTeamQuery] = useState('');
  const [refSheet, setRefSheet] = useState(false);
  const [refQuery, setRefQuery] = useState('');
  const [role, setRole] = useState<RefereeingRole | null>(null);
  const [refereeId, setRefereeId] = useState<number | null>(null);

  const game = games.data?.find((g) => g.id === id);
  const gameTeams = game?.teams ?? {};
  const assigned = [...(refereeings.data ?? [])].sort((a, b) => REFEREEING_ROLE_ORDER.indexOf(a.role) - REFEREEING_ROLE_ORDER.indexOf(b.role));
  const freeRoles = REFEREEING_ROLE_ORDER.filter((r) => !assigned.some((a) => a.role === r));

  const teamOptions = useMemo(() => {
    const q = normalize(teamQuery);
    const used = new Set([gameTeams.home?.id, gameTeams.away?.id]);
    return (teams.data ?? []).filter((t) => !used.has(t.id) && (!q || normalize(`${t.name} ${t.city}`).includes(q))).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [teams.data, teamQuery, gameTeams.home?.id, gameTeams.away?.id]);

  const refereeOptions = useMemo(() => {
    const q = normalize(refQuery);
    const used = new Set(assigned.map((a) => a.referee.id));
    return (referees.data ?? []).filter((r) => !used.has(r.id) && (!q || normalize(r.name).includes(q))).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [referees.data, refQuery, assigned]);

  const addTeam = useMutation({
    mutationFn: (p: { team: Team; type: ParticipationType }) => participationsService.create({ game: { id }, team: { id: p.team.id }, type: p.type }),
    onSuccess: async (_, p) => {
      await invalidate.participations(qc);
      toast.success(`${p.team.name} adicionado como ${participationLabel[p.type].toLowerCase()}.`);
      setTeamSlot(null);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const removeTeam = useMutation({
    mutationFn: (teamId: number) => participationsService.remove(id, teamId),
    onSuccess: async () => {
      await invalidate.participations(qc);
      toast.success('Time removido da partida.');
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const addReferee = useMutation({
    mutationFn: (p: { refereeId: number; role: RefereeingRole }) =>
      refereeingsService.create({ game: { id }, referee: { id: p.refereeId }, role: p.role }),
    onSuccess: async () => {
      await invalidate.refereeings(qc, id);
      toast.success('Árbitro adicionado à partida.');
      setRefSheet(false);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const removeGame = useMutation({
    mutationFn: () => gamesService.removeCascade(id, gameTeams),
    onSuccess: async () => {
      await invalidate.gameDeleted(qc);
      toast.success('Partida excluída.');
      router.back();
    },
    onError: async (e) => {
      // Os times podem já ter sido removidos antes da falha.
      await invalidate.participations(qc);
      toast.error(errorMessage(e));
    },
  });

  const openRefSheet = () => {
    setRole(freeRoles[0] ?? null);
    setRefereeId(null);
    setRefQuery('');
    setRefSheet(true);
  };

  const confirmReferee = () => {
    const ref = referees.data?.find((r) => r.id === refereeId);
    if (!ref || !role) return;
    // Arbitragem não tem PUT nem DELETE na API: confirmar antes de salvar.
    Alert.alert(
      'Confirmar arbitragem',
      `${ref.name} como ${refereeingRoleLabel[role]}. Depois de salva, a arbitragem não pode ser alterada nem removida.`,
      [
        { text: 'Revisar', style: 'cancel' },
        { text: 'Salvar', onPress: () => addReferee.mutate({ refereeId: ref.id, role }) },
      ],
    );
  };

  if (games.isPending) {
    return (
      <Screen>
        <SkeletonList count={3} lines={3} />
      </Screen>
    );
  }
  if (games.isError || !game) {
    return (
      <Screen>
        {games.isError ? (
          <ErrorState error={games.error} title="Erro ao carregar partida." onRetry={() => void games.refetch()} />
        ) : (
          <EmptyState title="Partida não encontrada." message="Ela pode ter sido excluída." actionLabel="Voltar" onAction={() => router.back()} />
        )}
      </Screen>
    );
  }

  return (
    <Screen keyboard refreshing={games.isRefetching || refereeings.isRefetching} onRefresh={() => void Promise.all([games.refetch(), refereeings.refetch()])}>
      <View style={styles.board}>
        <Image source={field} style={StyleSheet.absoluteFill} contentFit="cover" allowDownscaling={false} />
        <LinearGradient colors={[ui.heroTop, ui.heroBottom]} style={StyleSheet.absoluteFill} />
        <View style={styles.boardTop}>
          <GlassPill icon={ArrowLeft} accessibilityLabel="Voltar" onPress={() => router.back()} />
          {game.championship ? <CategoryBadge value={game.championship.category} /> : null}
        </View>
        <Text variant="caption" align="center" color={colors.textSecondary}>
          {game.championship?.name}
        </Text>
        <View style={styles.score} accessibilityLabel={`${gameTeams.home?.name ?? 'A definir'} ${game.homeScore} a ${game.awayScore} ${gameTeams.away?.name ?? 'A definir'}`}>
          <View style={styles.side}>
            <TeamBadge team={gameTeams.home} size={52} />
            <Text variant="label" align="center" numberOfLines={2}>
              {gameTeams.home?.name ?? 'A definir'}
            </Text>
          </View>
          <Text variant="heroDisplay">
            {game.homeScore}:{game.awayScore}
          </Text>
          <View style={styles.side}>
            <TeamBadge team={gameTeams.away} size={52} />
            <Text variant="label" align="center" numberOfLines={2}>
              {gameTeams.away?.name ?? 'A definir'}
            </Text>
          </View>
        </View>
        <Text variant="caption" align="center">
          {MOMENT[gameMoment(game.matchDate)]} · {formatLocalDateTime(game.matchDate, 'dateTime')} · {game.place}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button title="Editar partida" variant="secondary" leftIcon={Pencil} icon={null} onPress={() => setEditing(true)} style={styles.flex} />
      </View>

      <Card style={styles.section}>
        <Text variant="h2">Times</Text>
        {(['HOME', 'AWAY'] as const).map((type) => {
          const team = type === 'HOME' ? gameTeams.home : gameTeams.away;
          return (
            <View key={type} style={styles.row}>
              <TeamBadge team={team} size={36} />
              <View style={styles.flex}>
                <Text variant="caption">{participationLabel[type]}</Text>
                <Text variant="label">{team?.name ?? 'A definir'}</Text>
              </View>
              {team ? (
                <Button
                  title="Remover"
                  variant="ghost"
                  icon={null}
                  block={false}
                  onPress={() =>
                    confirmDelete('Remover time', `${team.name} deixa de ser o ${participationLabel[type].toLowerCase()} desta partida.`, () =>
                      removeTeam.mutate(team.id),
                    'Remover')
                  }
                />
              ) : (
                <Button
                  title="Adicionar"
                  variant="secondary"
                  icon={Plus}
                  block={false}
                  onPress={() => {
                    setTeamQuery('');
                    setTeamSlot(type);
                  }}
                />
              )}
            </View>
          );
        })}
      </Card>

      <Card style={styles.section}>
        <Text variant="h2">Arbitragem</Text>
        {refereeings.isPending ? (
          <SkeletonList count={1} lines={1} />
        ) : assigned.length === 0 ? (
          <Notice tone="warn">Sem árbitros escalados, ninguém consegue denunciar esta partida.</Notice>
        ) : (
          assigned.map((a) => (
            <View key={a.referee.id} style={styles.row}>
              <View style={styles.flex}>
                <Text variant="caption">{refereeingRoleLabel[a.role]}</Text>
                <Text variant="label">{a.referee.name}</Text>
              </View>
              {a.referee.status !== 'ACTIVE' ? <Badge label={refereeStatusLabel[a.referee.status]} /> : null}
            </View>
          ))
        )}
        {freeRoles.length ? (
          <Button title="Adicionar árbitro" variant="secondary" icon={Plus} onPress={openRefSheet} />
        ) : (
          <Text variant="caption">✓ As 4 funções de arbitragem já foram preenchidas.</Text>
        )}
      </Card>

      <Card style={styles.section}>
        <Text variant="h2">Excluir partida</Text>
        <Text variant="caption">As denúncias e as arbitragens desta partida também serão apagadas. Esta ação não pode ser desfeita.</Text>
        <Button
          title={removeGame.isPending ? 'Excluindo...' : 'Excluir partida'}
          variant="danger"
          leftIcon={Trash2}
          icon={null}
          loading={removeGame.isPending}
          onPress={() =>
            confirmDelete(
              'Excluir partida',
              'Todas as denúncias e arbitragens desta partida serão apagadas junto com ela. Esta ação não pode ser desfeita.',
              () => removeGame.mutate(),
            )
          }
        />
      </Card>

      <GameFormSheet visible={editing} game={game} onClose={() => setEditing(false)} />

      <Sheet
        visible={!!teamSlot}
        onClose={() => setTeamSlot(null)}
        title={teamSlot ? `Adicionar ${participationLabel[teamSlot].toLowerCase()}` : ''}
        description="Escolha o time desta partida"
      >
        <Input placeholder="Buscar time..." icon={Search} value={teamQuery} onChangeText={setTeamQuery} accessibilityLabel="Buscar time" />
        {teams.isPending ? (
          <SkeletonList count={2} lines={1} />
        ) : teamOptions.length === 0 ? (
          <Text variant="caption">Nenhum time disponível.</Text>
        ) : (
          teamOptions.slice(0, 40).map((t) => (
            <Card
              key={t.id}
              onPress={() => teamSlot && addTeam.mutate({ team: t, type: teamSlot })}
              accessibilityLabel={`Adicionar ${t.name}`}
              style={styles.row}
            >
              <TeamBadge team={t} size={32} />
              <View style={styles.flex}>
                <Text variant="label">{t.name}</Text>
                <Text variant="caption">
                  {t.city} · {t.state}
                </Text>
              </View>
            </Card>
          ))
        )}
      </Sheet>

      <Sheet
        visible={refSheet}
        onClose={() => setRefSheet(false)}
        title="Adicionar árbitro"
        description="Função e árbitro escalado"
        footer={<Button title="Salvar arbitragem" onPress={confirmReferee} disabled={!role || !refereeId} loading={addReferee.isPending} />}
      >
        <Text variant="label">Função</Text>
        <View style={styles.wrap}>
          {freeRoles.map((r) => (
            <Chip key={r} label={refereeingRoleLabel[r]} active={role === r} onPress={() => setRole(r)} />
          ))}
        </View>
        <Text variant="label">Árbitro</Text>
        <Input placeholder="Buscar árbitro..." icon={Search} value={refQuery} onChangeText={setRefQuery} accessibilityLabel="Buscar árbitro" />
        {referees.isPending ? (
          <SkeletonList count={2} lines={1} />
        ) : refereeOptions.length === 0 ? (
          <Text variant="caption">Nenhum árbitro disponível.</Text>
        ) : (
          refereeOptions.slice(0, 40).map((r) => (
            <Card
              key={r.id}
              onPress={() => setRefereeId(r.id)}
              accessibilityLabel={`${r.name}${refereeId === r.id ? ', selecionado' : ''}`}
              style={[styles.row, refereeId === r.id && styles.selected]}
            >
              <Text variant="label" style={styles.flex}>
                {r.name}
              </Text>
              {r.status !== 'ACTIVE' ? <Badge label={refereeStatusLabel[r.status]} /> : null}
            </Card>
          ))
        )}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  board: { borderRadius: radius.xl, overflow: 'hidden', padding: space.lg, gap: space.md },
  boardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  score: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  side: { flex: 1, alignItems: 'center', gap: space.sm },
  actions: { flexDirection: 'row', gap: space.sm },
  section: { gap: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  flex: { flex: 1, gap: 2 },
  selected: { borderColor: ui.successFg, backgroundColor: colors.cardHover },
});
