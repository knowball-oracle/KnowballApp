import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#d62828",
        tabBarInactiveTintColor: "#808080",
        tabBarStyle: { 
          backgroundColor: "#1a1a1a", 
          borderTopWidth: 1,
          borderTopColor: "#333",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              color={focused ? "#d62828" : "#888"} 
              size={size} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="auth"
        options={{
          title: "Protocolos",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons 
              name={focused ? "shield-checkmark" : "shield-checkmark-outline"} 
              color={focused ? "#d62828" : "#888"} 
              size={size} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="sobre"
        options={{
          title: "Sobre",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons 
              name={focused ? "information-circle" : "information-circle-outline"} 
              color={focused ? "#d62828" : "#888"} 
              size={size} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="protocolo/[protocolo]"
        options={{
          href: null,
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

      <Tabs.Screen
        name="historico"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}