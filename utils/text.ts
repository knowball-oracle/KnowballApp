/** Minúsculas e sem acentos, para busca. */
export function normalize(value: string | null | undefined): string {
  return (value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function firstName(name: string | null | undefined, fallback = 'Usuário'): string {
  const first = (name ?? '').trim().split(/\s+/)[0];
  return first || fallback;
}

/** Até duas iniciais, ignorando partículas curtas ("da", "de"). */
export function initials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter((p) => p.length > 2);
  const source = parts.length ? parts : (name ?? '').trim().split(/\s+/);
  return source
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function plural(count: number, singular: string, pluralForm: string): string {
  return `${count.toLocaleString('pt-BR')} ${count === 1 ? singular : pluralForm}`;
}
