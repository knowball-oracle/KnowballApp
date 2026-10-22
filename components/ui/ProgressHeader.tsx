import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, motion, radius, size, space, ui } from '@/theme/tokens';
import { PageHeader, type PageHeaderProps } from './PageHeader';
import { Text } from './Text';

export interface ProgressHeaderProps extends Omit<PageHeaderProps, 'eyebrow'> {
  step: number;
  total: number;
  /** Rótulo da etapa ("Partida"). */
  stepLabel?: string;
}

/** Barra fina de progresso + "Passo 1 de 3", para fluxos em etapas. */
export function ProgressHeader({ step, total, stepLabel, ...header }: ProgressHeaderProps) {
  const fill = useAnimatedStyle(() => ({
    width: withTiming(`${(step / total) * 100}%`, { duration: motion.enter }),
  }));
  return (
    <View style={styles.wrap}>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: step }}
        accessibilityLabel={`Passo ${step} de ${total}`}
      >
        <Animated.View style={[styles.fill, fill]} />
      </View>
      <PageHeader {...header} eyebrow={`Passo ${step} de ${total}${stepLabel ? ` · ${stepLabel}` : ''}`} />
    </View>
  );
}

export function StepLabel({ step, total }: { step: number; total: number }) {
  return <Text variant="eyebrow">{`Passo ${step} de ${total}`}</Text>;
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  track: { height: size.progress, borderRadius: radius.full, backgroundColor: colors.borderStrong, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.full, backgroundColor: ui.white },
});
