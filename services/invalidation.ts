import type { QueryClient } from '@tanstack/react-query';
import { qk } from './queryKeys';

/**
 * Regras de invalidação depois de cada mutação. As telas chamam estas funções
 * no onSuccess, para que todas as listas afetadas se atualizem juntas.
 */
export const invalidate = {
  /** Criar denúncia suspende o árbitro automaticamente. */
  reportCreated: (qc: QueryClient) =>
    Promise.all([
      qc.invalidateQueries({ queryKey: qk.reports }),
      qc.invalidateQueries({ queryKey: qk.referees }),
      qc.invalidateQueries({ queryKey: qk.analytics.all }),
    ]),
  reportChanged: (qc: QueryClient) =>
    Promise.all([qc.invalidateQueries({ queryKey: qk.reports }), qc.invalidateQueries({ queryKey: qk.analytics.all })]),
  championships: (qc: QueryClient) =>
    Promise.all([
      qc.invalidateQueries({ queryKey: qk.championships }),
      // Partidas trazem o campeonato embutido.
      qc.invalidateQueries({ queryKey: qk.games }),
    ]),
  referees: (qc: QueryClient) =>
    Promise.all([qc.invalidateQueries({ queryKey: qk.referees }), qc.invalidateQueries({ queryKey: ['refereeings'] })]),
  teams: (qc: QueryClient) =>
    Promise.all([qc.invalidateQueries({ queryKey: qk.teams }), qc.invalidateQueries({ queryKey: qk.participations })]),
  games: (qc: QueryClient) => qc.invalidateQueries({ queryKey: qk.games }),
  /** Excluir partida apaga denúncias e arbitragens dela. */
  gameDeleted: (qc: QueryClient) =>
    Promise.all([
      qc.invalidateQueries({ queryKey: qk.games }),
      qc.invalidateQueries({ queryKey: qk.participations }),
      qc.invalidateQueries({ queryKey: ['refereeings'] }),
      qc.invalidateQueries({ queryKey: qk.reports }),
      qc.invalidateQueries({ queryKey: qk.analytics.all }),
    ]),
  participations: (qc: QueryClient) => qc.invalidateQueries({ queryKey: qk.participations }),
  refereeings: (qc: QueryClient, gameId: number) => qc.invalidateQueries({ queryKey: qk.refereeings(gameId) }),
  users: (qc: QueryClient) => qc.invalidateQueries({ queryKey: qk.usersAll }),
  me: (qc: QueryClient) => qc.invalidateQueries({ queryKey: qk.me }),
};
