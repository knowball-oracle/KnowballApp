import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import versionInfo from '@/assets/version.json';
import { Avatar } from '@/components/Avatar';
import { Card, PageHeader, Screen, Text } from '@/components/ui';
import { colors, radius, size, space, ui } from '@/theme/tokens';
import { formatInstant } from '@/utils/dates';

const logo = require('@/assets/images/logo.svg');

// RUBRICA: tela Sobre com identificação da versão (assets/version.json, gerado por scripts/write-version.js).
const version = versionInfo as { appVersion: string; commitHash: string; commitHashFull?: string; buildDate: string };

const TEAM = [
  {
    name: 'Patrick Castro',
    photo: require('@/assets/team/patrick.jpg'),
    github: 'https://github.com/castropatrick',
    linkedin: 'https://www.linkedin.com/in/patrick-castro-quintana-839aa2273/',
  },
  {
    name: 'Gabriel Rossi',
    photo: require('@/assets/team/gabriel.png'),
    github: 'https://github.com/GabrielRossi01',
    linkedin: 'https://www.linkedin.com/in/gabriel-oliveira-rossi-155baa324/',
  },
  {
    name: 'Rodrigo Yamasaki',
    photo: require('@/assets/team/rodrigo.jpg'),
    github: 'https://github.com/RodrygoYamasaki',
    linkedin: 'https://www.linkedin.com/in/rodrigo-yamasaki-74a3b1324/',
  },
] as const;

function IconLink({ icon, label, url }: { icon: 'logo-github' | 'logo-linkedin'; label: string; url: string }) {
  return (
    <Pressable
      onPress={() => void Linking.openURL(url)}
      accessibilityRole="link"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
    >
      <Ionicons name={icon} size={20} color={colors.text} />
    </Pressable>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.versionRow}>
      <Text variant="caption">{label}</Text>
      <Text variant={mono ? 'mono' : 'label'} color={mono ? colors.accentSoft : undefined} selectable>
        {value}
      </Text>
    </View>
  );
}

export default function Sobre() {
  return (
    <Screen>
      <PageHeader back eyebrow="Sobre" title="Sobre o Knowball" />
      <Image source={logo} style={styles.logo} contentFit="contain" accessibilityLabel="Knowball" />

      <Text variant="body">
        O Knowball é uma aplicação criada para combater manipulações e fraudes no futebol brasileiro masculino nas
        categorias de base, permitindo denúncias seguras. Essas manipulações podem incluir suborno de árbitros, conluio
        entre equipes, pressão indevida à atletas e acerto de placares. Tal situação ameaça a integridade dos
        campeonatos, reduz a motivação dos jovens atletas e compromete a credibilidade dos clubes.
      </Text>

      <Card style={styles.version}>
        <Text variant="eyebrow">Versão publicada</Text>
        <Row label="Versão" value={version.appVersion} />
        <Row label="Commit" value={version.commitHash} mono />
        <Row label="Build" value={formatInstant(version.buildDate, 'dateTime')} />
      </Card>

      <View style={styles.team}>
        <Text variant="h2">Equipe de desenvolvimento</Text>
        {TEAM.map((m) => (
          <Card key={m.name} style={styles.member}>
            <Avatar name={m.name} photo={m.photo} size={size.avatar} />
            <Text variant="label" style={styles.flex}>
              {m.name}
            </Text>
            <IconLink icon="logo-github" label={`GitHub de ${m.name}`} url={m.github} />
            <IconLink icon="logo-linkedin" label={`LinkedIn de ${m.name}`} url={m.linkedin} />
          </Card>
        ))}
      </View>

      <Text variant="caption" align="center">
        FIAP • Mobile Application Development • 2026
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { width: 123, height: 33 },
  version: { gap: space.sm },
  versionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.md },
  team: { gap: space.md },
  member: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flex: { flex: 1 },
  iconButton: {
    width: size.touch,
    height: size.touch,
    borderRadius: radius.full,
    backgroundColor: ui.fill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPressed: { backgroundColor: colors.cardHover },
});
