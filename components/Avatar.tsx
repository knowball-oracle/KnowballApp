import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { colors, radius, ui } from '@/theme/tokens';
import { initials } from '@/utils/text';

/** Foto redonda (data URL, URL https ou asset) ou iniciais. */
export function Avatar({ name, photo, size = 56 }: { name: string; photo?: string | number | null; size?: number }) {
  const box = { width: size, height: size, borderRadius: radius.full };
  if (photo) {
    return (
      <Image
        source={typeof photo === 'number' ? photo : { uri: photo }}
        style={[box, styles.border]}
        contentFit="cover"
        accessibilityLabel={`Foto de ${name}`}
      />
    );
  }
  return (
    <View style={[box, styles.border, styles.initials]} accessibilityLabel={name}>
      <Text variant={size >= 72 ? 'h2' : 'label'}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  border: { borderWidth: 1, borderColor: colors.borderStrong },
  initials: { backgroundColor: ui.fill, alignItems: 'center', justifyContent: 'center' },
});
