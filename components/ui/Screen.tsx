import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useReducedMotion, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, motion, size, space, ui } from '@/theme/tokens';
import { tabBarBottom } from './TabBar';

export interface ScreenProps {
  children: ReactNode;
  /** Rolagem (padrão: true). */
  scroll?: boolean;
  /** Reserva espaço para a tab bar flutuante. */
  withTabBar?: boolean;
  /** Formulário: KeyboardAvoidingView + toques fora fecham o teclado. */
  keyboard?: boolean;
  /** Puxar para atualizar. */
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Sem padding horizontal (para heros de ponta a ponta). */
  edgeToEdge?: boolean;
  /** Conteúdo fixo no rodapé (ex.: botão de avançar). */
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scrollProps?: Omit<ScrollViewProps, 'children' | 'contentContainerStyle' | 'refreshControl'>;
}

/** Entrada da tela: fade + 8 px de subida em 220 ms. */
function enter() {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ translateY: motion.enterOffset }] },
    animations: {
      opacity: withTiming(1, { duration: motion.enter }),
      transform: [{ translateY: withTiming(0, { duration: motion.enter }) }],
    },
  };
}

/** Espaço no fim das telas com abas: altura da tab bar flutuante + distância da base + respiro. */
export function useTabBarInset() {
  const insets = useSafeAreaInsets();
  return size.tabBar + tabBarBottom(insets.bottom) + space.xl;
}

export function Screen({
  children,
  scroll = true,
  withTabBar,
  keyboard,
  refreshing,
  onRefresh,
  edgeToEdge,
  footer,
  contentStyle,
  scrollProps,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const tabInset = useTabBarInset();
  const bottom = withTabBar ? tabInset : footer ? space.lg : insets.bottom + space.xl;

  const content = [
    styles.content,
    { paddingTop: insets.top + space.sm, paddingBottom: bottom },
    edgeToEdge && styles.edge,
    contentStyle,
  ];

  const body = scroll ? (
    <ScrollView
      {...scrollProps}
      contentInsetAdjustmentBehavior="never"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      contentContainerStyle={content}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textSecondary}
            colors={[colors.onPrimary]}
            progressBackgroundColor={colors.textStrong}
            progressViewOffset={insets.top}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[content, styles.fill]}>{children}</View>
  );

  const animated = (
    <Animated.View style={styles.fill} entering={reduceMotion ? undefined : enter}>
      {body}
      {footer ? <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>{footer}</View> : null}
    </Animated.View>
  );

  return (
    <View style={styles.root}>
      {keyboard ? (
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {animated}
        </KeyboardAvoidingView>
      ) : (
        animated
      )}
      {/* Fundo fixo atrás da barra de status: o conteúdo rolado não passa por baixo do relógio. */}
      <View pointerEvents="none" style={[styles.statusBar, { height: insets.top }]}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.statusTint]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  content: { paddingHorizontal: space.lg, gap: space.xl },
  edge: { paddingHorizontal: 0 },
  statusBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, overflow: 'hidden' },
  statusTint: { backgroundColor: ui.tabBar },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
    gap: space.sm,
  },
});
