import type { HalCollection, Referee, RefereeInput } from '@/types/api';
import { embedded, stripLinks } from '@/utils/hal';
import { http } from './http';

type List = HalCollection<'refereeList', Referee>;

export const refereesService = {
  list: async () => embedded(await http.get<List>('/referees'), 'refereeList').map(stripLinks),
  get: async (id: number) => stripLinks(await http.get<Referee>(`/referees/${id}`)),
  create: (body: RefereeInput) => http.post<Referee>('/referees', body),
  /** Não há endpoint de suspender/reativar: troque `status` num PUT completo. */
  update: (id: number, body: RefereeInput) => http.put<Referee>(`/referees/${id}`, body),
  remove: (id: number) => http.del(`/referees/${id}`),
};
