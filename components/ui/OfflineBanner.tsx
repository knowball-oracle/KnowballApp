import { useNetInfo } from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space, ui } from '@/theme/tokens';
import { Text } from './Text';

/** Faixa fina "Você está offline" no topo, sem bloquear a tela. */
export function OfflineBanner({ forceVisible }: { forceVisible?: boolean }) {
  const { isConnected } = useNetInfo();
  const insets = useSafeAreaInsets();
  const offline = forceVisible || isConnected === false;
  if (!offline) return null;

  const content = (
    <View style={styles.bar} accessibilityRole="alert" accessibilityLabel="Você está offline">
      <WifiOff size={12} color={ui.warnFg} />
      <Text variant="caption" color={ui.warnFg}>
        Você está offline
      </Text>
    </View>
  );

  if (forceVisible) return content;
  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} pointerEvents="none" style={[styles.host, { top: insets.top }]}>
      {content}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 0, right: 0, zIndex: 999 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingVertical: space.xs,
    backgroundColor: ui.warnBg,
    borderBottomWidth: 1,
    borderBottomColor: ui.warnBorder,
  },
});
