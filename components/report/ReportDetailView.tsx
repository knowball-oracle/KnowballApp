import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { FileSearch, MapPin, Trash2, UserRound } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Panel,
  ResultBadge,
  Screen,
  SkeletonList,
  StatusBadge,
  Text,
  Ticket,
  Timeline,
  useToast,
} from '@/components/ui';
import { NOT_PROOF } from '@/features/reports/copy';
import { useDeleteReport, useReport } from '@/features/reports/hooks';
import { colors, result as resultTokens, size, space } from '@/theme/tokens';
import { formatInstant, formatLocalDateTime } from '@/utils/dates';
import { categoryLabel, resultLabel } from '@/utils/labels';
import { errorMessage } from '@/utils/parseApiError';

export interface ReportDetailViewProps {
  id: number;
  /** Painel "Atualizar andamento" do admin (Fase 3a). */
  adminPanel?: (report: NonNullable<ReturnType<typeof useReport>['data']>) => ReactNode;
  /** Mostrar o denunciante (admin). */
  showReporter?: boolean;
}

const RESULT_TEXT = {
  POSITIVE: 'A análise concluiu que o relato procede.',
  NEUTRAL: 'A análise foi concluída sem conclusão definitiva sobre o relato.',
  NEGATIVE: 'A análise concluiu que o relato não procede.',
} as const;

export function ReportDetailView({ id, adminPanel, showReporter }: ReportDetailViewProps) {
  const toast = useToast();
  const report = useReport(id);
  const remove = useDeleteReport();
  const r = report.data;

  const confirmDelete = () => {
    if (!r) return;
    Alert.alert('Excluir denúncia', `O protocolo ${r.protocol} será removido permanentemente. Esta ação não pode ser desfeita.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () =>
          remove.mutate(r.id, {
            onSuccess: () => {
              void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              toast.success('Denúncia excluída.');
              router.back();
            },
            onError: (e) => toast.error(errorMessage(e)),
          }),
      },
    ]);
  };

  return (
    <Screen refreshing={report.isRefetching} onRefresh={() => void report.refetch()}>
      <PageHeader back eyebrow="Denúncia" title="Detalhes da denúncia" />

      {report.isPending ? (
        <SkeletonList count={3} lines={3} />
      ) : report.isError ? (
        <ErrorState error={report.error} title="Erro ao carregar denúncia." onRetry={() => void report.refetch()} />
      ) : !r ? (
        <EmptyState
          icon={FileSearch}
          title="Denúncia não encontrada."
          message="Ela pode ter sido excluída. Atualize a lista e tente de novo."
          actionLabel="Voltar"
          onAction={() => router.back()}
        />
      ) : (
        <>
          <Ticket
            protocol={r.protocol}
            badges={
              <>
                <StatusBadge value={r.status} />
                {r.analysisResult ? <ResultBadge value={r.analysisResult} /> : null}
              </>
            }
          >
            <View style={styles.info}>
              <MapPin size={size.iconSm} color={colors.textMuted} />
              <View style={styles.flex}>
                <Text variant="eyebrow">Partida / local</Text>
                <Text variant="label">{r.game?.place ?? '—'}</Text>
                <Text variant="caption">{formatLocalDateTime(r.game?.matchDate, 'dateDotTime')}</Text>
                {r.game?.championship ? (
                  <Text variant="caption">
                    {r.game.championship.name} · {categoryLabel(r.game.championship.category)}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={styles.info}>
              <UserRound size={size.iconSm} color={colors.textMuted} />
              <View style={styles.flex}>
                <Text variant="eyebrow">Árbitro informado</Text>
                <Text variant="label">{r.referee?.name ?? '—'}</Text>
                <Text variant="caption">Registro: {formatInstant(r.date, 'dateDotTime')}</Text>
                {showReporter && r.user ? <Text variant="caption">Denunciante: {r.user.name}</Text> : null}
              </View>
            </View>
          </Ticket>

          {r.status === 'RESOLVED' && r.analysisResult ? (
            <Panel style={{ borderColor: resultTokens[r.analysisResult].bg }}>
              <Text variant="eyebrow">Resultado da análise</Text>
              <Text variant="h1" color={resultTokens[r.analysisResult].fg}>
                {resultLabel(r.analysisResult)}
              </Text>
              <Text variant="body">{RESULT_TEXT[r.analysisResult]}</Text>
            </Panel>
          ) : null}

          <Card style={styles.gap}>
            <Text variant="h2">Andamento</Text>
            <Timeline status={r.status} analysisResult={r.analysisResult} details={{ NEW: `Registrada em ${formatInstant(r.date)}` }} />
          </Card>

          {adminPanel ? adminPanel(r) : null}

          <Card style={styles.gap}>
            <View style={styles.storyHeader}>
              <View style={styles.flex}>
                <Text variant="h2">Relato da denúncia</Text>
                <Text variant="caption">Informações fornecidas pelo denunciante.</Text>
              </View>
              <Badge label="Confidencial" />
            </View>
            <Text variant="body" color={colors.text} selectable>
              {r.content}
            </Text>
          </Card>

          {r.status === 'RESOLVED' ? (
            <Card style={styles.gap}>
              <Text variant="h2">Excluir denúncia</Text>
              <Text variant="caption">Esta ação remove a denúncia permanentemente e não pode ser desfeita.</Text>
              <Button
                title={remove.isPending ? 'Excluindo...' : 'Excluir denúncia'}
                variant="danger"
                leftIcon={Trash2}
                icon={null}
                loading={remove.isPending}
                onPress={confirmDelete}
              />
            </Card>
          ) : null}

          <Text variant="caption" align="center">
            {NOT_PROOF}
          </Text>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  info: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  flex: { flex: 1, gap: 2 },
  gap: { gap: space.md },
  storyHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
});
