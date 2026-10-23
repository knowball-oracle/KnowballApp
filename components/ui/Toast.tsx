import { CircleAlert, CircleCheck, Info } from 'lucide-react-native';
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, motion, radius, size, space, ui } from '@/theme/tokens';
import { Text } from './Text';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastApi {
  show: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const icons = { success: CircleCheck, error: CircleAlert, info: Info };
const iconColors = { success: ui.successFg, error: colors.accent, info: colors.textSecondary };

/** Toast no topo, 3 s. Para sucesso e avisos; confirmações destrutivas usam Alert. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastItem | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(0);

  const show = useCallback((message: string, type: ToastType = 'info') => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: ++nextId.current, message, type });
    timer.current = setTimeout(() => setToast(null), motion.toast);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({ show, success: (m) => show(m, 'success'), error: (m) => show(m, 'error') }),
    [show],
  );

  const Icon = toast ? icons[toast.type] : null;

  return (
    <ToastContext.Provider value={api}>
      {children}
      <View pointerEvents="none" style={[styles.host, { top: insets.top + space.sm }]}>
        {toast && Icon ? (
          <Animated.View
            key={toast.id}
            entering={FadeInUp.duration(motion.enter)}
            exiting={FadeOutUp.duration(motion.enter)}
            style={styles.toast}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <Icon size={size.icon} color={iconColors[toast.type]} />
            <Text variant="label" style={styles.text}>
              {toast.message}
            </Text>
          </Animated.View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa do ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: space.lg, right: space.lg, zIndex: 1000 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  text: { flex: 1 },
});
