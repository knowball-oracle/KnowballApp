const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Mensagens iguais às do web (features/auth). */
export function validateEmail(value: string): string | null {
  const v = value.trim();
  if (!v) return 'E-mail é obrigatório.';
  if (!EMAIL.test(v)) return 'E-mail inválido.';
  return null;
}

export function validateName(value: string): string | null {
  return value.trim().length < 2 ? 'Nome obrigatório e deve conter pelo menos 2 caracteres.' : null;
}

export function validatePassword(value: string): string | null {
  return value.length < 6 ? 'Senha deve ter no mínimo 6 caracteres.' : null;
}

export function validateCode(value: string): string | null {
  return /^\d{6}$/.test(value) ? null : 'Digite o código de 6 dígitos enviado ao seu e-mail.';
}
