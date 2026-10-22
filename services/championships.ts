import type { Championship, ChampionshipInput, HalCollection } from '@/types/api';
import { embedded, stripLinks } from '@/utils/hal';
import { http } from './http';

type List = HalCollection<'championshipList', Championship>;

export const championshipsService = {
  list: async () => embedded(await http.get<List>('/championships'), 'championshipList').map(stripLinks),
  get: async (id: number) => stripLinks(await http.get<Championship>(`/championships/${id}`)),
  create: (body: ChampionshipInput) => http.post<Championship>('/championships', body),
  /** PUT substitui o objeto inteiro: envie todos os campos. */
  update: (id: number, body: ChampionshipInput) => http.put<Championship>(`/championships/${id}`, body),
  /** Falha (registros vinculados) se houver partidas com denúncias. */
  remove: (id: number) => http.del(`/championships/${id}`),
};
