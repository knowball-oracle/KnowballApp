import type { UserFilters } from '@/types/api';

/**
 * Chaves do TanStack Query. Toda query do app usa uma destas chaves.
 * Invalidação: ver `invalidate` em services/invalidation.ts.
 */
export const qk = {
  health: ['health'] as const,
  me: ['me'] as const,
  championships: ['championships'] as const,
  teams: ['teams'] as const,
  referees: ['referees'] as const,
  games: ['games'] as const,
  game: (id: number) => ['games', id] as const,
  /** GET /participations uma vez, agrupado por game.id via select. */
  participations: ['participations'] as const,
  refereeings: (gameId: number) => ['refereeings', 'game', gameId] as const,
  /** O detalhe usa select sobre esta lista (nunca GET /reports/{id}). */
  reports: ['reports'] as const,
  users: (filters: Omit<UserFilters, 'page'>) => ['users', filters] as const,
  usersAll: ['users'] as const,
  analytics: {
    all: ['analytics'] as const,
    kpis: ['analytics', 'kpis'] as const,
    byStatus: ['analytics', 'by-status'] as const,
    byMonth: (months: number) => ['analytics', 'by-month', months] as const,
    byCategory: ['analytics', 'by-category'] as const,
    byChampionship: ['analytics', 'by-championship'] as const,
    byReferee: ['analytics', 'by-referee'] as const,
    byResult: ['analytics', 'by-result'] as const,
    recent: (limit: number) => ['analytics', 'recent', limit] as const,
  },
};
