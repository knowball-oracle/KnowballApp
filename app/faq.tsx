import { router } from 'expo-router';
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Button, Card, PageHeader, Screen, Text } from '@/components/ui';
import { useSession } from '@/session/SessionProvider';
import { colors, size, space } from '@/theme/tokens';

// 6 perguntas do FAQ do web (knowball-web/features/faq), com a de denúncia adaptada ao app.
const ITEMS = [
  {
    q: 'O que é o Knowball?',
    a: 'É um sistema de denúncias voltado a suspeitas de manipulação e irregularidades em jogos das categorias de base do futebol brasileiro masculino (Sub-13 a Sub-20). Ele centraliza o registro, a análise e o acompanhamento de cada caso.',
  },
  {
    q: 'Como faço uma denúncia?',
    a: 'Toque no botão branco do centro da barra inferior. Escolha a partida, selecione o árbitro escalado e descreva o ocorrido com pelo menos 20 caracteres. Revise e envie: você recebe um protocolo na hora e por e-mail.',
  },
  {
    q: 'Posso denunciar qualquer árbitro?',
    a: 'Não. Só é possível denunciar um árbitro que estava escalado na partida selecionada. Se a arbitragem ainda não aparece na partida, ela precisa ser vinculada antes de a denúncia ser enviada.',
  },
  {
    q: 'O que é o protocolo?',
    a: 'É um código único, no formato KB-AAAA-NNN (por exemplo, KB-2026-001), gerado quando a denúncia é enviada. Ele identifica o seu caso e também chega por e-mail.',
  },
  {
    q: 'Quais são os status de uma denúncia?',
    a: 'Nova: a denúncia foi recebida e aguarda análise. Em análise: a nossa equipe está avaliando o relato. Resolvida: a análise foi concluída, com resultado Positivo, Neutro ou Negativo.',
  },
  {
    q: 'Outros usuários conseguem ver o meu relato?',
    a: 'Não. Usuários comuns visualizam apenas as próprias denúncias. O acesso aos relatos para análise é restrito à equipe administradora. Seus dados são usados exclusivamente para a análise.',
  },
];

export default function Faq() {
  const { user } = useSession();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Screen>
      <PageHeader back eyebrow="FAQ" title="Ficou com dúvidas?" description="A gente responde." />
      <View style={styles.list}>
        {ITEMS.map((item, i) => {
          const expanded = open === i;
          return (
            <Card key={item.q} style={styles.item}>
              <Pressable
                onPress={() => setOpen(expanded ? null : i)}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                style={styles.question}
              >
                <Text variant="label" style={styles.flex}>
                  {item.q}
                </Text>
                {expanded ? (
                  <ChevronUp size={size.icon} color={colors.textMuted} />
                ) : (
                  <ChevronDown size={size.icon} color={colors.textMuted} />
                )}
              </Pressable>
              {expanded ? (
                <Animated.View entering={FadeIn.duration(180)}>
                  <Text variant="body">{item.a}</Text>
                </Animated.View>
              ) : null}
            </Card>
          );
        })}
      </View>
      {user ? (
        <Button
          title="Perguntar ao Kiko"
          variant="secondary"
          leftIcon={MessageCircle}
          icon={null}
          onPress={() => router.push(user.role === 'ROLE_ADMIN' ? '/(admin)/(tabs)/kiko' : '/(user)/(tabs)/kiko')}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.sm },
  item: { gap: space.sm, paddingVertical: space.sm },
  question: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: size.touch },
  flex: { flex: 1 },
});
