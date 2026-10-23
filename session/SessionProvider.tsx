import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { useToast } from '@/components/ui';
import { queryClient } from '@/providers/QueryProvider';
import { setAuthToken, setUnauthorizedHandler } from '@/services/http';
import type { LoginResponse } from '@/types/api';
import { decodeJwt, msUntilExpiry } from '@/utils/jwt';
import { sessionStorage, type SessionUser } from './storage';

export type SessionStatus = 'loading' | 'signedOut' | 'signedIn';
type SignOutReason = 'manual' | 'expired';

interface SessionState {
  status: SessionStatus;
  user: SessionUser | null;
  /** Foto de perfil (data URL ou URL https), guardada à parte no AsyncStorage. */
  photo: string | null;
  /** exp do JWT em ms. */
  expiresAt: number | null;
}

interface SessionApi extends SessionState {
  isAdmin: boolean;
  signIn: (res: LoginResponse) => Promise<SessionUser>;
  signOut: (reason?: SignOutReason) => Promise<void>;
  setPhoto: (photo: string | null) => Promise<void>;
}

const SessionContext = createContext<SessionApi | null>(null);

const WARN_BEFORE_MS = 5 * 60_000;
const signedOut: SessionState = { status: 'signedOut', user: null, photo: null, expiresAt: null };

export function SessionProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [state, setState] = useState<SessionState>({ ...signedOut, status: 'loading' });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const signingOut = useRef(false);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const signOut = useCallback(
    async (reason: SignOutReason = 'manual') => {
      if (signingOut.current) return;
      signingOut.current = true;
      clearTimers();
      setAuthToken(null);
      await sessionStorage.clear().catch(() => undefined);
      queryClient.clear();
      setState(signedOut);
      if (reason === 'expired') toast.error('Sua sessão expirou. Entre novamente para continuar.');
      signingOut.current = false;
    },
    [toast],
  );

  const schedule = useCallback(
    (expiresAt: number) => {
      clearTimers();
      const left = expiresAt - Date.now();
      if (left - WARN_BEFORE_MS > 0) {
        timers.current.push(
          setTimeout(() => toast.show('Sua sessão expira em 5 minutos. Depois disso, entre de novo.'), left - WARN_BEFORE_MS),
        );
      }
      timers.current.push(setTimeout(() => void signOut('expired'), Math.max(0, left)));
    },
    [signOut, toast],
  );

  /** Aplica um token válido: memória do http, timers e estado. */
  const activate = useCallback(
    async (token: string, user: SessionUser): Promise<boolean> => {
      const claims = decodeJwt(token);
      if (!claims || msUntilExpiry(claims) <= 0) return false;
      const expiresAt = claims.exp * 1000;
      setAuthToken(token);
      const photo = await sessionStorage.loadPhoto(user.id).catch(() => null);
      setState({ status: 'signedIn', user, photo, expiresAt });
      schedule(expiresAt);
      return true;
    },
    [schedule],
  );

  // Restaura a sessão ao abrir o app.
  useEffect(() => {
    let alive = true;
    void (async () => {
      const saved = await sessionStorage.load().catch(() => null);
      if (!alive) return;
      if (saved && (await activate(saved.token, saved.user))) return;
      if (saved) {
        await sessionStorage.clear().catch(() => undefined);
        toast.error('Sua sessão expirou. Entre novamente para continuar.');
      }
      setState(signedOut);
    })();
    return () => {
      alive = false;
    };
  }, [activate, toast]);

  // 401 numa rota autenticada → sessão expirada.
  useEffect(() => {
    setUnauthorizedHandler(() => void signOut('expired'));
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  // Timers não disparam com o app em segundo plano: confere o exp ao voltar.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active' && state.expiresAt && state.expiresAt <= Date.now()) void signOut('expired');
    });
    return () => sub.remove();
  }, [state.expiresAt, signOut]);

  useEffect(() => clearTimers, []);

  const signIn = useCallback(
    async (res: LoginResponse) => {
      const user: SessionUser = { id: res.id, email: res.email, name: res.name, role: res.role };
      await sessionStorage.save(res.token, user);
      if (res.profilePicture) await sessionStorage.savePhoto(user.id, res.profilePicture);
      queryClient.clear();
      const ok = await activate(res.token, user);
      if (!ok) throw new Error('Token inválido');
      return user;
    },
    [activate],
  );

  const setPhoto = useCallback(
    async (photo: string | null) => {
      if (!state.user) return;
      await sessionStorage.savePhoto(state.user.id, photo);
      setState((s) => ({ ...s, photo }));
    },
    [state.user],
  );

  const value = useMemo<SessionApi>(
    () => ({ ...state, isAdmin: state.user?.role === 'ROLE_ADMIN', signIn, signOut, setPhoto }),
    [state, signIn, signOut, setPhoto],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionApi {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession precisa do SessionProvider');
  return ctx;
}

/** Rota inicial de cada perfil. */
export function homeFor(user: SessionUser | null): string {
  if (!user) return '/(auth)/boas-vindas';
  return user.role === 'ROLE_ADMIN' ? '/(admin)/(tabs)/inicio' : '/(user)/(tabs)/inicio';
}
