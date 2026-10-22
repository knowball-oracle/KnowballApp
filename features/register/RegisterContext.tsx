import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

interface RegisterApi {
  data: RegisterData;
  update: (patch: Partial<RegisterData>) => void;
  /** E-mail e horário do último envio de código (evita reenviar ao voltar e avançar). */
  codeSent: { email: string; at: number } | null;
  setCodeSent: (value: { email: string; at: number } | null) => void;
}

const RegisterContext = createContext<RegisterApi | null>(null);

/** Dados do cadastro em etapas. Ficam na memória enquanto o fluxo estiver aberto. */
export function RegisterProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RegisterData>({ name: '', email: '', password: '', confirm: '' });
  const [codeSent, setCodeSent] = useState<RegisterApi['codeSent']>(null);

  const value = useMemo<RegisterApi>(
    () => ({ data, update: (patch) => setData((d) => ({ ...d, ...patch })), codeSent, setCodeSent }),
    [data, codeSent],
  );
  return <RegisterContext.Provider value={value}>{children}</RegisterContext.Provider>;
}

export function useRegister(): RegisterApi {
  const ctx = useContext(RegisterContext);
  if (!ctx) throw new Error('useRegister precisa do RegisterProvider');
  return ctx;
}

export const REGISTER_STEPS = 4;
export const RESEND_SECONDS = 60;
