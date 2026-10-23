import type { JwtClaims, Role } from '@/types/api';

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  // Decodifica UTF-8 (nomes com acento) sem depender de TextDecoder.
  return decodeURIComponent(
    Array.from(binary, (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''),
  );
}

export function decodeJwt(token: string): JwtClaims | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const claims = JSON.parse(base64UrlDecode(payload)) as JwtClaims;
    return typeof claims.exp === 'number' ? claims : null;
  } catch {
    return null;
  }
}

/** Milissegundos até o `exp` (negativo se já expirou). */
export function msUntilExpiry(claims: JwtClaims, now = Date.now()): number {
  return claims.exp * 1000 - now;
}

export function isExpired(claims: JwtClaims, now = Date.now()): boolean {
  return msUntilExpiry(claims, now) <= 0;
}

export function rolesOf(claims: JwtClaims): Role[] {
  if (!claims.role) return [];
  return Array.isArray(claims.role) ? claims.role : [claims.role];
}
