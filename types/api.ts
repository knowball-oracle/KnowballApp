// Tipos escritos a partir das entidades e DTOs de knowball-api.

export type Role = 'ROLE_USER' | 'ROLE_ADMIN';
export type AuthProvider = 'LOCAL' | 'GOOGLE';
export type ReportStatus = 'NEW' | 'UNDER_REVIEW' | 'RESOLVED';
export type AnalysisResult = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
export type Category = 'SUB_13' | 'SUB_15' | 'SUB_17' | 'SUB_20';
export type RefereeStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type ParticipationType = 'HOME' | 'AWAY';
export type RefereeingRole = 'MAIN' | 'ASSISTANT_1' | 'ASSISTANT_2' | 'FOURTH_REFEREE';

/** Instant serializado com fuso, ex. "2026-10-22T03:00:00Z". */
export type IsoInstant = string;
/** LocalDateTime sem fuso, ex. "2026-10-22T15:30:00". */
export type LocalDateTime = string;
/** LocalDate, ex. "2008-05-01". */
export type LocalDate = string;

export interface HalLink {
  href: string;
  title?: string;
}
export type HalLinks = Record<string, HalLink>;

/** Lista HAL. Quando vazia, a API omite `_embedded`. */
export interface HalCollection<K extends string, T> {
  _embedded?: { [P in K]?: T[] };
  _links?: HalLinks;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Auth

export interface LoginRequest {
  email: string;
  password: string;
}
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
export interface LoginResponse {
  token: string;
  id: number;
  email: string;
  name: string;
  role: Role;
  /** data URL, URL https (Google) ou null. */
  profilePicture: string | null;
}
export interface JwtClaims {
  sub: string;
  email?: string;
  name?: string;
  role?: Role[] | Role;
  exp: number;
  iat?: number;
  iss?: string;
}

// Entidades

export interface Championship {
  id: number;
  name: string;
  category: Category;
  year: number;
}
export type ChampionshipInput = Omit<Championship, 'id'>;

export interface Team {
  id: number;
  name: string;
  city: string;
  /** UF com duas letras. */
  state: string;
  logoUrl: string | null;
}
export type TeamInput = Omit<Team, 'id' | 'logoUrl'> & { logoUrl?: string | null };

export interface Referee {
  id: number;
  name: string;
  birthDate: LocalDate;
  status: RefereeStatus;
}
export type RefereeInput = Omit<Referee, 'id'>;

export interface Game {
  id: number;
  championship: Championship;
  matchDate: LocalDateTime;
  place: string;
  homeScore: number;
  awayScore: number;
}
export interface GameInput {
  championship: { id: number };
  matchDate: LocalDateTime;
  place: string;
  homeScore: number;
  awayScore: number;
}

export interface Participation {
  id: { gameId: number; teamId: number };
  type: ParticipationType;
  game: Game;
  team: Team;
}
export interface ParticipationInput {
  game: { id: number };
  team: { id: number };
  type: ParticipationType;
}
/** Times de uma partida, montados a partir de GET /participations. */
export interface GameTeams {
  home?: Team;
  away?: Team;
}

export interface Refereeing {
  id: { gameId: number; refereeId: number };
  role: RefereeingRole;
  game: Game;
  referee: Referee;
}
export interface RefereeingInput {
  game: { id: number };
  referee: { id: number };
  role: RefereeingRole;
}

// Denúncias

export interface ReportUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}
export interface Report {
  id: number;
  game: Game;
  referee: Referee;
  user?: ReportUser | null;
  protocol: string;
  content: string;
  date: IsoInstant;
  status: ReportStatus;
  analysisResult: AnalysisResult | null;
}
/** Só estes três campos. Nunca enviar id, protocol, status, date nem analysisResult. */
export interface CreateReportRequest {
  game: { id: number };
  referee: { id: number };
  content: string;
}
export interface CreateReportResponse {
  id: number;
  protocol: string;
  email: string;
}
export interface UpdateReportStatusRequest {
  status: ReportStatus;
  analysisResult: AnalysisResult | null;
}

// Usuários

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
}
export interface UserProfile extends UserResponse {
  profilePicture: string | null;
}
export interface UpdateProfileRequest {
  name?: string;
  /** '' remove a foto; null mantém. */
  profilePicture?: string | null;
}
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
}
export interface UpdateUserRequest {
  name: string;
  email: string;
  /** Vazio ou ausente mantém a senha atual. */
  password?: string;
  role: Role;
}
export interface UserFilters {
  name?: string;
  email?: string;
  page?: number;
  size?: number;
}

export interface SyncLogosResult {
  total: number;
  updated: number;
  notFound: number;
}

// Analytics (/analytics/reports/*)

export interface ReportKpis {
  totalReports: number;
  reportsThisMonth: number;
  resolvedCount: number;
  pendingCount: number;
}
export interface StatusCount {
  status: ReportStatus;
  count: number;
}
export interface MonthCount {
  /** "2026-10" */
  month: string;
  /** "10/2026" */
  label: string;
  count: number;
}
export interface CategoryCount {
  category: Category;
  label: string;
  count: number;
}
export interface ChampionshipCount {
  championshipName: string;
  category: Category;
  count: number;
}
export interface RefereeCount {
  refereeId: number;
  refereeName: string;
  reportsCount: number;
}
export interface ResultCount {
  result: AnalysisResult;
  label: string;
  count: number;
}
export interface RecentReport {
  id: number;
  protocol: string;
  status: ReportStatus;
  analysisResult: AnalysisResult | null;
  date: IsoInstant;
  refereeName: string;
  championshipName: string;
}

// Erro normalizado (utils/parseApiError.ts)

export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'validation'
  | 'conflict'
  | 'server';
