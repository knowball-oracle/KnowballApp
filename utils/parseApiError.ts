import type { ApiErrorKind } from '@/types/api';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number;
  readonly fieldErrors?: Record<string, string>;

  constructor(kind: ApiErrorKind, status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** Resposta HTTP fora de 2xx, já lida como texto. */
export interface RawErrorResponse {
  status: number;
  body: string;
  contentType?: string | null;
}

export const MESSAGES = {
  network: 'Sem conexão com o servidor. Verifique sua internet e tente de novo.',
  timeout: 'O servidor demorou para responder. Tente de novo em instantes.',
  badCredentials: 'E-mail ou senha inválidos.',
  linkedRecords: 'Não é possível excluir: existem registros vinculados.',
  invalidJson: 'Os dados enviados estão em um formato inválido.',
  byStatus: {
    400: 'Os dados enviados são inválidos. Confira os campos e tente de novo.',
    401: 'Sua sessão expirou. Entre novamente para continuar.',
    403: 'Você não tem permissão para esta ação.',
    404: 'Registro não encontrado.',
    409: 'Não foi possível salvar por um conflito de dados.',
    500: 'Erro no servidor. Tente de novo em instantes.',
  } as Record<number, string>,
} as const;

const UNEXPECTED_PREFIX = /^Erro inesperado:\s*/i;
const BAD_CREDENTIALS = /bad credentials|senha inv[aá]lida|usu[aá]rio inexistente/i;
const LINKED_RECORDS = /ORA-02292|foreign key|constraint|integrity|could not execute statement/i;
const INVALID_JSON = /^Erro ao ler JSON/i;
// Mensagens internas do Spring que não servem para o usuário.
const SPRING_NOISE = /^(null|No static resource|Request method|Failed to convert|Required request|Content-Type)/i;

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 400 || status === 422) return 'validation';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notFound';
  if (status === 409) return 'conflict';
  return 'server';
}

function defaultMessage(status: number): string {
  return MESSAGES.byStatus[status] ?? MESSAGES.byStatus[status >= 500 ? 500 : 400];
}

function isRaw(input: unknown): input is RawErrorResponse {
  return (
    typeof input === 'object' &&
    input !== null &&
    typeof (input as RawErrorResponse).status === 'number' &&
    typeof (input as RawErrorResponse).body === 'string'
  );
}

function isStringRecord(value: object): value is Record<string, string> {
  const entries = Object.values(value);
  return entries.length > 0 && entries.every((v) => typeof v === 'string');
}

function fromText(status: number, raw: string): ApiError {
  const text = raw.replace(UNEXPECTED_PREFIX, '').trim();

  if (BAD_CREDENTIALS.test(text)) return new ApiError('unauthorized', status, MESSAGES.badCredentials);
  if (LINKED_RECORDS.test(text)) return new ApiError('conflict', status, MESSAGES.linkedRecords);
  if (INVALID_JSON.test(text)) return new ApiError('validation', status, MESSAGES.invalidJson);
  // A API devolve 500 quando nega a exclusão de uma denúncia (AccessDeniedException).
  if (/pode excluir|podem ser exclu[ií]das/i.test(text)) return new ApiError('forbidden', status, text);

  const useless = !text || SPRING_NOISE.test(text) || text.length > 300 || text.startsWith('<');
  return new ApiError(kindFromStatus(status), status, useless ? defaultMessage(status) : text);
}

function fromResponse({ status, body }: RawErrorResponse): ApiError {
  const trimmed = body.trim();
  if (!trimmed) return new ApiError(kindFromStatus(status), status, defaultMessage(status));

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return fromText(status, trimmed);
  }

  if (typeof parsed === 'string') return fromText(status, parsed);

  if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
    const obj = parsed as Record<string, unknown>;
    // ProblemDetail
    if (typeof obj.detail === 'string') return fromText(status, obj.detail);
    if (typeof obj.message === 'string' && typeof obj.status === 'number') return fromText(status, obj.message);
    // Mapa de validação {campo: mensagem}
    if (isStringRecord(obj)) {
      const first = Object.values(obj)[0];
      return new ApiError('validation', status, first, obj);
    }
    if (typeof obj.title === 'string') return fromText(status, obj.title);
  }

  return new ApiError(kindFromStatus(status), status, defaultMessage(status));
}

/** Normaliza qualquer erro (resposta HTTP, falha de rede, timeout) num ApiError. */
export function parseApiError(input: unknown): ApiError {
  if (input instanceof ApiError) return input;
  if (isRaw(input)) return fromResponse(input);

  if (input instanceof Error) {
    if (input.name === 'AbortError' || input.name === 'TimeoutError' || /timeout/i.test(input.message)) {
      return new ApiError('timeout', 0, MESSAGES.timeout);
    }
    return new ApiError('network', 0, MESSAGES.network);
  }
  return new ApiError('network', 0, MESSAGES.network);
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

/** 4xx não deve ser repetido automaticamente. */
export function isClientError(e: unknown): boolean {
  return isApiError(e) && e.status >= 400 && e.status < 500;
}

export function errorMessage(e: unknown): string {
  return parseApiError(e).message;
}
