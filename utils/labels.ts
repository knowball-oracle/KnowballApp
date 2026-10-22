import type {
  AnalysisResult,
  Category,
  ParticipationType,
  RefereeStatus,
  RefereeingRole,
  ReportStatus,
  Role,
} from '@/types/api';
import { category, result, status } from '@/theme/tokens';

export const STATUS_ORDER: ReportStatus[] = ['NEW', 'UNDER_REVIEW', 'RESOLVED'];
export const RESULT_ORDER: AnalysisResult[] = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'];
export const CATEGORY_ORDER: Category[] = ['SUB_13', 'SUB_15', 'SUB_17', 'SUB_20'];
export const REFEREE_STATUS_ORDER: RefereeStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
export const REFEREEING_ROLE_ORDER: RefereeingRole[] = ['MAIN', 'ASSISTANT_1', 'ASSISTANT_2', 'FOURTH_REFEREE'];

export const statusLabel = (s: ReportStatus) => status[s]?.label ?? s;
export const statusPlural: Record<ReportStatus, string> = { NEW: 'Novas', UNDER_REVIEW: 'Em análise', RESOLVED: 'Resolvidas' };
export const statusDescription: Record<ReportStatus, string> = {
  NEW: 'Seu relato foi registrado e aguarda análise.',
  UNDER_REVIEW: 'O registro está na etapa de avaliação.',
  RESOLVED: 'A análise foi concluída. Consulte os detalhes disponíveis.',
};

export const resultLabel = (r: AnalysisResult) => result[r]?.label ?? r;
export const categoryLabel = (c: Category) => category[c]?.label ?? c;
export const categoryStage: Record<Category, string> = {
  SUB_13: 'Base inicial',
  SUB_15: 'Formação',
  SUB_17: 'Transição',
  SUB_20: 'Profissionalização',
};

export const refereeStatusLabel: Record<RefereeStatus, string> = { ACTIVE: 'Ativo', INACTIVE: 'Inativo', SUSPENDED: 'Suspenso' };
export const refereeStatusPlural: Record<RefereeStatus, string> = { ACTIVE: 'Ativos', INACTIVE: 'Inativos', SUSPENDED: 'Suspensos' };

export const refereeingRoleLabel: Record<RefereeingRole, string> = {
  MAIN: 'Principal',
  ASSISTANT_1: 'Assistente 1',
  ASSISTANT_2: 'Assistente 2',
  FOURTH_REFEREE: 'Quarto árbitro',
};

export const participationLabel: Record<ParticipationType, string> = { HOME: 'Mandante', AWAY: 'Visitante' };
export const roleLabel: Record<Role, string> = { ROLE_USER: 'Usuário', ROLE_ADMIN: 'Administrador' };

/** Próximos status permitidos no app (igual ao web; RESOLVED trava). */
export function nextStatuses(current: ReportStatus): ReportStatus[] {
  if (current === 'NEW') return ['UNDER_REVIEW', 'RESOLVED'];
  if (current === 'UNDER_REVIEW') return ['RESOLVED'];
  return [];
}
