import { X } from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, motion, radius, size, space, ui } from '@/theme/tokens';
import { Text } from './Text';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Rodapé fixo (botões). */
  footer?: ReactNode;
}

const OFFSET = 600;

/**
 * Bottom sheet com Modal + Reanimated (sem @gorhom/bottom-sheet).
 * Use para formulários do admin; o conteúdo rola e sobe com o teclado.
 */
export function Sheet({ visible, onClose, title, description, children, footer }: SheetProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);
  const duration = reduceMotion ? 0 : motion.enter + 60;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, { duration });
    } else if (mounted) {
      progress.value = withTiming(0, { duration }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [visible, mounted, duration, progress]);

  const backdrop = useAnimatedStyle(() => ({ opacity: progress.value }));
  const panel = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - progress.value) * OFFSET }] }));

  return (
    <Modal visible={mounted} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdrop]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fechar" accessibilityRole="button" />
        </Animated.View>
        <Animated.View style={[styles.panel, { paddingBottom: insets.bottom + space.lg }, panel]} accessibilityViewIsModal>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text variant="h2" accessibilityRole="header">
                {title}
              </Text>
              {description ? <Text variant="caption">{description}</Text> : null}
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              style={styles.close}
              hitSlop={space.xs}
            >
              <X size={size.icon} color={colors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body} bounces={false}>
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: ui.backdrop },
  panel: {
    maxHeight: '90%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border,
    paddingTop: space.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.borderStrong,
    marginBottom: space.md,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: space.xl, gap: space.md },
  headerText: { flex: 1, gap: space.xs },
  close: {
    width: size.touch,
    height: size.touch,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -space.sm,
    marginRight: -space.sm,
  },
  body: { paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.lg, gap: space.lg },
  footer: { paddingHorizontal: space.xl, paddingTop: space.md, gap: space.sm },
});
