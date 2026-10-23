import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { CircleCheck, Copy, Share2 } from 'lucide-react-native';
import { useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { Button, Card, Notice, Screen, StatusBadge, Text, Ticket, Timeline, useToast } from '@/components/ui';
import { NOT_PROOF } from '@/features/reports/copy';
import { space, ui } from '@/theme/tokens';

export default function Comprovante() {
  const { protocol, email } = useLocalSearchParams<{ protocol?: string; email?: string; id?: string }>();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  if (!protocol) return <Redirect href="/(user)/(tabs)/inicio" />;

  const copy = async () => {
    await Clipboard.setStringAsync(protocol);
    void Haptics.selectionAsync();
    setCopied(true);
    toast.success('Protocolo copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const share = () =>
    void Share.share({
      message: `Registrei uma denúncia no Knowball. Protocolo: ${protocol}. Acompanhe pelo app ou pelo site.`,
    });

  return (
    <Screen
      footer={
        <>
          <Button title="Ver meus protocolos" onPress={() => router.dismissTo('/(user)/(tabs)/protocolos')} />
          <Button title="Voltar ao início" variant="ghost" icon={null} onPress={() => router.dismissTo('/(user)/(tabs)/inicio')} />
        </>
      }
    >
      <View style={styles.header} accessibilityRole="header">
        <CircleCheck size={40} color={ui.successFg} />
        <Text variant="h1" align="center">
          Denúncia registrada!
        </Text>
        <Text variant="body" align="center">
          Guarde seu número de protocolo. Use-o para acompanhar o status da sua denúncia.
        </Text>
      </View>

      <Ticket protocol={protocol} badges={<StatusBadge value="NEW" />} />

      <View style={styles.actions}>
        <Button
          title={copied ? 'Copiado!' : 'Copiar'}
          variant="secondary"
          leftIcon={Copy}
          icon={null}
          onPress={() => void copy()}
          style={styles.flex}
          accessibilityLabel="Copiar protocolo"
        />
        <Button
          title="Compartilhar"
          variant="secondary"
          leftIcon={Share2}
          icon={null}
          onPress={share}
          style={styles.flex}
          accessibilityLabel="Compartilhar protocolo"
        />
      </View>

      {email ? (
        <Notice tone="info" title="Confirmação enviada">
          {`Verifique o e-mail ${email}: enviamos a confirmação da sua denúncia.`}
        </Notice>
      ) : null}

      <Card style={styles.next}>
        <Text variant="h2">O que acontece agora</Text>
        <Timeline status="NEW" details={{ NEW: 'Agora mesmo' }} />
      </Card>

      <Text variant="caption" align="center">
        {NOT_PROOF}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: space.sm, paddingTop: space.lg },
  actions: { flexDirection: 'row', gap: space.sm },
  flex: { flex: 1, paddingHorizontal: space.md },
  next: { gap: space.lg },
});
