import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronRight, Users } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { PageHeader, PressableScale, Screen, Text } from '@/components/ui';
import { colors, radius, size, space, ui } from '@/theme/tokens';

const ITEMS = [
  { title: 'Partidas', text: 'Jogos, times e arbitragem', href: '/(admin)/partidas', image: require('@/assets/images/games.jpg') },
  { title: 'Árbitros', text: 'Cadastro e status', href: '/(admin)/arbitros', image: require('@/assets/images/referee.jpg') },
  { title: 'Campeonatos', text: 'Competições do Sub-13 ao Sub-20', href: '/(admin)/campeonatos', image: require('@/assets/images/championships.jpg') },
  { title: 'Times', text: 'Clubes e escudos', href: '/(admin)/times', image: require('@/assets/images/teams.jpg') },
  { title: 'Usuários', text: 'Contas e perfis de acesso', href: '/(admin)/usuarios', image: null },
  { title: 'Painel APEX', text: 'Indicadores no Oracle APEX', href: '/(admin)/apex', image: require('@/assets/images/soccer-field.jpg') },
] as const;

export default function Cadastros() {
  return (
    <Screen withTabBar>
      <PageHeader eyebrow="Gestão" title="Cadastros" description="Mantenha os dados que sustentam as denúncias." />
      <View style={styles.grid}>
        {ITEMS.map((item) => (
          <PressableScale
            key={item.title}
            onPress={() => router.push(item.href)}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}. ${item.text}`}
            style={styles.tile}
            haptic
          >
            {item.image ? (
              <Image source={item.image} style={StyleSheet.absoluteFill} contentFit="cover" allowDownscaling={false} />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.plain]}>
                <Users size={48} color={colors.textFaint} />
              </View>
            )}
            <LinearGradient colors={[ui.heroTop, ui.heroBottom]} style={StyleSheet.absoluteFill} />
            <View style={styles.text}>
              <Text variant="h2">{item.title}</Text>
              <Text variant="caption" color={colors.textSecondary} numberOfLines={2}>
                {item.text}
              </Text>
            </View>
            <View style={styles.chevron}>
              <ChevronRight size={size.iconSm} color={colors.textStrong} />
            </View>
          </PressableScale>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    height: 150,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  plain: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  text: { padding: space.md, gap: 2 },
  chevron: { position: 'absolute', top: space.md, right: space.md },
});
