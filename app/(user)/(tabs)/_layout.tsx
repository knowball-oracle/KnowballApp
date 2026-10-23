import { router } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { FileText, House, MessageCircle, Plus, User } from 'lucide-react-native';
import { TabBar, type TabItem } from '@/components/ui';
import { useReportStatusWatcher } from '@/hooks/useReportStatusWatcher';

const items: TabItem[] = [
  { name: 'inicio', label: 'Início', icon: House },
  { name: 'protocolos', label: 'Protocolos', icon: FileText },
  {
    name: 'denunciar',
    label: 'Registrar denúncia',
    icon: Plus,
    center: true,
    onPress: () => router.push('/(user)/nova-denuncia/partida'),
  },
  { name: 'kiko', label: 'Kiko', icon: MessageCircle },
  { name: 'perfil', label: 'Perfil', icon: User },
];

export default function UserTabs() {
  useReportStatusWatcher();
  return (
    <Tabs initialRouteName="inicio" screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} items={items} />}>
      <Tabs.Screen name="inicio" />
      <Tabs.Screen name="protocolos" />
      <Tabs.Screen name="denunciar" />
      <Tabs.Screen name="kiko" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}
