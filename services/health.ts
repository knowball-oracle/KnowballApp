import { HEALTH_TIMEOUT_MS } from '@/config';
import { http } from './http';

export const healthService = {
  /** GET /auth/health → {status: "UP"}. Acorda o Render. */
  ping: () => http.get<{ status: string }>('/auth/health', { auth: false, timeoutMs: HEALTH_TIMEOUT_MS }),
};
