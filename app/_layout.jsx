import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import QueryProvider from "../providers/QueryProvider";

function TabsComTema() {
  const { cores, tema, alternarTema } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#d62828",
        tabBarInactiveTintColor: cores.textoMuted,
        tabBarStyle: {
          backgroundColor: cores.tabBar,
          borderTopWidth: 1,
          borderTopColor: cores.borda,
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
              color={focused ? "#d62828" : cores.textoMuted}
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
              color={focused ? "#d62828" : cores.textoMuted}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="arbitros"
        options={{
          title: "Árbitros",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              color={focused ? "#d62828" : cores.textoMuted}
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
              color={focused ? "#d62828" : cores.textoMuted}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen name="denuncia" options={{ href: null }} />
      <Tabs.Screen name="user" options={{ href: null }} />
      <Tabs.Screen name="historico" options={{ href: null }} />
      <Tabs.Screen name="login" options={{ href: null }} />
      <Tabs.Screen name="register" options={{ href: null }} />
      <Tabs.Screen name="arbitros" options={{ href: null }} />
      <Tabs.Screen name="apex" options={{ href: null }} />
    </Tabs>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryProvider>
          <TabsComTema />
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}