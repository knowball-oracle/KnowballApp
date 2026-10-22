import { Stack } from 'expo-router';
import { ReportDraftProvider } from '@/features/reports/DraftContext';
import { colors } from '@/theme/tokens';

export default function NovaDenunciaLayout() {
  return (
    <ReportDraftProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
    </ReportDraftProvider>
  );
}
