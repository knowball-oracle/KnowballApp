import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';
import { homeFor, useSession } from '@/session/SessionProvider';
import type { Role } from '@/types/api';
import { colors } from '@/theme/tokens';

const screenOptions = { headerShown: false, contentStyle: { backgroundColor: colors.bg } } as const;

/**
 * Layout de grupo com guarda.
 * - role definido: só esse papel entra; sem sessão vai para boas-vindas, papel errado vai para a casa certa.
 * - role "guest": só quem não tem sessão (grupo (auth)).
 */
export function GuardedStack({ role }: { role: Role | 'guest' }) {
  const { status, user } = useSession();
  if (status === 'loading') return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  if (role === 'guest') {
    if (user) return <Redirect href={homeFor(user)} />;
  } else if (!user || user.role !== role) {
    return <Redirect href={homeFor(user)} />;
  }
  return <Stack screenOptions={screenOptions} />;
}
