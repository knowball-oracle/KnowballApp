import { Tabs } from 'expo-router';
import { FileText, House, MessageCircle, Plus, User } from 'lucide-react-native';
import { TabBar, type TabItem } from '@/components/ui';

const items: TabItem[] = [
  { name: 'inicio', label: 'Início', icon: House },
  // Fase 2: onPress abre /nova-denuncia/partida.
  { name: 'denunciar', label: 'Registrar denúncia', icon: Plus, center: true },
  { name: 'protocolos', label: 'Protocolos', icon: FileText },
  { name: 'kiko', label: 'Kiko', icon: MessageCircle },
  { name: 'perfil', label: 'Perfil', icon: User },
];

export default function UserTabs() {
  return (
    <Tabs initialRouteName="inicio" screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} items={items} />}>
      <Tabs.Screen name="inicio" />
      <Tabs.Screen name="denunciar" />
      <Tabs.Screen name="protocolos" />
      <Tabs.Screen name="kiko" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}
