import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { colors, radius, space } from '@/theme/tokens';
import { PressableScale } from './PressableScale';

export interface CardProps extends ViewProps {
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  /** Sem padding interno (para conteúdo que vai até a borda). */
  flush?: boolean;
}

/** Card translúcido. Com onPress: cardHover + escala 0.98 ao pressionar. */
export function Card({ onPress, style, flush, children, accessibilityLabel, ...rest }: CardProps) {
  const cardStyle = [styles.card, flush && styles.flush, style];
  if (!onPress) {
    return (
      <View {...rest} style={cardStyle}>
        {children}
      </View>
    );
  }
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={cardStyle}
      pressedStyle={styles.pressed}
    >
      {children}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: space.lg,
  },
  flush: { padding: 0, overflow: 'hidden' },
  pressed: { backgroundColor: colors.cardHover },
});
