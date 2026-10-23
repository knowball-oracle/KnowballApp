import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { homeFor, useSession } from '@/session/SessionProvider';
import { colors } from '@/theme/tokens';

/** Redireciona pela sessão: (auth) | (user) | (admin). */
export default function Index() {
  const { status, user } = useSession();
  if (status === 'loading') return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  return <Redirect href={homeFor(user)} />;
}
