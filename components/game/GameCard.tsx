import { CircleCheck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Card, CategoryBadge, Text } from '@/components/ui';
import type { Game, GameTeams } from '@/types/api';
import { colors, size, space, ui } from '@/theme/tokens';
import { formatLocalDateTime, gameMoment } from '@/utils/dates';
import { TeamBadge } from './TeamBadge';

const MOMENT_LABEL = { today: 'Hoje', finished: 'Fim de jogo', scheduled: 'Agendado' } as const;

export function gameTitle(teams: GameTeams): string {
  return `${teams.home?.name ?? 'A definir'} × ${teams.away?.name ?? 'A definir'}`;
}

export interface GameCardProps {
  game: Game;
  teams: GameTeams;
  selected?: boolean;
  onPress?: () => void;
}

/** Partida com escudos, placar, campeonato, data e categoria. */
export function GameCard({ game, teams, selected, onPress }: GameCardProps) {
  const moment = gameMoment(game.matchDate);
  const label = `${gameTitle(teams)}, ${game.homeScore} a ${game.awayScore}. ${game.championship?.name ?? ''}, ${formatLocalDateTime(game.matchDate, 'dateTime')}`;

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={selected ? `${label}. Selecionada` : label}
      style={[styles.card, selected && styles.selected]}
    >
      <View style={styles.teams}>
        <TeamRow name={teams.home?.name} score={game.homeScore} team={teams.home} />
        <TeamRow name={teams.away?.name} score={game.awayScore} team={teams.away} />
      </View>
      <View style={styles.meta}>
        <View style={styles.metaText}>
          <Text variant="caption" numberOfLines={1} color={colors.textSecondary}>
            {game.championship?.name ?? 'Campeonato'}
          </Text>
          <Text variant="caption" numberOfLines={1}>
            {formatLocalDateTime(game.matchDate, 'dateDotTime')} · {MOMENT_LABEL[moment]}
          </Text>
          <Text variant="caption" numberOfLines={1}>
            {game.place}
          </Text>
        </View>
        <View style={styles.right}>
          {game.championship?.category ? <CategoryBadge value={game.championship.category} /> : null}
          {selected ? <CircleCheck size={size.icon} color={ui.successFg} /> : null}
        </View>
      </View>
    </Card>
  );
}

function TeamRow({ name, score, team }: { name?: string; score: number; team?: GameTeams['home'] }) {
  return (
    <View style={styles.teamRow}>
      <TeamBadge team={team} size={32} />
      <Text variant="label" numberOfLines={1} style={styles.teamName} color={name ? colors.text : colors.textMuted}>
        {name ?? 'A definir'}
      </Text>
      <Text variant="h2">{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.md },
  selected: { borderColor: ui.successFg, backgroundColor: colors.cardHover },
  teams: { gap: space.sm },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  teamName: { flex: 1 },
  meta: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: space.md,
  },
  metaText: { flex: 1, gap: 2 },
  right: { alignItems: 'flex-end', gap: space.sm },
});
