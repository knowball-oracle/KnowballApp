import { router } from 'expo-router';
import { Info, LogOut } from 'lucide-react-native';
import { Alert, StyleSheet, View } from 'react-native';
import { Badge, Button, Card, Notice, PageHeader, Screen, Text } from '@/components/ui';
import { useSession } from '@/session/SessionProvider';
import { formatInstant } from '@/utils/dates';
import { roleLabel } from '@/utils/labels';
import { space } from '@/theme/tokens';

/** Perfil mínimo da Fase 1 (dados da sessão + Sair). A Fase 4 traz foto e o visual final. */
export function ProfilePlaceholder() {
  const { user, expiresAt, signOut } = useSession();
  if (!user) return null;

  const confirmSignOut = () =>
    Alert.alert('Sair da conta', 'Você precisará entrar de novo para acompanhar suas denúncias.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => void signOut() },
    ]);

  return (
    <Screen withTabBar>
      <PageHeader eyebrow="Sua conta" title="Perfil" />
      <Card style={styles.card}>
        <Text variant="h2">{user.name}</Text>
        <Text variant="body">{user.email}</Text>
        <Badge label={roleLabel[user.role]} />
      </Card>
      {expiresAt ? (
        <Notice tone="info">{`Sessão válida até ${formatInstant(new Date(expiresAt).toISOString(), 'time')}. Depois disso, entre de novo.`}</Notice>
      ) : null}
      <View style={styles.actions}>
        <Button title="Sobre o Knowball" variant="secondary" leftIcon={Info} icon={null} onPress={() => router.push('/sobre')} />
        <Button title="Sair" variant="danger" leftIcon={LogOut} icon={null} onPress={confirmSignOut} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.sm },
  actions: { gap: space.sm },
});
