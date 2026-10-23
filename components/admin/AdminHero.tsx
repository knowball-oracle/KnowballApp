import type { ImageSource } from 'expo-image';
import { router } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { GlassPill, Hero } from '@/components/ui';

export interface AdminHeroProps {
  image: ImageSource | number;
  eyebrow: string;
  title: string;
  titleLight: string;
  description?: string;
  /** Rótulo do "+ Novo" (ex.: "Novo árbitro"). */
  newLabel?: string;
  onNew?: () => void;
  imageAccessibilityLabel?: string;
}

/** Hero das listas do admin: voltar à esquerda e "+ Novo" à direita, sobre a foto. */
export function AdminHero({ newLabel = 'Novo', onNew, ...hero }: AdminHeroProps) {
  return (
    <Hero
      {...hero}
      height={260}
      topLeft={
        <GlassPill
          icon={ArrowLeft}
          accessibilityLabel="Voltar"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(admin)/(tabs)/cadastros'))}
        />
      }
      topRight={onNew ? <GlassPill icon={Plus} label={newLabel} onPress={onNew} /> : undefined}
    />
  );
}
