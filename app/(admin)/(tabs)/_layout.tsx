import { Tabs } from 'expo-router/js-tabs';
import { ClipboardList, FolderKanban, LayoutDashboard, MessageCircle, User } from 'lucide-react-native';
import { TabBar, type TabItem } from '@/components/ui';

const items: TabItem[] = [
  { name: 'inicio', label: 'Início', icon: LayoutDashboard },
  { name: 'denuncias', label: 'Denúncias', icon: ClipboardList },
  { name: 'cadastros', label: 'Cadastros', icon: FolderKanban },
  { name: 'kiko', label: 'Kiko', icon: MessageCircle },
  { name: 'perfil', label: 'Perfil', icon: User },
];

export const unstable_settings = { anchor: 'inicio' };

export default function AdminTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} items={items} />}>
      <Tabs.Screen name="inicio" />
      <Tabs.Screen name="denuncias" />
      <Tabs.Screen name="cadastros" />
      <Tabs.Screen name="kiko" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}
