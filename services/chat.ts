import { CHAT_MAX_LENGTH } from '@/config';
import { createSseParser } from '@/utils/sse';
import { parseApiError } from '@/utils/parseApiError';
import { baseHeaders, buildUrl } from './http';

export interface StreamChatOptions {
  onChunk: (text: string) => void;
  signal?: AbortSignal;
}

/**
 * POST /chat {message} → text/event-stream. Desde o SDK 56 o `fetch` global é o
 * expo/fetch, que suporta stream (não usar EXPO_PUBLIC_USE_RN_FETCH).
 * A memória do Kiko fica na RAM do servidor (10 mensagens); a conversa é guardada no aparelho.
 */
export async function streamChat(message: string, { onChunk, signal }: StreamChatOptions): Promise<void> {
  const response = await fetch(buildUrl('/chat'), {
    method: 'POST',
    headers: { ...baseHeaders(), Accept: 'text/event-stream', 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: message.slice(0, CHAT_MAX_LENGTH) }),
    signal,
  }).catch((e: unknown) => {
    throw parseApiError(e);
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw parseApiError({ status: response.status, body });
  }

  const parser = createSseParser(onChunk);
  const reader = response.body?.getReader();
  if (!reader) {
    parser.push(await response.text());
    parser.flush();
    return;
  }
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parser.push(decoder.decode(value, { stream: true }));
  }
  parser.push(decoder.decode());
  parser.flush();
}
