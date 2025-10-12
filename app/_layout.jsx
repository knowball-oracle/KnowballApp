import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#ff0000",
        tabBarInactiveTintColor: "#808080",
        tabBarStyle: { backgroundColor: "#ffffff", borderTopWidth: 0.3 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="home-outline" color={focused ? "#d62828" : "#888"} size={size} />
          ),
        }}

      />
      <Tabs.Screen
        name="sobre"
        options={{
          title: "Sobre",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="information" color={focused ? "#d62828" : "#888"} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="protocolo/[protocolo]"
        options={{
          title: "Protocolo",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="receipt-outline" color={focused ? "#d62828" : "#888"} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="denuncia"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="user"
        options={{
          href: null,
        }}
      />

    </Tabs>
  );
}
