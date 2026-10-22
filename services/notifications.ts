import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { AnalysisResult, ReportStatus } from '@/types/api';
import { resultLabel, statusLabel } from '@/utils/labels';

const CHANNEL_ID = 'reports';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationsService = {
  /** Pede permissão uma vez e cria o canal no Android. Só notificações locais. */
  async ensurePermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Andamento das denúncias',
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: '#F87171',
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  },

  async notifyStatusChange(params: {
    reportId: number;
    protocol: string;
    status: ReportStatus;
    analysisResult: AnalysisResult | null;
  }) {
    const { reportId, protocol, status, analysisResult } = params;
    const body =
      status === 'RESOLVED' && analysisResult
        ? `A análise foi concluída. Resultado: ${resultLabel(analysisResult)}.`
        : `Sua denúncia agora está ${statusLabel(status).toLowerCase()}.`;
    await Notifications.scheduleNotificationAsync({
      content: { title: `Protocolo ${protocol}`, body, data: { reportId } },
      trigger: Platform.OS === 'android' ? { channelId: CHANNEL_ID } : null,
    });
  },
};
