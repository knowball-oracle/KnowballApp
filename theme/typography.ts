import type { TextStyle } from 'react-native';
import { colors } from './tokens';

export const fonts = {
  light: 'Sora_300Light',
  regular: 'Sora_400Regular',
  medium: 'Sora_500Medium',
  semibold: 'Sora_600SemiBold',
  bold: 'Sora_700Bold',
} as const;

export const typography = {
  display: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 36, letterSpacing: -0.8, color: colors.textStrong },
  // A Sora não tem itálico: segunda linha do hero é só Light.
  displayLight: { fontFamily: fonts.light, fontSize: 34, lineHeight: 36, letterSpacing: -0.8, color: 'rgba(255,255,255,0.7)' },
  h1: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.5, color: colors.textStrong },
  h2: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24, color: colors.textStrong },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 24, color: colors.textSecondary },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20, color: colors.text },
  eyebrow: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 16, letterSpacing: 2, textTransform: 'uppercase', color: colors.textMuted },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  badge: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  mono: { fontFamily: fonts.semibold, fontSize: 13, letterSpacing: 1, color: colors.textStrong },
  monoLg: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, letterSpacing: 2, color: colors.textStrong },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

/** Títulos não podem crescer além disso com fonte do sistema aumentada. */
export const LIMITED_SCALE: ReadonlySet<TypographyVariant> = new Set(['display', 'displayLight', 'h1', 'monoLg']);
