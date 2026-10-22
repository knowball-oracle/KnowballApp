import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { invalidate } from '@/services/invalidation';
import { gamesService } from '@/services/games';
import { groupTeamsByGame, participationsService } from '@/services/participations';
import { qk } from '@/services/queryKeys';
import { refereeingsService } from '@/services/refereeings';
import { reportsService } from '@/services/reports';
import type { Game, GameTeams, Report, ReportStatus } from '@/types/api';
import { byDateDesc } from '@/utils/dates';

const sortReports = (list: Report[]) => [...list].sort(byDateDesc((r) => r.date));

/** GET /reports (USER: só as próprias; ADMIN: todas), da mais recente para a mais antiga. */
export function useReports() {
  return useQuery({ queryKey: qk.reports, queryFn: reportsService.list, select: sortReports });
}

/** Detalhe a partir da lista (nunca GET /reports/{id}: a API não checa o dono). */
export function useReport(id: number) {
  return useQuery({
    queryKey: qk.reports,
    queryFn: reportsService.list,
    select: (list: Report[]) => list.find((r) => r.id === id) ?? null,
  });
}

export function countByStatus(reports: Report[] | undefined): Record<ReportStatus, number> & { total: number } {
  const counts = { NEW: 0, UNDER_REVIEW: 0, RESOLVED: 0, total: 0 };
  for (const r of reports ?? []) {
    counts[r.status] += 1;
    counts.total += 1;
  }
  return counts;
}

export interface GameWithTeams extends Game {
  teams: GameTeams;
}

/** Partidas com os times (uma chamada para /games e uma para /participations). */
export function useGamesWithTeams() {
  const games = useQuery({ queryKey: qk.games, queryFn: gamesService.list });
  const participations = useQuery({
    queryKey: qk.participations,
    queryFn: participationsService.listAll,
    select: groupTeamsByGame,
  });

  const data = useMemo<GameWithTeams[] | undefined>(() => {
    if (!games.data) return undefined;
    const teams = participations.data ?? new Map<number, GameTeams>();
    return [...games.data]
      .sort(byDateDesc((g) => g.matchDate))
      .map((g) => ({ ...g, teams: teams.get(g.id) ?? {} }));
  }, [games.data, participations.data]);

  return {
    data,
    isPending: games.isPending,
    isError: games.isError,
    error: games.error,
    /** Times não carregaram: as partidas aparecem com "A definir". */
    teamsError: participations.isError,
    isRefetching: games.isRefetching || participations.isRefetching,
    refetch: () => Promise.all([games.refetch(), participations.refetch()]),
  };
}

export function useRefereeings(gameId: number | null) {
  return useQuery({
    queryKey: qk.refereeings(gameId ?? 0),
    queryFn: () => refereeingsService.byGame(gameId as number),
    enabled: gameId != null,
  });
}

export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reportsService.create,
    onSuccess: () => invalidate.reportCreated(qc),
  });
}

export function useDeleteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reportsService.remove,
    onSuccess: () => invalidate.reportChanged(qc),
  });
}
