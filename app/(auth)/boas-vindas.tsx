import { Link, router } from 'expo-router';
import { Info } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Hero, Screen, Text } from '@/components/ui';
import { colors, space } from '@/theme/tokens';

const fieldImage = require('@/assets/images/soccer-field.jpg');

const stats = [
  { value: '+100', label: 'Relatos centralizados' },
  { value: '24h', label: 'Acompanhamento contínuo' },
  { value: '100%', label: 'Confidencialidade' },
];

export default function BoasVindas() {
  return (
    <Screen>
      <Hero
        image={fieldImage}
        height="tall"
        eyebrow="Uma base mais transparente"
        title="Informação que protege"
        titleLight="o jogo."
        titleLightColor={colors.accent}
        description="O Knowball conecta relatos, partidas e análises para fortalecer a integridade das categorias de base do futebol brasileiro."
        imageAccessibilityLabel="Campo de futebol visto de cima"
      >
        <Button title="Entrar na minha conta" onPress={() => router.push('/(auth)/login')} />
        <Button title="Criar conta" variant="secondary" icon={null} onPress={() => router.push('/(auth)/cadastro/nome')} />
      </Hero>

      <View style={styles.stats}>
        {stats.map((s) => (
          <Card key={s.value} style={styles.stat} accessibilityLabel={`${s.value} ${s.label}`}>
            <Text variant="h2">{s.value}</Text>
            <Text variant="caption">{s.label}</Text>
          </Card>
        ))}
      </View>

      <Button title="Sobre o Knowball" variant="ghost" leftIcon={Info} icon={null} onPress={() => router.push('/sobre')} />
      {__DEV__ ? (
        <Link href="/dev/catalogo" style={styles.dev}>
          <Text variant="caption" align="center">
            Catálogo de componentes (dev)
          </Text>
        </Link>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: space.sm },
  stat: { flex: 1, padding: space.md, gap: space.xs },
  dev: { alignSelf: 'center', padding: space.sm },
});
