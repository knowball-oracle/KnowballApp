import { router } from 'expo-router';
import { CalendarClock, CircleCheck, ExternalLink, FileText, Hourglass } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { BarList, ColumnChart } from '@/components/charts/Bars';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Panel,
  Screen,
  Skeleton,
  StatGrid,
  StatTile,
  StatusBadge,
  Text,
} from '@/components/ui';
import { useAdminAnalytics } from '@/features/admin/hooks';
import { useSession } from '@/session/SessionProvider';
import { colors, radius, space, status as statusTokens } from '@/theme/tokens';
import { formatInstant, formatMonthShort, greeting } from '@/utils/dates';
import { STATUS_ORDER, statusPlural } from '@/utils/labels';
import { firstName } from '@/utils/text';

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <Card style={styles.section}>
      <View>
        <Text variant="h2">{title}</Text>
        {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
      </View>
      {children}
    </Card>
  );
}

function Loading() {
  return <Skeleton height={120} borderRadius={radius.md} />;
}

export default function InicioAdmin() {
  const { user } = useSession();
  const a = useAdminAnalytics();
  const k = a.kpis.data;

  const statusTotal = (a.byStatus.data ?? []).reduce((s, x) => s + x.count, 0);
  const statusData = STATUS_ORDER.map((s) => ({
    label: statusPlural[s],
    value: a.byStatus.data?.find((x) => x.status === s)?.count ?? 0,
    color: statusTokens[s].fg,
  }));

  return (
    <Screen withTabBar refreshing={a.isRefetching} onRefresh={() => void a.refetch()}>
      <PageHeader
        eyebrow={greeting()}
        title={`Olá, ${firstName(user?.name)}`}
        description="Visão administrativa das denúncias da plataforma."
      />

      {a.kpis.isError ? (
        <ErrorState error={a.kpis.error} title="Não foi possível carregar o painel." onRetry={() => void a.refetch()} />
      ) : (
        <StatGrid>
          {a.kpis.isPending ? (
            [0, 1, 2, 3].map((i) => <Skeleton key={i} height={112} borderRadius={radius.lg} style={styles.tileSkeleton} />)
          ) : (
            <>
              <StatTile value={k?.totalReports ?? 0} label="Denúncias registradas" icon={FileText} onPress={() => router.push('/(admin)/(tabs)/denuncias')} />
              <StatTile value={k?.reportsThisMonth ?? 0} label="Neste mês" icon={CalendarClock} color={statusTokens.NEW.fg} />
              <StatTile value={k?.pendingCount ?? 0} label="Pendentes" icon={Hourglass} color={statusTokens.UNDER_REVIEW.fg} />
              <StatTile value={k?.resolvedCount ?? 0} label="Resolvidas" icon={CircleCheck} color={statusTokens.RESOLVED.fg} />
            </>
          )}
        </StatGrid>
      )}

      <Section title="Evolução mensal" subtitle="Denúncias por mês de registro · últimos 6 meses (mês atual parcial).">
        {a.byMonth.isPending ? (
          <Loading />
        ) : a.byMonth.isError ? (
          <ErrorState error={a.byMonth.error} onRetry={() => void a.byMonth.refetch()} />
        ) : (
          <ColumnChart
            data={(a.byMonth.data ?? []).map((m) => ({ label: formatMonthShort(m.month), value: m.count }))}
            color={statusTokens.UNDER_REVIEW.fg}
          />
        )}
      </Section>

      <Section title="Status das denúncias" subtitle="Distribuição do histórico.">
        {a.byStatus.isPending ? <Loading /> : <BarList data={statusData} total={statusTotal} />}
        <Text variant="caption">“Resolvida” indica conclusão da análise, não comprovação de irregularidade.</Text>
      </Section>

      <Section title="Árbitros mais denunciados" subtitle="Top 5 por número de denúncias.">
        {a.byReferee.isPending ? (
          <Loading />
        ) : (a.byReferee.data ?? []).length === 0 ? (
          <Text variant="caption">Sem denúncias para distribuir por árbitro.</Text>
        ) : (
          <BarList
            data={(a.byReferee.data ?? []).slice(0, 5).map((r) => ({ label: r.refereeName, value: r.reportsCount }))}
            color={colors.accentSoft}
          />
        )}
      </Section>

      <Section title="Denúncias recentes" subtitle="Os 10 registros mais novos.">
        {a.recent.isPending ? (
          <Loading />
        ) : (a.recent.data ?? []).length === 0 ? (
          <EmptyState title="Nenhuma denúncia registrada." />
        ) : (
          (a.recent.data ?? []).map((r) => (
            <Card key={r.id} onPress={() => router.push(`/(admin)/denuncia/${r.id}`)} accessibilityLabel={`Protocolo ${r.protocol}`} style={styles.recent}>
              <View style={styles.flex}>
                <Text variant="mono">{r.protocol}</Text>
                <Text variant="caption" numberOfLines={1}>
                  {r.refereeName} · {r.championshipName}
                </Text>
                <Text variant="caption">{formatInstant(r.date)}</Text>
              </View>
              <StatusBadge value={r.status} />
            </Card>
          ))
        )}
      </Section>

      <Panel>
        <Text variant="eyebrow">Oracle APEX · Inteligência operacional</Text>
        <Text variant="h2">
          Dados que apoiam a <Text variant="h2" color={colors.accent}>integridade</Text> do futebol de base.
        </Text>
        <Button title="Abrir painel APEX" variant="secondary" icon={ExternalLink} onPress={() => router.push('/(admin)/apex')} />
      </Panel>

      <Text variant="caption" align="center">
        Quantidade de relatos não comprova irregularidade.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.lg },
  tileSkeleton: { flex: 1, minWidth: 140 },
  recent: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md },
  flex: { flex: 1, gap: 2 },
});
