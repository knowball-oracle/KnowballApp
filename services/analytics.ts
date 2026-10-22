import type {
  CategoryCount,
  ChampionshipCount,
  MonthCount,
  RecentReport,
  RefereeCount,
  ReportKpis,
  ResultCount,
  StatusCount,
} from '@/types/api';
import { http } from './http';

const base = '/analytics/reports';

/** ADMIN. `/summary` não é usado (repete kpis + by-status com o mês em UTC). */
export const analyticsService = {
  kpis: () => http.get<ReportKpis>(`${base}/kpis`),
  /** Status sem denúncias são omitidos. */
  byStatus: () => http.get<StatusCount[]>(`${base}/by-status`),
  /** months entre 1 e 24, fuso America/Sao_Paulo. */
  byMonth: (months = 6) => http.get<MonthCount[]>(`${base}/by-month`, { query: { months } }),
  byCategory: () => http.get<CategoryCount[]>(`${base}/by-category`),
  byChampionship: () => http.get<ChampionshipCount[]>(`${base}/by-championship`),
  /** Ordenado do maior para o menor. Campo: reportsCount. */
  byReferee: () => http.get<RefereeCount[]>(`${base}/by-referee`),
  byResult: () => http.get<ResultCount[]>(`${base}/by-result`),
  recent: (limit = 10) => http.get<RecentReport[]>(`${base}/recent`, { query: { limit } }),
};
