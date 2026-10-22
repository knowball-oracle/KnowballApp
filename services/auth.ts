import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types/api';
import { http } from './http';

export const authService = {
  /** Senha errada: a API devolve 500 "Bad credentials" (parseApiError traduz). */
  login: (body: LoginRequest) => http.post<LoginResponse>('/auth/login', body, { auth: false }),
  /** Envia o código de 6 dígitos (expira em 10 min). */
  sendCode: (email: string) => http.post<void>('/auth/verification/send', { email }, { auth: false }),
  confirmCode: (email: string, code: string) =>
    http.post<void>('/auth/verification/confirm', { email, code }, { auth: false }),
  /** Até 15 min depois de confirmar o código. Devolve sessão pronta. */
  register: (body: RegisterRequest) => http.post<LoginResponse>('/auth/register', body, { auth: false }),
};
