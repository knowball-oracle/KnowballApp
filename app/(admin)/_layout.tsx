import { Stack } from 'expo-router';
import { colors } from '@/theme/tokens';

// Fase 1: guarda de sessão (só ROLE_ADMIN).
export default function AdminLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}
