import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, size, space, ui } from '@/theme/tokens';
import { Text } from './Text';

export interface TabItem {
  /** Nome da rota no grupo (tabs), ex.: "index", "protocolos". */
  name: string;
  label: string;
  icon: LucideIcon;
  /** Botão branco circular elevado (aba "Denunciar" do USER). */
  center?: boolean;
  /** Em vez de trocar de aba, executa esta ação (ex.: abrir o fluxo de nova denúncia). */
  onPress?: () => void;
}

export interface TabBarProps extends BottomTabBarProps {
  items: TabItem[];
}

/** Distância da tab bar até a base da tela: o safe area (ou 16 em aparelhos sem ele). */
export function tabBarBottom(insetBottom: number): number {
  return insetBottom > 0 ? insetBottom : space.lg;
}

/**
 * Tab bar flutuante: margem lateral 16, raio 24, blur sobre rgba(10,10,10,0.8)
 * e borda rgba(255,255,255,0.07). Ativo branco, inativo textMuted. Sem vermelho.
 */
export function TabBar({ state, emitter, navigateToTab, items }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { bottom: tabBarBottom(insets.bottom) }]}>
      {/* O fundo recorta o blur no raio; a barra em si não recorta, para o botão central sobressair. */}
      <View style={styles.background} pointerEvents="none">
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.tint]} />
      </View>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const item = items.find((i) => i.name === route.name);
          if (!item) return null;
          const focused = state.index === index;
          const Icon = item.icon;

          const onPress = () => {
            void Haptics.selectionAsync();
            if (item.onPress) {
              item.onPress();
              return;
            }
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };

          if (item.center) {
            return (
              <View key={route.key} style={styles.item}>
                <Pressable
                  onPress={onPress}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  style={({ pressed }) => [styles.center, pressed && styles.centerPressed]}
                >
                  <Icon size={22} color={colors.onPrimary} strokeWidth={2.5} />
                </Pressable>
              </View>
            );
          }

          const color = focused ? colors.textStrong : colors.textMuted;
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={item.label}
              style={styles.item}
            >
              <Icon size={22} color={color} strokeWidth={focused ? 2.25 : 1.75} />
              <Text variant="caption" color={color} numberOfLines={1} style={styles.label} maxFontSizeMultiplier={1.2}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    height: size.tabBar,
    borderRadius: radius.xl,
    overflow: 'visible',
    shadowColor: ui.shadow,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: ui.tabBarBorder,
    overflow: 'hidden',
  },
  tint: { backgroundColor: ui.tabBar },
  row: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.sm },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, minHeight: size.touch },
  label: { fontSize: 11, lineHeight: 14 },
  center: {
    width: size.tabCenter,
    height: size.tabCenter,
    borderRadius: radius.full,
    backgroundColor: ui.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -space.xl,
    shadowColor: ui.shadow,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  centerPressed: { transform: [{ scale: 0.96 }] },
});
