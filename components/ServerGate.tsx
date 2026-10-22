import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WAKE_SCREEN_DELAY_MS } from '@/config';
import { healthService } from '@/services/health';
import { qk } from '@/services/queryKeys';
import { colors, space } from '@/theme/tokens';
import { ErrorState, Text } from '@/components/ui';

const logo = require('@/assets/images/logo.svg');

/** Tela "Acordando o servidor" (única com spinner de tela cheia). */
export function WakeScreen({ seconds, error, onRetry, retrying }: { seconds: number; error?: unknown; onRetry?: () => void; retrying?: boolean }) {
  return (
    <View style={styles.root}>
      <Image source={logo} style={styles.logo} contentFit="contain" accessibilityLabel="Knowball" />
      {error ? (
        <ErrorState
          title="O servidor não respondeu"
          message="Não conseguimos falar com o Knowball. Confira sua internet e tente de novo."
          onRetry={onRetry}
          retrying={retrying}
        />
      ) : (
        <View style={styles.text}>
          <Text variant="eyebrow" align="center">
            Conectando
          </Text>
          <Text variant="h1" align="center">
            Acordando o servidor
          </Text>
          <Text variant="body" align="center">
            O servidor gratuito hiberna quando fica sem uso. Isso pode levar até um minuto.
          </Text>
          <ActivityIndicator color={colors.textSecondary} style={styles.spinner} accessibilityLabel="Carregando" />
          <Text variant="caption" align="center" accessibilityLiveRegion="polite">
            {seconds} s
          </Text>
        </View>
      )}
    </View>
  );
}

/** Faz ping em /auth/health ao abrir. Só mostra a tela de espera se demorar mais de 1,5 s. */
export function ServerGate({ children }: { children: ReactNode }) {
  const health = useQuery({
    queryKey: qk.health,
    queryFn: healthService.ping,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const [showWake, setShowWake] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const waiting = health.isPending || (health.isError && health.isFetching);

  useEffect(() => {
    if (!waiting) return;
    const started = Date.now();
    const delay = setTimeout(() => setShowWake(true), WAKE_SCREEN_DELAY_MS);
    const tick = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => {
      clearTimeout(delay);
      clearInterval(tick);
    };
  }, [waiting]);

  if (health.isSuccess) return <>{children}</>;
  if (health.isError && !health.isFetching) {
    return <WakeScreen seconds={seconds} error={health.error} onRetry={() => void health.refetch()} />;
  }
  if (!showWake) return <View style={styles.blank} />;
  return <WakeScreen seconds={seconds} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: space.xl, gap: space.xxl },
  blank: { flex: 1, backgroundColor: colors.bg },
  logo: { width: 160, height: 43, alignSelf: 'center' },
  text: { gap: space.md },
  spinner: { marginTop: space.lg },
});
