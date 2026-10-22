import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, Notice, Sheet, Text, useToast } from '@/components/ui';
import { useUpdateReportStatus } from '@/features/admin/hooks';
import type { AnalysisResult, Report } from '@/types/api';
import { result as resultTokens, space } from '@/theme/tokens';
import { RESULT_ORDER } from '@/utils/labels';
import { errorMessage } from '@/utils/parseApiError';

/** Sheet para resolver uma denúncia: escolher Positivo / Neutro / Negativo. */
export function ResolveSheet({ report, onClose }: { report: Report | null; onClose: () => void }) {
  const toast = useToast();
  const update = useUpdateReportStatus();
  const [choice, setChoice] = useState<AnalysisResult | null>(null);

  useEffect(() => setChoice(null), [report?.id]);

  const save = () => {
    if (!report || !choice) return;
    update.mutate(
      { id: report.id, status: 'RESOLVED', analysisResult: choice },
      {
        onSuccess: () => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          toast.success(`${report.protocol} resolvida.`);
          onClose();
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };

  return (
    <Sheet
      visible={!!report}
      onClose={onClose}
      title="Resolver denúncia"
      description={report ? `Protocolo ${report.protocol}` : undefined}
      footer={<Button title="Salvar resultado" onPress={save} disabled={!choice} loading={update.isPending} />}
    >
      <Text variant="label">Resultado da análise</Text>
      <View style={styles.row}>
        {RESULT_ORDER.map((r) => (
          <Chip key={r} label={resultTokens[r].label} color={resultTokens[r].fg} active={choice === r} onPress={() => setChoice(r)} />
        ))}
      </View>
      <Notice tone="warn">Depois de resolvida, a denúncia não muda mais de status e o resultado fica definitivo no app.</Notice>
      <Text variant="caption">“Resolvida” indica conclusão da análise, não comprovação de irregularidade.</Text>
    </Sheet>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm } });
