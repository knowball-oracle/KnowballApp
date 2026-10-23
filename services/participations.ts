import type { GameTeams, HalCollection, Participation, ParticipationInput } from '@/types/api';
import { embedded, stripLinks } from '@/utils/hal';
import { http } from './http';

type List = HalCollection<'participationList', Participation>;

/** Agrupa as participações por game.id → {home, away}. */
export function groupTeamsByGame(list: Participation[]): Map<number, GameTeams> {
  const map = new Map<number, GameTeams>();
  for (const p of list) {
    const gameId = p.id?.gameId ?? p.game?.id;
    if (gameId == null) continue;
    const entry = map.get(gameId) ?? {};
    if (p.type === 'HOME') entry.home = p.team;
    else entry.away = p.team;
    map.set(gameId, entry);
  }
  return map;
}

export const participationsService = {
  /** Uma chamada só para todas as partidas (não fazer uma por partida como o web). */
  listAll: async () => embedded(await http.get<List>('/participations'), 'participationList').map(stripLinks),
  byGame: async (gameId: number) =>
    embedded(await http.get<List>(`/participations/game/${gameId}`), 'participationList').map(stripLinks),
  /** Uma HOME e uma AWAY por partida (a API valida). */
  create: (body: ParticipationInput) => http.post<Participation>('/participations', body),
  remove: (gameId: number, teamId: number) => http.del(`/participations/game/${gameId}/team/${teamId}`),
};
