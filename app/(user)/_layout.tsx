import { Stack } from 'expo-router';
import { colors } from '@/theme/tokens';

// Fase 1: guarda de sessão (só ROLE_USER).
export default function UserLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}
