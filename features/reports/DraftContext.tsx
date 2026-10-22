import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSession } from '@/session/SessionProvider';

export interface ReportDraft {
  gameId: number | null;
  refereeId: number | null;
  content: string;
}

interface DraftApi {
  draft: ReportDraft;
  /** Rascunho carregado do aparelho. */
  ready: boolean;
  /** Havia um rascunho salvo ao abrir o fluxo. */
  restored: boolean;
  update: (patch: Partial<ReportDraft>) => void;
  clear: () => Promise<void>;
}

const EMPTY: ReportDraft = { gameId: null, refereeId: null, content: '' };
const DraftContext = createContext<DraftApi | null>(null);
const keyFor = (userId: number) => `kb.draft.${userId}`;

/** Rascunho da nova denúncia, salvo no AsyncStorage a cada mudança (voltar e fechar o app não perdem dados). */
export function ReportDraftProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const [draft, setDraft] = useState<ReportDraft>(EMPTY);
  const [ready, setReady] = useState(false);
  const [restored, setRestored] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const key = user ? keyFor(user.id) : null;

  useEffect(() => {
    if (!key) return;
    void AsyncStorage.getItem(key)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as ReportDraft;
        if (saved.gameId || saved.content) {
          setDraft({ ...EMPTY, ...saved });
          setRestored(true);
        }
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, [key]);

  const update = useCallback(
    (patch: Partial<ReportDraft>) => {
      setDraft((current) => {
        const next = { ...current, ...patch };
        // Trocar de partida invalida o árbitro escolhido.
        if (patch.gameId !== undefined && patch.gameId !== current.gameId && patch.refereeId === undefined) {
          next.refereeId = null;
        }
        if (key) {
          if (saveTimer.current) clearTimeout(saveTimer.current);
          saveTimer.current = setTimeout(() => void AsyncStorage.setItem(key, JSON.stringify(next)), 300);
        }
        return next;
      });
    },
    [key],
  );

  const clear = useCallback(async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setDraft(EMPTY);
    setRestored(false);
    if (key) await AsyncStorage.removeItem(key).catch(() => undefined);
  }, [key]);

  const value = useMemo<DraftApi>(() => ({ draft, ready, restored, update, clear }), [draft, ready, restored, update, clear]);
  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useReportDraft(): DraftApi {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error('useReportDraft precisa do ReportDraftProvider');
  return ctx;
}
