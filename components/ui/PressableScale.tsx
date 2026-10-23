import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { motion } from '@/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Estilo extra enquanto pressionado (ex.: fundo cardHover). */
  pressedStyle?: StyleProp<ViewStyle>;
  /** Haptic de seleção ao tocar (botões principais). */
  haptic?: boolean;
}

/** Escala 0.98 em 120 ms ao pressionar; respeita "reduzir movimento". */
export function PressableScale({ style, pressedStyle, haptic, onPressIn, onPressOut, onPress, disabled, ...rest }: PressableScaleProps) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const [pressed, setPressed] = useState(false);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        setPressed(true);
        if (!reduceMotion) scale.value = withTiming(motion.pressScale, { duration: motion.press });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        scale.value = withTiming(1, { duration: motion.press });
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) void Haptics.selectionAsync();
        onPress?.(e);
      }}
      style={[style, pressed && pressedStyle, animated]}
    />
  );
}
