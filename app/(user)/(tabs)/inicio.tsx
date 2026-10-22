import { router } from 'expo-router';
import { CircleCheck, Clock, FileText, Inbox, Sparkles } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { ReportCard } from '@/components/report/ReportCard';
import { Button, Card, EmptyState, ErrorState, Hero, Panel, Screen, Skeleton, StatGrid, StatTile, Text } from '@/components/ui';
import { NOT_PROOF } from '@/features/reports/copy';
import { countByStatus, useReports } from '@/features/reports/hooks';
import { useSession } from '@/session/SessionProvider';
import { colors, radius, space, status as statusTokens } from '@/theme/tokens';
import { greeting } from '@/utils/dates';
import { STATUS_ORDER, statusDescription } from '@/utils/labels';
import { firstName } from '@/utils/text';

const reportImage = require('@/assets/images/report.jpg');

export default function InicioUsuario() {
  const { user } = useSession();
  const reports = useReports();
  const counts = countByStatus(reports.data);
  const recent = (reports.data ?? []).slice(0, 3);
  const newReport = () => router.push('/(user)/nova-denuncia/partida');

  return (
    <Screen withTabBar refreshing={reports.isRefetching} onRefresh={() => void reports.refetch()}>
      <Hero
        image={reportImage}
        height="tall"
        eyebrow={greeting()}
        title={`Olá, ${firstName(user?.name)}`}
        description="Registre um relato e acompanhe suas denúncias em um só lugar."
        imageAccessibilityLabel="Profissional analisando documentos ao lado de uma estátua da Justiça"
      >
        <Button title="Registrar denúncia" onPress={newReport} />
      </Hero>

      <View style={styles.section}>
        <Text variant="eyebrow">Suas denúncias</Text>
        {reports.isPending ? (
          <StatGrid>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={112} borderRadius={radius.lg} style={styles.skeletonTile} />
            ))}
          </StatGrid>
        ) : reports.isError ? (
          <ErrorState
            error={reports.error}
            title="Não foi possível carregar suas denúncias."
            onRetry={() => void reports.refetch()}
          />
        ) : (
          <StatGrid>
            <StatTile value={counts.total} label="Registradas" icon={FileText} onPress={() => router.push('/(user)/(tabs)/protocolos')} />
            <StatTile value={counts.NEW} label="Novas" icon={Inbox} color={statusTokens.NEW.fg} />
            <StatTile value={counts.UNDER_REVIEW} label="Em análise" icon={Clock} color={statusTokens.UNDER_REVIEW.fg} />
            <StatTile value={counts.RESOLVED} label="Resolvidas" icon={CircleCheck} color={statusTokens.RESOLVED.fg} />
          </StatGrid>
        )}
      </View>

      {!reports.isPending && !reports.isError ? (
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text variant="h2">Registros recentes</Text>
            {recent.length ? (
              <Button title="Ver todas" variant="ghost" block={false} onPress={() => router.push('/(user)/(tabs)/protocolos')} />
            ) : null}
          </View>
          {recent.length ? (
            recent.map((r) => (
              <ReportCard key={r.id} report={r} compact onPress={() => router.push(`/(user)/denuncia/${r.id}`)} />
            ))
          ) : (
            <Card>
              <EmptyState
                title="Você ainda não registrou denúncias."
                message="Quando houver um relato para registrar, utilize o botão “Registrar denúncia”. Seus protocolos aparecerão aqui."
              />
            </Card>
          )}
        </View>
      ) : null}

      <Panel tone="green">
        <Text variant="eyebrow">Uma base mais transparente</Text>
        <Text variant="h2">Seu relato ajuda a dar visibilidade ao que acontece em campo.</Text>
        <Text variant="body">
          Descreva os fatos observados e acompanhe o andamento pelo protocolo. {NOT_PROOF}
        </Text>
        <Button title="Como funciona" variant="secondary" leftIcon={Sparkles} icon={null} onPress={() => router.push('/faq')} />
      </Panel>

      <View style={styles.section}>
        <Text variant="h2">Entenda o acompanhamento</Text>
        {STATUS_ORDER.map((s) => (
          <Card key={s} style={styles.stage}>
            <View style={[styles.dot, { backgroundColor: statusTokens[s].fg }]} />
            <View style={styles.flex}>
              <Text variant="label" color={statusTokens[s].fg}>
                {statusTokens[s].label}
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                {statusDescription[s]}
              </Text>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skeletonTile: { flex: 1, minWidth: 140 },
  stage: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  dot: { width: 10, height: 10, borderRadius: radius.full, marginTop: 5 },
  flex: { flex: 1, gap: 2 },
});
