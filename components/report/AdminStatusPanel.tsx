import * as Haptics from 'expo-haptics';
import { Lock } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Notice, Text, useToast } from '@/components/ui';
import { useUpdateReportStatus } from '@/features/admin/hooks';
import type { Report } from '@/types/api';
import { space } from '@/theme/tokens';
import { nextStatuses } from '@/utils/labels';
import { errorMessage } from '@/utils/parseApiError';
import { ResolveSheet } from './ResolveSheet';

/** "Atualizar andamento" no detalhe (admin). Só avança; RESOLVED trava. */
export function AdminStatusPanel({ report }: { report: Report }) {
  const toast = useToast();
  const update = useUpdateReportStatus();
  const [resolving, setResolving] = useState<Report | null>(null);
  const next = nextStatuses(report.status);

  const startReview = () =>
    update.mutate(
      { id: report.id, status: 'UNDER_REVIEW', analysisResult: null },
      {
        onSuccess: () => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          toast.success('Status atualizado com sucesso.');
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );

  return (
    <Card style={styles.card}>
      <Text variant="h2">Atualizar andamento</Text>
      <Text variant="caption">Registre a análise ou a resolução desta denúncia.</Text>
      {next.length === 0 ? (
        <Notice tone="lock" icon={Lock}>
          Denúncia resolvida. O status e o resultado não mudam mais.
        </Notice>
      ) : (
        <View style={styles.actions}>
          {next.includes('UNDER_REVIEW') ? (
            <Button title="Iniciar análise" variant="secondary" icon={null} loading={update.isPending} onPress={startReview} />
          ) : null}
          {next.includes('RESOLVED') ? <Button title="Resolver" onPress={() => setResolving(report)} /> : null}
          <Text variant="caption">O resultado da análise é obrigatório para resolver a denúncia.</Text>
        </View>
      )}
      <ResolveSheet report={resolving} onClose={() => setResolving(null)} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.md },
  actions: { gap: space.sm },
});
