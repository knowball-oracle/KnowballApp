// Tokens do DESIGN.md. Nenhuma cor, tamanho ou raio fora daqui.

export const colors = {
  bg: '#0A0A0A',
  surface: '#111111',
  card: 'rgba(255,255,255,0.04)',
  cardHover: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(255,255,255,0.15)',
  text: 'rgba(255,255,255,0.90)',
  textStrong: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.55)',
  textMuted: 'rgba(255,255,255,0.40)',
  textFaint: 'rgba(255,255,255,0.20)',
  accent: '#F87171', // red-400: palavra de destaque, links, foco
  accentSoft: '#FCA5A5', // red-300
  onPrimary: '#0A0A0A',
} as const;

export const status = {
  NEW: { label: 'Nova', fg: '#93C5FD', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.20)' },
  UNDER_REVIEW: { label: 'Em análise', fg: '#FCD34D', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.20)' },
  RESOLVED: { label: 'Resolvida', fg: '#6EE7B7', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.20)' },
} as const;

export const result = {
  POSITIVE: { label: 'Positivo', fg: '#6EE7B7', bg: 'rgba(16,185,129,0.15)' },
  NEUTRAL: { label: 'Neutro', fg: 'rgba(255,255,255,0.65)', bg: 'rgba(255,255,255,0.05)' },
  NEGATIVE: { label: 'Negativo', fg: '#FCA5A5', bg: 'rgba(239,68,68,0.15)' },
} as const;

export const category = {
  SUB_13: { label: 'Sub-13', fg: '#60A5FA', bg: 'rgba(59,130,246,0.10)' },
  SUB_15: { label: 'Sub-15', fg: '#34D399', bg: 'rgba(16,185,129,0.10)' },
  SUB_17: { label: 'Sub-17', fg: '#FBBF24', bg: 'rgba(245,158,11,0.10)' },
  SUB_20: { label: 'Sub-20', fg: '#FB7185', bg: 'rgba(244,63,94,0.10)' },
} as const;

/** Perfil de acesso (o web usa roxo para ROLE_ADMIN). */
export const role = {
  ROLE_ADMIN: { label: 'Admin', fg: '#C4B5FD', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.20)' },
  ROLE_USER: { label: 'Usuário', fg: 'rgba(255,255,255,0.65)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.10)' },
} as const;

export const radius ={ sm: 8, md: 12, lg: 16, xl: 24, full: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

/** Valores derivados das regras de componentes do DESIGN.md. */
export const ui = {
  /** Fundo de botão secundário, input, ícone de StatTile. */
  fill: 'rgba(255,255,255,0.05)',
  /** Borda de input focado. */
  focus: 'rgba(255,255,255,0.30)',
  /** Vidro: GlassPill. */
  glass: 'rgba(255,255,255,0.10)',
  /** Fundo da tab bar flutuante. */
  tabBar: 'rgba(10,10,10,0.8)',
  tabBarBorder: 'rgba(255,255,255,0.07)',
  /** Brilho do skeleton. */
  shimmer: 'rgba(255,255,255,0.09)',
  /** Degradê do Hero. */
  heroTop: 'rgba(0,0,0,0.6)',
  heroBottom: 'rgba(0,0,0,0.9)',
  /** Botão danger. */
  dangerBg: 'rgba(239,68,68,0.10)',
  /** Panel com tema (borda a 15%). */
  panelGreen: 'rgba(16,185,129,0.15)',
  /** Caixa de aviso âmbar. */
  warnBg: 'rgba(245,158,11,0.10)',
  warnBorder: 'rgba(245,158,11,0.20)',
  warnFg: '#FCD34D',
  successFg: '#6EE7B7',
  backdrop: 'rgba(0,0,0,0.6)',
  shadow: '#000000',
  white: '#FFFFFF',
  transparent: 'transparent',
} as const;

export const size = {
  touch: 44,
  button: 48,
  input: 48,
  pill: 40,
  chip: 36,
  tabCenter: 52,
  statIcon: 36,
  /** Raio do quadrado de ícone do StatTile (DESIGN.md). */
  statIconRadius: 10,
  tabBar: 64,
  heroCompact: 240,
  ticketNotch: 24,
  barcode: 36,
  dot: 12,
  avatar: 56,
  avatarLg: 80,
  icon: 18,
  iconSm: 16,
  iconLg: 28,
  hairline: 1,
  progress: 3,
} as const;

export const motion = {
  enter: 220,
  press: 120,
  stagger: 30,
  shimmer: 1600,
  toast: 3000,
  enterOffset: 8,
  pressScale: 0.98,
} as const;
