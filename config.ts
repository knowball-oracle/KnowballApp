export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://knowball-api.onrender.com';
export const WEB_URL = 'https://knowball-web-henna.vercel.app';
export const APEX_URL = 'https://oracleapex.com/ords/r/knowball_iot/knowball/dashboard-knowball';

export const TIMEOUT_MS = 20_000;
/** O Render pode levar até ~60 s para acordar. */
export const HEALTH_TIMEOUT_MS = 75_000;
/** Só mostra "Acordando o servidor" se o ping demorar mais que isso. */
export const WAKE_SCREEN_DELAY_MS = 1_500;

export const REPORT_MIN_LENGTH = 20;
export const REPORT_MAX_LENGTH = 2_000;
export const CHAT_MAX_LENGTH = 1_000;
