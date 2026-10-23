import * as Haptics from 'expo-haptics';
import { Redirect, router } from 'expo-router';
import { Send } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GameCard } from '@/components/game/GameCard';
import { Button, Card, Notice, PageHeader, Screen, Text } from '@/components/ui';
import { REPORT_MIN_LENGTH } from '@/config';
import { NOT_PROOF, SUSPENSION_WARNING } from '@/features/reports/copy';
import { useReportDraft } from '@/features/reports/DraftContext';
import { useCreateReport, useGamesWithTeams, useRefereeings } from '@/features/reports/hooks';
import { colors, space } from '@/theme/tokens';
import { refereeingRoleLabel } from '@/utils/labels';
import { errorMessage } from '@/utils/parseApiError';

function Section({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text variant="eyebrow">{title}</Text>
        <Pressable onPress={onEdit} accessibilityRole="button" accessibilityLabel={`Editar ${title.toLowerCase()}`} hitSlop={space.md}>
          <Text variant="label" color={colors.accent}>
            Editar
          </Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}

export default function Revisao() {
  const { draft, ready, clear } = useReportDraft();
  const games = useGamesWithTeams();
  const refereeings = useRefereeings(draft.gameId);
  const create = useCreateReport();

  if (ready && (!draft.gameId || !draft.refereeId || draft.content.trim().length < REPORT_MIN_LENGTH)) {
    return <Redirect href="/(user)/nova-denuncia/relato" />;
  }

  const game = games.data?.find((g) => g.id === draft.gameId);
  const refereeing = refereeings.data?.find((r) => r.referee.id === draft.refereeId);

  const submit = () => {
    if (!draft.gameId || !draft.refereeId || create.isPending) return;
    create.mutate(
      { game: { id: draft.gameId }, referee: { id: draft.refereeId }, content: draft.content.trim() },
      {
        onSuccess: (res) => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // Navega antes de limpar o rascunho: com o rascunho vazio esta tela redirecionaria para o relato.
          router.replace({ pathname: '/(user)/comprovante', params: { protocol: res.protocol, email: res.email ?? '', id: String(res.id) } });
          void clear();
        },
        onError: () => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
      },
    );
  };

  return (
    <Screen
      footer={
        <Button
          title={create.isPending ? 'Enviando...' : 'Enviar denúncia'}
          icon={Send}
          loading={create.isPending}
          onPress={submit}
        />
      }
    >
      <PageHeader back eyebrow="Revisão" title="Confira antes de enviar" description="Depois de enviada, a denúncia não pode ser editada." />

      {create.isError ? <Notice tone="error">{errorMessage(create.error)}</Notice> : null}

      <Section title="Partida" onEdit={() => router.dismissTo('/(user)/nova-denuncia/partida')}>
        {game ? <GameCard game={game} teams={game.teams} /> : <Card><Text variant="caption">Carregando partida...</Text></Card>}
      </Section>

      <Section title="Árbitro" onEdit={() => router.dismissTo('/(user)/nova-denuncia/arbitro')}>
        <Card style={styles.row}>
          <View style={styles.flex}>
            <Text variant="label">{refereeing?.referee.name ?? 'Carregando...'}</Text>
            {refereeing ? <Text variant="caption">{refereeingRoleLabel[refereeing.role]}</Text> : null}
          </View>
        </Card>
      </Section>

      <Section title="Relato" onEdit={() => router.back()}>
        <Card style={styles.story}>
          <Text variant="body" color={colors.text} numberOfLines={12}>
            {draft.content.trim()}
          </Text>
          <Text variant="caption">{draft.content.trim().length.toLocaleString('pt-BR')} caracteres</Text>
        </Card>
      </Section>

      <Notice tone="warn" title="O árbitro será suspenso preventivamente.">
        {SUSPENSION_WARNING}
      </Notice>
      <Notice tone="info">{NOT_PROOF}</Notice>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 32 },
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1, gap: 2 },
  story: { gap: space.sm },
});
