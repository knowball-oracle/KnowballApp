import { API_URL, TIMEOUT_MS } from '@/config';
import { ApiError, parseApiError } from '@/utils/parseApiError';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Query = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
  body?: unknown;
  query?: Query;
  timeoutMs?: number;
  /** false nas rotas públicas (/auth/*). */
  auth?: boolean;
  signal?: AbortSignal;
}

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** O token fica em memória; o SessionProvider lê do SecureStore ao abrir. */
export function setAuthToken(token: string | null) {
  authToken = token;
}
export function getAuthToken() {
  return authToken;
}
/** Chamado quando uma rota autenticada devolve 401 (token expirado ou inválido). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export function buildUrl(path: string, query?: Query): string {
  const url = `${API_URL}${path}`;
  if (!query) return url;
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `${url}?${qs}` : url;
}

export function baseHeaders(auth = true): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Language': 'pt-BR',
  };
  if (auth && authToken) headers.Authorization = `Bearer ${authToken}`;
  return headers;
}

export async function request<T>(method: Method, path: string, options: RequestOptions = {}): Promise<T> {
  const { body, query, timeoutMs = TIMEOUT_MS, auth = true, signal } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  signal?.addEventListener('abort', () => controller.abort());

  const headers = baseHeaders(auth);
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    throw parseApiError(e);
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text().catch(() => '');

  if (!response.ok) {
    const error = parseApiError({ status: response.status, body: text, contentType: response.headers.get('content-type') });
    if (response.status === 401 && auth && authToken) onUnauthorized?.();
    throw error;
  }

  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    // Algumas rotas devolvem texto puro.
    return text as unknown as T;
  }
}

export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) => request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PUT', path, { ...options, body }),
  del: <T = void>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
};

export { ApiError };
