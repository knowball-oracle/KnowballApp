import type {
  CreateReportRequest,
  CreateReportResponse,
  HalCollection,
  Report,
  UpdateReportStatusRequest,
} from '@/types/api';
import { embedded, stripLinks } from '@/utils/hal';
import { http } from './http';

type List = HalCollection<'reportList', Report>;

export const reportsService = {
  /** USER recebe só as próprias; ADMIN recebe todas. */
  list: async () => embedded(await http.get<List>('/reports'), 'reportList').map(stripLinks),
  /**
   * Só game.id, referee.id e content. A API gera protocolo, data e status,
   * manda o e-mail de confirmação e suspende o árbitro.
   */
  create: ({ game, referee, content }: CreateReportRequest) =>
    http.post<CreateReportResponse>('/reports', { game: { id: game.id }, referee: { id: referee.id }, content }),
  /** ADMIN. RESOLVED exige analysisResult; outros status mandam null. */
  updateStatus: (id: number, { status, analysisResult }: UpdateReportStatusRequest) =>
    http.put<Report>(`/reports/${id}/status`, { status, analysisResult: status === 'RESOLVED' ? analysisResult : null }),
  /** Só RESOLVED, pelo autor ou admin (a API devolve 500 quando nega). */
  remove: (id: number) => http.del(`/reports/${id}`),
};
