import type { HalCollection, Refereeing, RefereeingInput } from '@/types/api';
import { embedded, stripLinks } from '@/utils/hal';
import { http } from './http';

type List = HalCollection<'refereeingList', Refereeing>;

export const refereeingsService = {
  /** Árbitros escalados na partida (a denúncia só aceita estes). */
  byGame: async (gameId: number) =>
    embedded(await http.get<List>(`/refereeing/game/${gameId}`), 'refereeingList').map(stripLinks),
  /** Não existe PUT nem DELETE: confirme antes de salvar. Repetir o par troca a função. */
  create: (body: RefereeingInput) => http.post<Refereeing>('/refereeing', body),
};
