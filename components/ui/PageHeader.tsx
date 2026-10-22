import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { space } from '@/theme/tokens';
import { GlassPill } from './GlassPill';
import { Text } from './Text';

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Mostra o voltar (GlassPill). true = router.back(). */
  back?: boolean | (() => void);
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Cabeçalho sem barra: eyebrow + h1 no conteúdo, voltar como GlassPill. */
export function PageHeader({ eyebrow, title, description, back, right, style }: PageHeaderProps) {
  const onBack = typeof back === 'function' ? back : () => (router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <View style={[styles.wrap, style]}>
      {back || right ? (
        <View style={styles.top}>
          {back ? <GlassPill icon={ArrowLeft} onPress={onBack} accessibilityLabel="Voltar" /> : <View />}
          {right}
        </View>
      ) : null}
      {eyebrow ? <Text variant="eyebrow">{eyebrow}</Text> : null}
      <Text variant="h1" accessibilityRole="header">
        {title}
      </Text>
      {description ? <Text variant="body">{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm, paddingTop: space.sm },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.md },
});
