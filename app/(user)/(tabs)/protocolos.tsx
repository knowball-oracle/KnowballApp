import { router } from 'expo-router';
import { FilePlus2, Plus, Search, SearchX } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ReportCard } from '@/components/report/ReportCard';
import { Chip, EmptyState, ErrorState, GlassPill, Hero, Input, Screen, SkeletonList, Text } from '@/components/ui';
import { NOT_PROOF } from '@/features/reports/copy';
import { countByStatus, useReports } from '@/features/reports/hooks';
import type { ReportStatus } from '@/types/api';
import { colors, space, status as statusTokens } from '@/theme/tokens';
import { STATUS_ORDER, statusPlural } from '@/utils/labels';
import { normalize } from '@/utils/text';

const reportImage = require('@/assets/images/report.jpg');

export default function Protocolos() {
  const reports = useReports();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ReportStatus | null>(null);
  const counts = countByStatus(reports.data);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return (reports.data ?? []).filter((r) => (!status || r.status === status) && (!q || normalize(r.protocol).includes(q)));
  }, [reports.data, query, status]);

  const hasFilters = !!query || !!status;
  const newReport = () => router.push('/(user)/nova-denuncia/partida');

  return (
    <Screen withTabBar keyboard refreshing={reports.isRefetching} onRefresh={() => void reports.refetch()}>
      <Hero
        image={reportImage}
        eyebrow="Denúncias"
        title="Cada relato importa."
        titleLight="Cada análise gera confiança."
        description="Acompanhe suas denúncias pelo protocolo, com histórico e análise responsável."
        topRight={<GlassPill icon={Plus} label="Nova" onPress={newReport} accessibilityLabel="Nova denúncia" />}
        imageAccessibilityLabel="Profissional analisando documentos ao lado de uma estátua da Justiça"
      />

      <View style={styles.filters}>
        <Input
          placeholder="Filtrar por protocolo..."
          icon={Search}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="characters"
          autoCorrect={false}
          accessibilityLabel="Filtrar por protocolo"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="Todas" count={counts.total} active={!status} onPress={() => setStatus(null)} />
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
        </ScrollView>
      </View>

      {reports.isPending ? (
        <SkeletonList count={4} lines={3} />
      ) : reports.isError ? (
        <ErrorState error={reports.error} title="Erro ao carregar denúncias." onRetry={() => void reports.refetch()} />
      ) : (reports.data ?? []).length === 0 ? (
        <EmptyState
          icon={FilePlus2}
          title="Nenhuma denúncia cadastrada."
          message="Quando houver um relato para registrar, ele aparece aqui com o protocolo."
          actionLabel="Registrar a primeira"
          onAction={newReport}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nenhuma denúncia encontrada com esses filtros."
          actionLabel="Limpar filtros"
          onAction={() => {
            setQuery('');
            setStatus(null);
          }}
        />
      ) : (
        <View style={styles.list}>
          {filtered.map((r) => (
            <ReportCard key={r.id} report={r} onPress={() => router.push(`/(user)/denuncia/${r.id}`)} />
          ))}
        </View>
      )}

      <Text variant="caption" align="center" color={colors.textMuted}>
        {NOT_PROOF}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { gap: space.md },
  chips: { gap: space.sm, paddingVertical: space.xs },
  list: { gap: space.md },
});
