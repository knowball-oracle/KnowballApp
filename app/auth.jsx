import { Text, StyleSheet, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { listarDenuncias } from "../services/reportService";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Auth() {
  const { token, userName, isAdmin, fazerLogout } = useAuth();
  const { cores } = useTheme();

  const { data: denuncias = [], isLoading } = useQuery({
    queryKey: ["denuncias"],
    queryFn: listarDenuncias,
    enabled: !!token,
  });

  if (!token) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={80} color={cores.primario} />
          <Text style={[styles.title, { color: cores.texto }]}>Área Restrita</Text>
          <Text style={[styles.subtitle, { color: cores.textoSecundario }]}>
            Faça login para acessar os protocolos
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.botao, { backgroundColor: cores.primario }]}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.botaoText}>Fazer login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoSecundario, { borderColor: cores.borda }]}
          onPress={() => router.push("/register")}
        >
          <Text style={[styles.botaoSecundarioText, { color: cores.textoMuted }]}>
            Criar conta
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={cores.primario} />
          <Text style={{ color: cores.textoSecundario, marginTop: 10 }}>
            Carregando...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={80} color={cores.primario} />
        <Text style={[styles.title, { color: cores.texto }]}>Bem-vindo!</Text>
        <Text style={[styles.subtitle, { color: cores.textoSecundario }]}>{userName}</Text>
        {isAdmin() && (
          <View style={[styles.adminBadge, { backgroundColor: cores.primario }]}>
            <Text style={styles.adminBadgeText}>ADMINISTRADOR</Text>
          </View>
        )}
      </View>

      <View style={[styles.statsCard, { backgroundColor: cores.fundoCard, borderColor: cores.borda }]}>
        <Text style={[styles.statsNumero, { color: cores.primario }]}>{denuncias.length}</Text>
        <Text style={[styles.statsLabel, { color: cores.textoMuted }]}>
          Denúncias registradas
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: cores.primario }]}
        onPress={() => router.push("/historico")}
      >
        <Ionicons name="document-text-outline" size={20} color="#fff" />
        <Text style={styles.botaoText}>Ver protocolos</Text>
      </TouchableOpacity>

      {isAdmin() && (
        <TouchableOpacity
          style={[styles.botao, { backgroundColor: cores.primario }]}
          onPress={() => router.push("/arbitros")}
        >
          <Ionicons name="people-outline" size={20} color="#fff" />
          <Text style={styles.botaoText}>Gerenciar árbitros</Text>
        </TouchableOpacity>
      )}

      {isAdmin() && (
        <TouchableOpacity
          style={[styles.botao, { backgroundColor: cores.primario }]}
          onPress={() => router.push("/campeonatos")}
        >
          <Ionicons name="trophy-outline" size={20} color="#fff" />
          <Text style={styles.botaoText}>Gerenciar campeonatos</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.botaoLogout, { borderColor: cores.borda }]}
        onPress={async () => {
          await fazerLogout();
          Alert.alert("Logout", "Sessão encerrada com sucesso!");
        }}
      >
        <Ionicons name="log-out-outline" size={20} color="#ff4444" />
        <Text style={styles.botaoLogoutText}>Sair</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
  },
  adminBadge: {
    marginTop: 10,
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
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
  },
  statsNumero: {
    fontSize: 48,
    fontWeight: "bold",
  },
  statsLabel: {
    fontSize: 14,
    marginTop: 5,
  },
  botao: {
    flexDirection: "row",
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
    marginBottom: 12,
  },
  botaoSecundarioText: {
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
    marginTop: 10,
  },
  botaoLogoutText: {
    color: "#ff4444",
    fontWeight: "600",
    fontSize: 16,
  },
});