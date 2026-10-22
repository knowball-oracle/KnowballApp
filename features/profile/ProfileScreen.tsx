import { useMutation, useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Camera, CircleHelp, Info, LogOut, Trash2 } from 'lucide-react-native';
import { useEffect } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { Badge, Button, Card, Notice, PageHeader, Screen, Text, useToast } from '@/components/ui';
import { qk } from '@/services/queryKeys';
import { usersService } from '@/services/users';
import { useSession } from '@/session/SessionProvider';
import { space } from '@/theme/tokens';
import { formatInstant } from '@/utils/dates';
import { roleLabel } from '@/utils/labels';
import { errorMessage } from '@/utils/parseApiError';
import { pickProfilePhoto } from './pickPhoto';

/** Perfil (USER e ADMIN): foto, dados da conta, links e Sair. Editar o nome ficou fora do escopo. */
export function ProfileScreen() {
  const { user, photo, setPhoto, expiresAt, signOut } = useSession();
  const toast = useToast();
  const me = useQuery({ queryKey: qk.me, queryFn: usersService.me, enabled: !!user });

  // A foto pode ter mudado pelo site: o servidor é a fonte da verdade.
  useEffect(() => {
    if (me.data && (me.data.profilePicture ?? null) !== photo) void setPhoto(me.data.profilePicture ?? null);
  }, [me.data, photo, setPhoto]);

  const savePhoto = useMutation({
    mutationFn: async (next: string) => usersService.updateMe({ profilePicture: next }),
    onSuccess: async (profile, next) => {
      await setPhoto(next ? (profile.profilePicture ?? next) : null);
      void me.refetch();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success(next ? 'Foto atualizada.' : 'Foto removida.');
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (!user) return null;

  const changePhoto = async () => {
    try {
      const picked = await pickProfilePhoto();
      if (picked.status === 'ok') savePhoto.mutate(picked.dataUrl);
      if (picked.status === 'denied') {
        Alert.alert('Permissão necessária', 'Para trocar a foto, permita o acesso às fotos nos Ajustes.', [
          { text: 'Agora não', style: 'cancel' },
          { text: 'Abrir Ajustes', onPress: () => void Linking.openSettings() },
        ]);
      }
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const removePhoto = () =>
    Alert.alert('Remover foto', 'Sua foto de perfil será removida do app e do site.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => savePhoto.mutate('') },
    ]);

  const confirmSignOut = () =>
    Alert.alert('Sair da conta', 'Você precisará entrar de novo para acompanhar suas denúncias.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => void signOut() },
    ]);

  return (
    <Screen withTabBar refreshing={me.isRefetching} onRefresh={() => void me.refetch()}>
      <PageHeader eyebrow="Sua conta" title="Perfil" />

      <Card style={styles.identity}>
        <Avatar name={user.name} photo={photo} size={80} />
        <View style={styles.flex}>
          <Text variant="h2">{user.name}</Text>
          <Text variant="caption" numberOfLines={1}>
            {user.email}
          </Text>
          <Badge label={roleLabel[user.role]} style={styles.badge} />
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          title={savePhoto.isPending ? 'Salvando foto...' : photo ? 'Trocar foto' : 'Adicionar foto'}
          variant="secondary"
          leftIcon={Camera}
          icon={null}
          loading={savePhoto.isPending}
          onPress={() => void changePhoto()}
        />
        {photo ? (
          <Button title="Remover foto" variant="ghost" leftIcon={Trash2} icon={null} onPress={removePhoto} disabled={savePhoto.isPending} />
        ) : null}
      </View>

      <Notice tone="info">Os dados da conta (nome e e-mail) não podem ser alterados pelo app.</Notice>

      <View style={styles.actions}>
        <Text variant="eyebrow">Knowball</Text>
        <Button title="Como funciona" variant="secondary" leftIcon={CircleHelp} icon={null} onPress={() => router.push('/faq')} />
        <Button title="Sobre o Knowball" variant="secondary" leftIcon={Info} icon={null} onPress={() => router.push('/sobre')} />
      </View>

      {expiresAt ? (
        <Text variant="caption" align="center">
          {`Sessão válida até ${formatInstant(new Date(expiresAt).toISOString(), 'time')}. Depois disso, entre de novo.`}
        </Text>
      ) : null}
      <Button title="Sair" variant="danger" leftIcon={LogOut} icon={null} onPress={confirmSignOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  flex: { flex: 1, gap: space.xs },
  badge: { marginTop: space.xs },
  actions: { gap: space.sm },
});
