import { Redirect } from 'expo-router';
import { ComingSoon } from '@/components/ComingSoon';

// Fase 1 troca isto pelo redirecionamento por sessão: (auth) | (user) | (admin).
export default function Index() {
  if (__DEV__) return <Redirect href="/dev/catalogo" />;
  return <ComingSoon title="Knowball" phase="1" />;
}
