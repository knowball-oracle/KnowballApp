import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ClipboardList, ExternalLink } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Hero, PageHeader, Screen, Text } from '@/components/ui';
import { APEX_URL } from '@/config';
import { colors, space } from '@/theme/tokens';

const image = require('@/assets/images/soccer-field.jpg');

const STEPS = [
  { title: 'Registro', text: 'Cada denúncia vira um registro estruturado, com protocolo e histórico.' },
  { title: 'Análise', text: 'O painel reúne indicadores para apoiar a avaliação dos dados.' },
  { title: 'Decisão', text: 'O resultado é registrado no Knowball e o denunciante é avisado.' },
];

export default function Apex() {
  const open = () => void WebBrowser.openBrowserAsync(APEX_URL);

  return (
    <Screen>
      <PageHeader back eyebrow="Oracle APEX · Inteligência operacional" title="Painel APEX" />
      <Hero image={image} height={280} imageAccessibilityLabel="Campo de futebol">
        <Text variant="heroDisplay">
          Dados que apoiam a <Text variant="heroDisplay" color={colors.accent}>integridade</Text> do futebol de base.
        </Text>
      </Hero>
      <Text variant="body">
        O Knowball organiza relatos de irregularidades em registros estruturados e rastreáveis. O painel Oracle APEX
        complementa essa operação com uma visão analítica para acompanhar denúncias, explorar indicadores e apoiar a
        avaliação dos dados.
      </Text>
      <View style={styles.actions}>
        <Button title="Abrir painel Oracle APEX" icon={ExternalLink} onPress={open} accessibilityHint="Abre o painel no navegador" />
        <Button
          title="Explorar denúncias"
          variant="secondary"
          leftIcon={ClipboardList}
          icon={null}
          onPress={() => router.push('/(admin)/(tabs)/denuncias')}
        />
        <Text variant="caption">O painel externo abre no navegador. Caso seja solicitado, autentique-se no Oracle APEX.</Text>
      </View>
      <View style={styles.steps}>
        {STEPS.map((s, i) => (
          <Card key={s.title} style={styles.step}>
            <Text variant="eyebrow">{`0${i + 1}`}</Text>
            <View style={styles.flex}>
              <Text variant="label">{s.title}</Text>
              <Text variant="caption">{s.text}</Text>
            </View>
          </Card>
        ))}
      </View>
      <Text variant="caption" align="center">
        Integridade se constrói com análise responsável.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: space.sm },
  steps: { gap: space.sm },
  step: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  flex: { flex: 1, gap: 2 },
});
