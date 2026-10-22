import { Redirect, router } from 'expo-router';
import { Copy, FileText, Plus, Search, ShieldCheck, Swords, Trophy, Users } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { WakeScreen } from '@/components/ServerGate';
import {
  Badge,
  Button,
  Card,
  CategoryBadge,
  Chip,
  EmptyState,
  ErrorState,
  GlassPill,
  Hero,
  Input,
  OfflineBanner,
  PageHeader,
  Panel,
  ProgressHeader,
  ResultBadge,
  Screen,
  Sheet,
  Skeleton,
  SkeletonList,
  StatGrid,
  StatTile,
  StatusBadge,
  Text,
  Ticket,
  Timeline,
  useToast,
} from '@/components/ui';
import { category, colors, space, status } from '@/theme/tokens';
import { CATEGORY_ORDER, RESULT_ORDER, STATUS_ORDER } from '@/utils/labels';

const reportImage = require('@/assets/images/report.jpg');

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="eyebrow">{title}</Text>
      {children}
    </View>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

export default function Catalogo() {
  if (!__DEV__) return <Redirect href="/" />;
  return <Catalog />;
}

function Catalog() {
  const toast = useToast();
  const [text, setText] = useState('');
  const [story, setStory] = useState('Minuto do lance: 32\nO que aconteceu: ');
  const [activeCategory, setActiveCategory] = useState<string | null>('SUB_15');
  const [sheet, setSheet] = useState(false);
  const [wake, setWake] = useState(false);

  return (
    <Screen>
      <PageHeader
        eyebrow="Só em desenvolvimento"
        title="Catálogo de componentes"
        description="Todos os componentes base do DESIGN.md, para aprovar o visual antes das telas reais."
      />

      <Section title="Navegação">
        <Row>
          <Button title="Abas do USER" variant="secondary" block={false} onPress={() => router.push('/(user)/(tabs)/inicio')} />
          <Button title="Abas do ADMIN" variant="secondary" block={false} onPress={() => router.push('/(admin)/(tabs)/inicio')} />
        </Row>
        <Button title="Ver tela “Acordando o servidor”" variant="ghost" icon={null} onPress={() => setWake(true)} />
      </Section>

      <Section title="Tipografia">
        <View>
          <Text variant="display">Cada relato importa.</Text>
          <Text variant="displayLight">Cada análise gera confiança.</Text>
        </View>
        <Text variant="h1">Título de tela (h1)</Text>
        <Text variant="h2">Título de seção (h2)</Text>
        <Text variant="body">
          Texto corrido (body). O Knowball organiza cada caso com protocolo, histórico e análise responsável.
        </Text>
        <Text variant="label">Rótulo (label)</Text>
        <Text variant="eyebrow">Eyebrow</Text>
        <Text variant="caption">Legenda (caption) · 22/10/2026 21:30</Text>
        <Text variant="mono">KB-2026-012</Text>
        <Text variant="h2">
          Dados que apoiam a <Text variant="h2" color={colors.accent}>integridade</Text> do futebol de base.
        </Text>
      </Section>

      <Section title="Botões">
        <Button title="Registrar denúncia" onPress={() => toast.success('Botão principal')} />
        <Button title="Secundário" variant="secondary" icon={null} />
        <Button title="Copiar protocolo" variant="secondary" leftIcon={Copy} icon={null} />
        <Button title="Ghost" variant="ghost" icon={null} />
        <Button title="Excluir denúncia" variant="danger" icon={null} />
        <Button title="Enviando..." loading />
        <Button title="Desabilitado" disabled />
      </Section>

      <Section title="Hero">
        <Hero
          image={reportImage}
          eyebrow="Denúncias"
          title="Cada relato importa."
          titleLight="Cada análise gera confiança."
          description="Registre e acompanhe denúncias relacionadas às categorias de base do futebol brasileiro."
          topRight={<GlassPill icon={Plus} label="Nova" onPress={() => toast.show('GlassPill')} />}
        >
          <Button title="Ver denúncias" />
        </Hero>
      </Section>

      <Section title="Card e Panel">
        <Card onPress={() => toast.show('Card pressionado')} accessibilityLabel="Card de exemplo">
          <View style={styles.cardTop}>
            <View style={styles.flex}>
              <Text variant="eyebrow">Protocolo</Text>
              <Text variant="mono">KB-2026-012</Text>
            </View>
            <StatusBadge value="UNDER_REVIEW" />
          </View>
          <Text variant="caption">Registrada em 22/10/2026 21:30 · Partida 18/10/2026</Text>
        </Card>
        <Panel tone="green">
          <Text variant="eyebrow">Uma base mais transparente</Text>
          <Text variant="h2">Seu relato ajuda a dar visibilidade ao que acontece em campo.</Text>
          <Text variant="body">O registro de uma denúncia não representa comprovação de irregularidade.</Text>
          <Button title="Registrar denúncia" />
        </Panel>
      </Section>

      <Section title="Badges e chips">
        <Row>
          {STATUS_ORDER.map((s) => (
            <StatusBadge key={s} value={s} />
          ))}
        </Row>
        <Row>
          {RESULT_ORDER.map((r) => (
            <ResultBadge key={r} value={r} />
          ))}
        </Row>
        <Row>
          {CATEGORY_ORDER.map((c) => (
            <CategoryBadge key={c} value={c} />
          ))}
          <Badge label="Neutro" />
        </Row>
        <Row>
          {CATEGORY_ORDER.map((c, i) => (
            <Chip
              key={c}
              label={category[c].label}
              color={category[c].fg}
              count={[4, 7, 2, 5][i]}
              active={activeCategory === c}
              onPress={() => setActiveCategory(activeCategory === c ? null : c)}
            />
          ))}
        </Row>
        <Row>
          {STATUS_ORDER.map((s) => (
            <Chip key={s} label={status[s].label} color={status[s].fg} active={s === 'NEW'} />
          ))}
        </Row>
      </Section>

      <Section title="Campos">
        <Input label="Seu e-mail" placeholder="seu@email.com" value={text} onChangeText={setText} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Sua senha" placeholder="Digite sua senha" password hint="Mínimo de 6 caracteres" />
        <Input label="Buscar" placeholder="Buscar time, campeonato ou local..." icon={Search} />
        <Input label="Com erro" placeholder="Ex.: Gabriel Rossi" error="Nome obrigatório e deve conter pelo menos 2 caracteres." />
        <Input label="Relato" multiline counter maxLength={2000} value={story} onChangeText={setStory} placeholder="Descreva o ocorrido..." />
      </Section>

      <Section title="Skeleton">
        <Skeleton width="60%" height={20} />
        <SkeletonList count={2} />
      </Section>

      <Section title="Ticket e Timeline">
        <Ticket protocol="KB-2026-012" badges={<><StatusBadge value="RESOLVED" /><ResultBadge value="POSITIVE" /></>}>
          <Text variant="eyebrow">Partida / local</Text>
          <Text variant="label">Estádio do Pacaembu</Text>
          <Text variant="caption">18/10/2026 · 15:30 · Paulista Sub-17</Text>
        </Ticket>
        <Card>
          <Timeline status="NEW" details={{ NEW: 'Registrada em 22/10/2026 21:30' }} />
        </Card>
        <Card>
          <Timeline status="UNDER_REVIEW" />
        </Card>
        <Card>
          <Timeline status="RESOLVED" analysisResult="NEGATIVE" />
        </Card>
      </Section>

      <Section title="Indicadores">
        <StatGrid>
          <StatTile value={49} label="Denúncias registradas" icon={FileText} />
          <StatTile value={12} label="Novas" icon={ShieldCheck} color={status.NEW.fg} />
          <StatTile value={8} label="Campeonatos" icon={Trophy} color={category.SUB_17.fg} />
          <StatTile value={1250} label="Partidas" icon={Swords} color={category.SUB_15.fg} />
        </StatGrid>
      </Section>

      <Section title="Estados">
        <Card>
          <EmptyState
            title="Você ainda não registrou denúncias."
            message="Quando houver um relato para registrar, utilize o botão “Registrar denúncia”."
            actionLabel="Registrar denúncia"
            onAction={() => toast.show('Ação do vazio')}
          />
        </Card>
        <Card>
          <ErrorState message="Sem conexão com o servidor. Verifique sua internet e tente de novo." onRetry={() => toast.error('Ainda sem conexão')} />
        </Card>
      </Section>

      <Section title="Toast e Sheet">
        <Row>
          <Button title="Sucesso" variant="secondary" icon={null} block={false} onPress={() => toast.success('Status atualizado com sucesso.')} />
          <Button title="Erro" variant="secondary" icon={null} block={false} onPress={() => toast.error('Não foi possível salvar.')} />
        </Row>
        <Button title="Abrir bottom sheet" variant="secondary" icon={Users} onPress={() => setSheet(true)} />
      </Section>

      <Section title="Fluxo em etapas e offline">
        <ProgressHeader step={1} total={3} stepLabel="Partida" title="Em qual jogo aconteceu?" back={() => toast.show('Voltar')} />
        <OfflineBanner forceVisible />
      </Section>

      <Sheet
        visible={sheet}
        onClose={() => setSheet(false)}
        title="Cadastrar árbitro"
        description="Gestão de árbitros"
        footer={<Button title="Cadastrar árbitro" onPress={() => { setSheet(false); toast.success('Árbitro cadastrado.'); }} />}
      >
        <Input label="Nome completo" placeholder="Ex.: João da Silva" />
        <Input label="Data de nascimento" placeholder="dd/mm/aaaa" keyboardType="number-pad" />
        <Row>
          <Chip label="Ativo" active color={status.RESOLVED.fg} />
          <Chip label="Inativo" />
          <Chip label="Suspenso" />
        </Row>
      </Sheet>

      <Modal visible={wake} animationType="fade" onRequestClose={() => setWake(false)}>
        <View style={styles.flex}>
          <WakeScreen seconds={12} />
          <View style={styles.closeWake}>
            <Button title="Fechar prévia" variant="secondary" icon={null} onPress={() => setWake(false)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, alignItems: 'center' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, marginBottom: space.sm },
  flex: { flex: 1, backgroundColor: colors.bg },
  closeWake: { position: 'absolute', left: space.lg, right: space.lg, bottom: space.xxl },
});
