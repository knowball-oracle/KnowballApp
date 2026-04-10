import { Text, StyleSheet, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { listarDenuncias } from "../services/reportService";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const { token, userName, isAdmin, fazerLogout } = useAuth();

  const { data: denuncias = [], isLoading } = useQuery({
    queryKey: ["denuncias"],
    queryFn: listarDenuncias,
    enabled: !!token,
  });

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={80} color="#d62828" />
          <Text style={styles.title}>Área Restrita</Text>
          <Text style={styles.subtitle}>
            Faça login para acessar os protocolos
          </Text>
        </View>

        <TouchableOpacity style={styles.botao} onPress={() => router.push("/login")}>
          <Text style={styles.botaoText}>Fazer login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoSecundario} onPress={() => router.push("/register")}>
          <Text style={styles.botaoSecundarioText}>Criar conta</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#d62828" />
          <Text style={{ color: "#ccc", marginTop: 10 }}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={80} color="#d62828" />
        <Text style={styles.title}>Bem-vindo!</Text>
        <Text style={styles.subtitle}>{userName}</Text>
        {isAdmin() && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMINISTRADOR</Text>
          </View>
        )}
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsNumero}>{denuncias.length}</Text>
        <Text style={styles.statsLabel}>Denúncias registradas</Text>
      </View>

      <TouchableOpacity style={styles.botao} onPress={() => router.push("/historico")}>
        <Ionicons name="document-text-outline" size={20} color="#fff" />
        <Text style={styles.botaoText}>Ver protocolos</Text>
      </TouchableOpacity>

      {isAdmin() && (
        <TouchableOpacity style={styles.botao} onPress={() => router.push("/arbitros")}>
          <Ionicons name="people-outline" size={20} color="#fff" />
          <Text style={styles.botaoText}>Gerenciar árbitros</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.botaoLogout} onPress={async () => {
        await fazerLogout();
        Alert.alert("Logout", "Sessão encerrada com sucesso!");
      }}>
        <Ionicons name="log-out-outline" size={20} color="#ff4444" />
        <Text style={styles.botaoLogoutText}>Sair</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#ccc",
    textAlign: "center",
  },
  adminBadge: {
    marginTop: 10,
    backgroundColor: "#d62828",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  adminBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  statsCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#333",
  },
  statsNumero: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#d62828",
  },
  statsLabel: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
  botao: {
    flexDirection: "row",
    backgroundColor: "#d62828",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  botaoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  botaoSecundario: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 12,
  },
  botaoSecundarioText: {
    color: "#888",
    fontWeight: "600",
    fontSize: 16,
  },
  botaoLogout: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#333",
    marginTop: 10,
  },
  botaoLogoutText: {
    color: "#ff4444",
    fontWeight: "600",
    fontSize: 16,
  },
});