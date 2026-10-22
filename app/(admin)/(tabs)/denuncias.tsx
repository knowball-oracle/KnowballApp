import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Inbox, Search, SearchX } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ReportCard } from '@/components/report/ReportCard';
import { ResolveSheet } from '@/components/report/ResolveSheet';
import { Button, Chip, EmptyState, ErrorState, Input, PageHeader, Screen, SkeletonList, Text, useToast } from '@/components/ui';
import { useUpdateReportStatus } from '@/features/admin/hooks';
import { countByStatus, useReports } from '@/features/reports/hooks';
import type { Report, ReportStatus } from '@/types/api';
import { space, status as statusTokens } from '@/theme/tokens';
import { STATUS_ORDER, statusPlural } from '@/utils/labels';
import { errorMessage } from '@/utils/parseApiError';
import { normalize } from '@/utils/text';

/** Fila de triagem: Novas primeiro, depois as mais antigas. */
function queueOrder(a: Report, b: Report): number {
  const rank = { NEW: 0, UNDER_REVIEW: 1, RESOLVED: 2 } as const;
  if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
  return a.status === 'RESOLVED' ? (a.date < b.date ? 1 : -1) : a.date < b.date ? -1 : 1;
}

export default function DenunciasAdmin() {
  const toast = useToast();
  const reports = useReports();
  const update = useUpdateReportStatus();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ReportStatus | null>('NEW');
  const [resolving, setResolving] = useState<Report | null>(null);
  const counts = countByStatus(reports.data);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return (reports.data ?? [])
      .filter((r) => (!status || r.status === status) && (!q || normalize(r.protocol).includes(q)))
      .sort(queueOrder);
  }, [reports.data, query, status]);

  const startReview = (r: Report) =>
    update.mutate(
      { id: r.id, status: 'UNDER_REVIEW', analysisResult: null },
      {
        onSuccess: () => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          toast.success(`${r.protocol} em análise.`);
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );

  return (
    <Screen withTabBar keyboard refreshing={reports.isRefetching} onRefresh={() => void reports.refetch()}>
      <PageHeader eyebrow="Triagem" title="Denúncias" description="Analise e resolva os relatos recebidos." />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {STATUS_ORDER.map((s) => (
          <Chip
            key={s}
            label={statusPlural[s]}
            color={statusTokens[s].fg}
            count={counts[s]}
            active={status === s}
            onPress={() => setStatus(status === s ? null : s)}
          />
        ))}
        <Chip label="Todas" count={counts.total} active={!status} onPress={() => setStatus(null)} />
      </ScrollView>
      <Input
        placeholder="Filtrar por protocolo..."
        icon={Search}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="characters"
        autoCorrect={false}
        accessibilityLabel="Filtrar por protocolo"
      />

      {reports.isPending ? (
        <SkeletonList count={4} lines={3} />
      ) : reports.isError ? (
        <ErrorState error={reports.error} title="Erro ao carregar denúncias." onRetry={() => void reports.refetch()} />
      ) : filtered.length === 0 ? (
        query || status ? (
          <EmptyState
            icon={status && !query ? Inbox : SearchX}
            title={status && !query ? `Nenhuma denúncia ${statusPlural[status].toLowerCase()}.` : 'Nenhuma denúncia encontrada com esses filtros.'}
            actionLabel="Ver todas"
            onAction={() => {
              setQuery('');
              setStatus(null);
            }}
          />
        ) : (
          <EmptyState title="Nenhuma denúncia registrada." />
        )
      ) : (
        <View style={styles.list}>
          <Text variant="caption">
            {filtered.length} {filtered.length === 1 ? 'denúncia' : 'denúncias'}
          </Text>
          {filtered.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              onPress={() => router.push(`/(admin)/denuncia/${r.id}`)}
              footer={
                r.status === 'RESOLVED' ? null : (
                  <>
                    {r.status === 'NEW' ? (
                      <Button
                        title="Iniciar análise"
                        variant="secondary"
                        icon={null}
                        block={false}
                        loading={update.isPending && update.variables?.id === r.id}
                        onPress={() => startReview(r)}
                      />
                    ) : null}
                    <Button title="Resolver" block={false} icon={null} onPress={() => setResolving(r)} />
                  </>
                )
              }
            />
          ))}
        </View>
      )}

      <ResolveSheet report={resolving} onClose={() => setResolving(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { gap: space.sm, paddingVertical: space.xs },
  list: { gap: space.md },
});
