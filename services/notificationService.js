import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configura o comportamento global: como a notificação aparece quando o app está aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Solicita permissão de notificação ao usuário.
 * Chamado uma vez no boot do app.
 * Retorna true se a permissão foi concedida.
 */
export async function requestNotificationPermissions() {
  if (!Device.isDevice) {
    // Em simulador iOS as notificações não funcionam,
    // mas em emulador Android sim. Não bloqueia o fluxo.
    console.log('[notifications] rodando em simulador');
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // Android exige um canal de notificação explícito a partir do API 26
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notificações Knowball',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0066CC',
    });
  }

  return finalStatus === 'granted';
}

/**
 * Dispara notificação local quando o ADMIN avança o status de uma denúncia.
 * @param {object} params
 * @param {string} params.protocolo - código do protocolo (ex: "DEN-2026-00042")
 * @param {string} params.statusAnterior - status anterior (NEW, UNDER_REVIEW)
 * @param {string} params.statusNovo - novo status
 */
export async function notifyStatusAdvanced({ protocolo, statusAnterior, statusNovo }) {
  const titulo = `Protocolo ${protocolo} atualizado`;
  const corpo = `Status alterado: ${labelStatus(statusAnterior)} → ${labelStatus(statusNovo)}`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: titulo,
      body: corpo,
      data: {
        tipo: 'STATUS_AVANCADO',
        protocolo,
        statusNovo,
 
        url: `knowball://historico?protocolo=${protocolo}`,
      },
      sound: 'default',
    },
    trigger: null,
  });
}

/**
 * Dispara notificação local quando a comissão define um veredito.
 */
export async function notifyVerdictSet({ protocolo, veredito }) {
  const titulo = `Veredito definido — ${protocolo}`;
  const corpo = `Resultado da análise: ${labelVeredito(veredito)}`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: titulo,
      body: corpo,
      data: {
        tipo: 'VEREDITO_DEFINIDO',
        protocolo,
        veredito,
        url: `knowball://historico?protocolo=${protocolo}`,
      },
      sound: 'default',
    },
    trigger: null,
  });
}

/**
 * Dispara notificação local quando o APEX bloqueia uma denúncia
 * por score de risco do árbitro ≥ 70.
 * Reforça a integração APEX → app.
 */
export async function notifyApexBlocked({ arbitroNome, score }) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Denúncia bloqueada pelo APEX',
      body: `Árbitro ${arbitroNome} está em alto escrutínio (score ${score}/100). Novas denúncias não são aceitas no momento.`,
      data: {
        tipo: 'APEX_BLOQUEADO',
        score,
        url: 'knowball://apex',
      },
      sound: 'default',
    },
    trigger: null,
  });
}


function labelStatus(status) {
  const map = {
    NEW: 'Nova',
    UNDER_REVIEW: 'Em análise',
    RESOLVED: 'Resolvida',
  };
  return map[status] ?? status;
}

function labelVeredito(veredito) {
  const map = {
    POSITIVE: 'Procedente',
    NEUTRAL: 'Inconclusivo',
    NEGATIVE: 'Improcedente',
  };
  return map[veredito] ?? veredito;
}