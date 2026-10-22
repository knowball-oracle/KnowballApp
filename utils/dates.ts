import type { IsoInstant, LocalDate, LocalDateTime } from '@/types/api';

// Formatação manual em pt-BR: determinística e sem depender do Intl do Hermes.

const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const pad = (n: number) => String(n).padStart(2, '0');

interface Parts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
}

/** LocalDateTime/LocalDate sem fuso: lido como está, sem conversão. */
function parseLocal(value: string): Parts | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(value);
  if (!m) return null;
  return { year: +m[1], month: +m[2], day: +m[3], hour: +(m[4] ?? 0), minute: +(m[5] ?? 0) };
}

/** Instant com fuso: convertido para o horário do aparelho. */
function parseInstant(value: string): Parts | null {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hour: d.getHours(), minute: d.getMinutes() };
}

export type DateStyle = 'date' | 'dateTime' | 'dateDotTime' | 'short' | 'dayMonthTime' | 'time';

function format(p: Parts | null, style: DateStyle): string {
  if (!p) return '—';
  const date = `${pad(p.day)}/${pad(p.month)}/${p.year}`;
  const time = `${pad(p.hour)}:${pad(p.minute)}`;
  switch (style) {
    case 'date':
      return date;
    case 'dateTime':
      return `${date} ${time}`;
    case 'dateDotTime':
      return `${date} · ${time}`;
    case 'short':
      return `${pad(p.day)}/${pad(p.month)}/${String(p.year).slice(2)}`;
    case 'dayMonthTime':
      return `${pad(p.day)}/${pad(p.month)} ${time}`;
    case 'time':
      return time;
  }
}

/** Report.date (Instant). */
export function formatInstant(value: IsoInstant | null | undefined, style: DateStyle = 'dateTime'): string {
  return value ? format(parseInstant(value), style) : '—';
}

/** Game.matchDate (LocalDateTime). */
export function formatLocalDateTime(value: LocalDateTime | null | undefined, style: DateStyle = 'dateTime'): string {
  return value ? format(parseLocal(value), style) : '—';
}

/** Referee.birthDate (LocalDate). */
export function formatLocalDate(value: LocalDate | null | undefined): string {
  return value ? format(parseLocal(value), 'date') : '—';
}

/** "out/26" a partir de "2026-10". */
export function formatMonthShort(month: string): string {
  const m = /^(\d{4})-(\d{2})/.exec(month);
  if (!m) return month;
  return `${MONTHS_SHORT[+m[2] - 1]}/${m[1].slice(2)}`;
}

/** Date local → "yyyy-MM-ddTHH:mm:ss" para enviar LocalDateTime (sem toISOString). */
export function toLocalDateTimeString(d: Date): LocalDateTime {
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
  );
}

/** Date local → "yyyy-MM-dd". */
export function toLocalDateString(d: Date): LocalDate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** LocalDateTime → Date local (para pickers). */
export function localToDate(value: LocalDateTime | LocalDate): Date | null {
  const p = parseLocal(value);
  return p ? new Date(p.year, p.month - 1, p.day, p.hour, p.minute) : null;
}

export function greeting(hour = new Date().getHours()): string {
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function ageFrom(birthDate: LocalDate | null | undefined, now = new Date()): number | null {
  const p = birthDate ? parseLocal(birthDate) : null;
  if (!p) return null;
  let age = now.getFullYear() - p.year;
  const m = now.getMonth() + 1 - p.month;
  if (m < 0 || (m === 0 && now.getDate() < p.day)) age--;
  return age;
}

export type GameMoment = 'today' | 'finished' | 'scheduled';

/** Igual ao web: Hoje / Fim de jogo / Agendado. */
export function gameMoment(matchDate: LocalDateTime, now = new Date()): GameMoment {
  const d = localToDate(matchDate);
  if (!d) return 'scheduled';
  if (toLocalDateString(d) === toLocalDateString(now)) return 'today';
  return d.getTime() < now.getTime() ? 'finished' : 'scheduled';
}

/** Ordenação: mais recente primeiro. Funciona para Instant e LocalDateTime ISO. */
export function byDateDesc<T>(get: (item: T) => string) {
  return (a: T, b: T) => (get(a) < get(b) ? 1 : get(a) > get(b) ? -1 : 0);
}
