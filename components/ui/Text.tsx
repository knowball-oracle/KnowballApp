import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { LIMITED_SCALE, typography, type TypographyVariant } from '@/theme/typography';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function Text({ variant = 'body', color, align, style, maxFontSizeMultiplier, ...rest }: TextProps) {
  return (
    <RNText
      {...rest}
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? (LIMITED_SCALE.has(variant) ? 1.3 : undefined)}
      style={[typography[variant], color ? { color } : null, align ? { textAlign: align } : null, style]}
    />
  );
}
