import type { Game, GameInput, GameTeams, HalCollection } from '@/types/api';
import { embedded, stripLinks } from '@/utils/hal';
import { http } from './http';
import { participationsService } from './participations';

type List = HalCollection<'gameList', Game>;

export const gamesService = {
  list: async () => embedded(await http.get<List>('/games'), 'gameList').map(stripLinks),
  get: async (id: number) => stripLinks(await http.get<Game>(`/games/${id}`)),
  byChampionship: async (championshipId: number) =>
    embedded(await http.get<List>(`/games/championship/${championshipId}`), 'gameList').map(stripLinks),
  /** matchDate em hora local sem fuso (utils/dates.toLocalDateTimeString). */
  create: (body: GameInput) => http.post<Game>('/games', body),
  update: (id: number, body: GameInput) => http.put<Game>(`/games/${id}`, body),
  /**
   * A API apaga denúncias e arbitragens da partida, mas não as participações
   * (dá erro de FK). Remove os times antes e só então a partida.
   */
  removeCascade: async (id: number, teams: GameTeams | undefined) => {
    for (const team of [teams?.home, teams?.away]) {
      if (team) await participationsService.remove(id, team.id);
    }
    await http.del(`/games/${id}`);
  },
};
