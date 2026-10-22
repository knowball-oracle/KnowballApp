import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Notice, PageHeader, Screen, Text } from '@/components/ui';
import { NOT_PROOF } from '@/features/reports/copy';
import { space } from '@/theme/tokens';

const STEPS = ['Escolha a partida', 'Indique o árbitro escalado', 'Descreva o ocorrido e revise'];

/** O botão central da tab bar abre o fluxo direto; esta tela é o acesso alternativo. */
export default function Denunciar() {
  return (
    <Screen withTabBar>
      <PageHeader eyebrow="Denunciar" title="Nova denúncia" description="Relate uma irregularidade na arbitragem de uma partida das categorias de base." />
      <View style={styles.steps}>
        {STEPS.map((s, i) => (
          <Text key={s} variant="label">
            {i + 1}. {s}
          </Text>
        ))}
      </View>
      <Button title="Começar" onPress={() => router.push('/(user)/nova-denuncia/partida')} />
      <Notice tone="info">{NOT_PROOF}</Notice>
    </Screen>
  );
}

const styles = StyleSheet.create({ steps: { gap: space.sm } });
