import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, motion, radius, space, ui } from '@/theme/tokens';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Retângulo com brilho passando em 1,6 s. Use no lugar de spinner. */
export function Skeleton({ width = '100%', height = 16, borderRadius = radius.sm, style }: SkeletonProps) {
  const reduceMotion = useReducedMotion();
  const [w, setW] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || !w) return;
    progress.value = withRepeat(withTiming(1, { duration: motion.shimmer, easing: Easing.inOut(Easing.ease) }), -1, false);
    return () => cancelAnimation(progress);
  }, [reduceMotion, w, progress]);

  const shine = useAnimatedStyle(() => ({
    transform: [{ translateX: -w + progress.value * w * 2 }],
  }));

  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[styles.base, { width, height, borderRadius }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {w && !reduceMotion ? (
        <Animated.View style={[StyleSheet.absoluteFill, shine]}>
          <LinearGradient
            colors={[ui.transparent, ui.shimmer, ui.transparent]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

/** Esqueleto de um card de lista. */
export function SkeletonCard({ lines = 2 }: { lines?: number }) {
  return (
    <View style={styles.card} accessibilityLabel="Carregando">
      <Skeleton width="40%" height={12} />
      <Skeleton width="75%" height={18} />
      {Array.from({ length: Math.max(0, lines - 1) }, (_, i) => (
        <Skeleton key={i} width={i % 2 ? '50%' : '90%'} height={12} />
      ))}
    </View>
  );
}

export function SkeletonList({ count = 3, lines }: { count?: number; lines?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} lines={lines} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.card, overflow: 'hidden' },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.md,
  },
  list: { gap: space.md },
});
