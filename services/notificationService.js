import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// Define como o app reage ao receber uma notificação
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Solicita permissão de notificação ao usuário.
 * Chamada uma vez no boot do app.
 */
export async function solicitarPermissaoNotificacao() {
  if (!Device.isDevice) {
    console.log("[notif] rodando em simulador");
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Notificações Knowball",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#d62828",
    });
  }

  return finalStatus === "granted";
}

/**
 * Dispara notificação quando ADMIN avança status de denúncia.
 */
export async function notificarStatusAvancado({ protocolo, statusAnterior, statusNovo }) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Protocolo ${protocolo} atualizado`,
      body: `Status alterado: ${labelStatus(statusAnterior)} → ${labelStatus(statusNovo)}`,
      data: {
        tipo: "STATUS_AVANCADO",
        protocolo,
        statusNovo,
      },
      sound: "default",
    },
    trigger: null,
  });
}

/**
 * Dispara notificação quando comissão define veredito.
 */
export async function notificarVeredito({ protocolo, veredito }) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Veredito definido — ${protocolo}`,
      body: `Resultado da análise: ${labelVeredito(veredito)}`,
      data: {
        tipo: "VEREDITO_DEFINIDO",
        protocolo,
        veredito,
      },
      sound: "default",
    },
    trigger: null,
  });
}

/**
 * Dispara notificação quando APEX bloqueia uma denúncia.
 */
export async function notificarBloqueioApex({ arbitroNome, score }) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Denúncia bloqueada pelo Oracle APEX",
      body: `Árbitro ${arbitroNome} está em alto escrutínio (score ${score}/100). Novas denúncias temporariamente suspensas.`,
      data: {
        tipo: "APEX_BLOQUEADO",
        score,
      },
      sound: "default",
    },
    trigger: null,
  });
}

function labelStatus(status) {
  const map = { NEW: "Nova", UNDER_REVIEW: "Em análise", RESOLVED: "Resolvida" };
  return map[status] ?? status;
}

function labelVeredito(veredito) {
  const map = { POSITIVE: "Procedente", NEUTRAL: "Inconclusivo", NEGATIVE: "Improcedente" };
  return map[veredito] ?? veredito;
}