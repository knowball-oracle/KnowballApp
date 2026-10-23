import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useReports } from '@/features/reports/hooks';
import { notificationsService } from '@/services/notifications';
import { useSession } from '@/session/SessionProvider';
import type { AnalysisResult, ReportStatus } from '@/types/api';

type Snapshot = Record<string, { status: ReportStatus; result: AnalysisResult | null }>;
const keyFor = (userId: number) => `kb.reportStatus.${userId}`;

/**
 * Notificação local quando o status de uma denúncia do usuário muda.
 * A lista é buscada de novo ao abrir o app e ao voltar para ele (focusManager);
 * sem segundo plano: o Expo Go não roda tarefas em background e a API não tem push.
 */
export function useReportStatusWatcher() {
  const { user } = useSession();
  const reports = useReports();
  const asked = useRef(false);

  // Compara com o último retrato salvo e notifica as mudanças.
  useEffect(() => {
    if (!user || !reports.data) return;
    const key = keyFor(user.id);
    const list = reports.data;
    void (async () => {
      const raw = await AsyncStorage.getItem(key).catch(() => null);
      const previous: Snapshot | null = raw ? (JSON.parse(raw) as Snapshot) : null;
      const next: Snapshot = {};
      for (const r of list) next[r.id] = { status: r.status, result: r.analysisResult };

      if (previous) {
        const changed = list.filter((r) => {
          const before = previous[r.id];
          return before && (before.status !== r.status || before.result !== r.analysisResult);
        });
        if (changed.length) {
          if (!asked.current) {
            asked.current = true;
            await notificationsService.ensurePermission().catch(() => false);
          }
          for (const r of changed) {
            await notificationsService
              .notifyStatusChange({ reportId: r.id, protocol: r.protocol, status: r.status, analysisResult: r.analysisResult })
              .catch(() => undefined);
          }
        }
      }
      await AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => undefined);
    })();
  }, [user, reports.data]);

  // Pede a permissão uma vez, logo depois do login.
  useEffect(() => {
    if (!user || asked.current) return;
    asked.current = true;
    void notificationsService.ensurePermission().catch(() => false);
  }, [user]);

  // Tocar na notificação abre o detalhe.
  useEffect(() => {
    const open = (response: Notifications.NotificationResponse | null) => {
      const id = response?.notification.request.content.data?.reportId;
      if (typeof id !== 'number') return;
      // Evita reabrir a mesma notificação quando as abas remontam.
      Notifications.clearLastNotificationResponse();
      router.push(`/(user)/denuncia/${id}`);
    };
    const last = Notifications.getLastNotificationResponse();
    open(last);
    const sub = Notifications.addNotificationResponseReceivedListener(open);
    return () => sub.remove();
  }, []);
}
