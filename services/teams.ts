import type { HalCollection, SyncLogosResult, Team, TeamInput } from '@/types/api';
import { embedded, stripLinks } from '@/utils/hal';
import { http } from './http';

type List = HalCollection<'teamList', Team>;

export const teamsService = {
  list: async () => embedded(await http.get<List>('/teams'), 'teamList').map(stripLinks),
  get: async (id: number) => stripLinks(await http.get<Team>(`/teams/${id}`)),
  create: (body: TeamInput) => http.post<Team>('/teams', { ...body, state: body.state.toUpperCase() }),
  /** PUT completo; preserve o logoUrl atual para não apagar o escudo. */
  update: (id: number, body: TeamInput) => http.put<Team>(`/teams/${id}`, { ...body, state: body.state.toUpperCase() }),
  remove: (id: number) => http.del(`/teams/${id}`),
  /** ADMIN. 404 se o escudo não for encontrado. */
  syncLogo: (id: number) => http.post<void>(`/teams/${id}/sync-logo`, undefined, { timeoutMs: 60_000 }),
  /** ADMIN. Sincroniza todos os escudos. */
  syncLogos: () => http.post<SyncLogosResult>('/teams/sync-logos', undefined, { timeoutMs: 120_000 }),
};
