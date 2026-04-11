import {
  Text,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listarDenuncias,
  atualizarStatusDenuncia,
  excluirDenuncia,
} from "../services/reportService";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Historico() {
  const queryClient = useQueryClient();
  const { token, isAdmin } = useAuth();
  const { cores } = useTheme();

  const {
    data: denuncias = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["denuncias"],
    queryFn: listarDenuncias,
    enabled: !!token,
  });

  const mStatus = useMutation({
    mutationFn: ({ id, status }) => atualizarStatusDenuncia(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["denuncias"] });
      Alert.alert("Sucesso", "Status atualizado!");
    },
    onError: () => Alert.alert("Erro", "Falha ao atualizar status"),
  });

  const mExcluir = useMutation({
    mutationFn: excluirDenuncia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["denuncias"] });
      Alert.alert("Sucesso", "Denúncia excluída!");
    },
    onError: () => Alert.alert("Erro", "Falha ao excluir denúncia"),
  });

  function atualizarStatus(id, atual) {
    const novo =
      atual === "NEW"
        ? "UNDER_ANALYSIS"
        : atual === "UNDER_ANALYSIS"
          ? "RESOLVED"
          : "NEW";
    Alert.alert("Atualizar Status", `Mudar para: ${novo}?`, [
      { text: "Cancelar" },
      {
        text: "Confirmar",
        onPress: () => mStatus.mutate({ id, status: novo }),
      },
    ]);
  }

  function confirmarExcluir(id, protocolo) {
    Alert.alert("Excluir denúncia", `Remover o protocolo ${protocolo}?`, [
      { text: "Cancelar" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => mExcluir.mutate(id),
      },
    ]);
  }

  if (!token) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: cores.fundo }]}
      >
        <View style={styles.center}>
          <Ionicons
            name="lock-closed-outline"
            size={60}
            color={cores.textoMuted}
          />
          <Text
            style={{
              color: cores.textoSecundario,
              marginTop: 20,
              marginBottom: 20,
            }}
          >
            Faça login para ver os protocolos
          </Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: cores.primario }]}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.btnText}>Fazer login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: cores.fundo }]}
      >
        <View style={styles.center}>
          <ActivityIndicator size="large" color={cores.primario} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: cores.texto }]}>
          Histórico de Protocolos
        </Text>
        <Text style={{ color: cores.textoMuted, fontSize: 13 }}>
          {denuncias.length} denúncia(s)
        </Text>
      </View>

      {denuncias.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name="document-text-outline"
            size={60}
            color={cores.textoMuted}
          />
          <Text style={{ color: cores.textoSecundario, marginTop: 20 }}>
            Nenhuma denúncia registrada
          </Text>
        </View>
      ) : (
        <FlatList
          data={denuncias}
          keyExtractor={(i) => i.id.toString()}
          refreshing={isLoading}
          onRefresh={refetch}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                { backgroundColor: cores.fundoCard, borderColor: cores.borda },
              ]}
            >
              <View
                style={[styles.cardHeader, { borderBottomColor: cores.borda }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.protocolo, { color: cores.primario }]}>
                    #{item.protocol}
                  </Text>
                  <Text
                    style={{ color: cores.texto, fontSize: 13, marginTop: 4 }}
                  >
                    {item.game?.championship?.category}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: cores.input }]}>
                  <Text
                    style={{
                      color: cores.texto,
                      fontSize: 11,
                      fontWeight: "600",
                    }}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text style={[styles.info, { color: cores.textoSecundario }]}>
                Partida: {item.game?.place}
              </Text>
              <Text style={[styles.info, { color: cores.textoSecundario }]}>
                Data: {item.date}
              </Text>
              <Text style={[styles.info, { color: cores.textoSecundario }]}>
                Árbitro: {item.referee?.name}
              </Text>

              {isAdmin() && (
                <TouchableOpacity
                  style={[
                    styles.btn,
                    { backgroundColor: cores.primario, marginTop: 12 },
                  ]}
                  onPress={() => atualizarStatus(item.id, item.status)}
                >
                  <Text style={styles.btnText}>Atualizar status</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={{
                  marginTop: 8,
                  paddingTop: 8,
                  borderTopWidth: 1,
                  borderTopColor: cores.borda,
                }}
                onPress={() => Alert.alert("Relato Completo", item.content)}
              >
                <Text style={{ color: cores.primario, fontWeight: "600" }}>
                  Ver relato completo
                </Text>
              </TouchableOpacity>

              {isAdmin() && (
                <TouchableOpacity
                  style={{ marginTop: 8 }}
                  onPress={() => confirmarExcluir(item.id, item.protocol)}
                >
                  <Text style={{ color: "#ff4444", fontWeight: "600" }}>
                    Excluir denúncia
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  card: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  protocolo: {
    fontSize: 17,
    fontWeight: "bold",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  info: {
    fontSize: 13,
    marginBottom: 4,
  },
  btn: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
