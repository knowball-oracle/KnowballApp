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

/** Tab bar com blur sobre rgba(10,10,10,0.8). Ativo branco, inativo textMuted. Sem vermelho. */
export function TabBar({ state, navigation, items }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom, height: size.tabBar + insets.bottom }]}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.tint]} />
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
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
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
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: ui.tabBarBorder,
    overflow: 'visible',
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
