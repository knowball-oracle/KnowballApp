import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius, size, space, ui } from '@/theme/tokens';
import { Text } from './Text';

export interface HeroProps {
  image: ImageSource | number;
  /** "tall" ≈ 55% da tela (Início); "compact" = 240 (listas). */
  height?: 'tall' | 'compact' | number;
  eyebrow?: string;
  title?: string;
  /** Segunda linha do título em Sora Light. */
  titleLight?: string;
  description?: string;
  /** Canto superior direito (ex.: GlassPill "+ Nova"). */
  topRight?: ReactNode;
  /** Canto superior esquerdo (ex.: voltar). */
  topLeft?: ReactNode;
  /** Botões dentro do hero, abaixo do texto. */
  children?: ReactNode;
  imageAccessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function Hero({
  image,
  height = 'compact',
  eyebrow,
  title,
  titleLight,
  description,
  topRight,
  topLeft,
  children,
  imageAccessibilityLabel,
  style,
}: HeroProps) {
  const { height: windowHeight } = useWindowDimensions();
  const h = height === 'tall' ? Math.round(windowHeight * 0.55) : height === 'compact' ? size.heroCompact : height;

  return (
    <View style={[styles.hero, { minHeight: h }, style]}>
      <Image
        source={image}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        // Foto nítida: sem transição e sem reduzir a resolução no decode (o iOS
        // decodificava no tamanho do primeiro layout e esticava a imagem).
        allowDownscaling={false}
        accessible={!!imageAccessibilityLabel}
        accessibilityLabel={imageAccessibilityLabel}
      />
      <LinearGradient colors={[ui.heroTop, ui.heroBottom]} style={StyleSheet.absoluteFill} />
      {topLeft || topRight ? (
        <View style={styles.top}>
          <View>{topLeft}</View>
          <View>{topRight}</View>
        </View>
      ) : null}
      <View style={styles.content}>
        {eyebrow ? <Text variant="eyebrow">{eyebrow}</Text> : null}
        {title || titleLight ? (
          <View accessible accessibilityRole="header" accessibilityLabel={[title, titleLight].filter(Boolean).join(' ')}>
            {title ? <Text variant="heroDisplay">{title}</Text> : null}
            {titleLight ? <Text variant="heroDisplayLight">{titleLight}</Text> : null}
          </View>
        ) : null}
        {description ? <Text variant="body">{description}</Text> : null}
        {children ? <View style={styles.actions}>{children}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: space.lg,
  },
  content: {
    marginTop: 'auto',
    padding: space.xl,
    gap: space.md,
  },
  actions: { gap: space.sm, marginTop: space.sm },
});
