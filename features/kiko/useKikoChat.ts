import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CHAT_MAX_LENGTH } from '@/config';
import { streamChat } from '@/services/chat';
import { useSession } from '@/session/SessionProvider';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

export const KIKO_WELCOME =
  'Olá! 👋 Sou o **Kiko**, seu guia no Knowball. Posso te ajudar a entender o sistema e a realizar denúncias. Como posso te ajudar hoje?';
export const KIKO_SUGGESTIONS = ['O que é o Knowball?', 'Como faço uma denúncia?', 'O que é um protocolo KB?'];
const KIKO_ERROR = 'Desculpe, estou com dificuldades agora. Tente novamente em instantes. 🙏';
const MAX_STORED = 60;

const keyFor = (userId: number) => `kb.kiko.${userId}`;
let seq = 0;
const newId = () => `${Date.now()}-${++seq}`;

/**
 * Conversa com o Kiko. A memória do servidor fica na RAM (10 mensagens); o histórico
 * exibido é guardado no aparelho, por usuário.
 */
export function useKikoChat() {
  const { user } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const key = user ? keyFor(user.id) : null;

  useEffect(() => {
    if (!key) return;
    void AsyncStorage.getItem(key)
      .then((raw) => {
        if (raw) setMessages(JSON.parse(raw) as ChatMessage[]);
      })
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, [key]);

  // Salva quando nenhuma resposta está chegando (evita gravar a cada pedaço do stream).
  useEffect(() => {
    if (!key || !loaded || streamingId) return;
    void AsyncStorage.setItem(key, JSON.stringify(messages.slice(-MAX_STORED))).catch(() => undefined);
  }, [key, loaded, messages, streamingId]);

  useEffect(() => () => abort.current?.abort(), []);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, CHAT_MAX_LENGTH);
      if (!text || streamingId) return;
      const assistantId = newId();
      setMessages((list) => [
        ...list,
        { id: newId(), role: 'user', content: text },
        { id: assistantId, role: 'assistant', content: '' },
      ]);
      setStreamingId(assistantId);
      const controller = new AbortController();
      abort.current = controller;

      const patch = (fn: (m: ChatMessage) => ChatMessage) =>
        setMessages((list) => list.map((m) => (m.id === assistantId ? fn(m) : m)));

      try {
        await streamChat(text, {
          signal: controller.signal,
          onChunk: (chunk) => patch((m) => ({ ...m, content: m.content + chunk })),
        });
        patch((m) => (m.content.trim() ? m : { ...m, content: KIKO_ERROR, error: true }));
      } catch {
        if (!controller.signal.aborted) patch((m) => ({ ...m, content: KIKO_ERROR, error: true }));
      } finally {
        setStreamingId(null);
        abort.current = null;
      }
    },
    [streamingId],
  );

  const reset = useCallback(() => {
    abort.current?.abort();
    setStreamingId(null);
    setMessages([]);
  }, []);

  return { messages, loaded, streamingId, send, reset };
}
