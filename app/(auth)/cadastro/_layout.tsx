import { Stack } from 'expo-router';
import { RegisterProvider } from '@/features/register/RegisterContext';
import { colors } from '@/theme/tokens';

export default function CadastroLayout() {
  return (
    <RegisterProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
    </RegisterProvider>
  );
}
