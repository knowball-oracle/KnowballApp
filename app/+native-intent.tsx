/**
 * Normaliza os links que abrem o app antes do Expo Router casar a rota.
 * O QR do Expo Go abre `exp://host:porta/--/` e o esquema próprio abre `knowball://`;
 * os dois devem cair na raiz (app/index.tsx), que redireciona pela sessão.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  try {
    let p = path ?? '';
    const expoGo = p.indexOf('/--/');
    if (expoGo !== -1) p = p.slice(expoGo + 3);
    else if (p.endsWith('/--')) p = '/';
    else p = p.replace(/^[a-z][\w+.-]*:\/\/[^/]*/i, '');
    p = p.split(/[?#]/)[0] ?? '';
    if (!p || p === '/') return '/';
    return p.startsWith('/') ? p : `/${p}`;
  } catch {
    return '/';
  }
}
