import { Text } from '@/components/ui';
import { colors } from '@/theme/tokens';
import { fonts } from '@/theme/typography';

/** Markdown mínimo do Kiko: **negrito**, *itálico* (como peso) e `código`. Quebras de linha são preservadas. */
export function RichText({ text, color = colors.text }: { text: string; color?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g).filter(Boolean);
  return (
    <Text variant="body" color={color} selectable>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <Text key={i} variant="body" color={colors.textStrong} style={{ fontFamily: fonts.bold }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return (
            <Text key={i} variant="body" color={colors.accentSoft} style={{ fontFamily: fonts.semibold }}>
              {part.slice(1, -1)}
            </Text>
          );
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
          return (
            <Text key={i} variant="body" color={color} style={{ fontFamily: fonts.medium }}>
              {part.slice(1, -1)}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
}
