import { Text, StyleSheet, View, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listarDenuncias, atualizarStatusDenuncia } from "../services/reportService";
import { useAuth } from "../context/AuthContext";

export default function Historico() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  const { data: denuncias = [], isLoading, refetch } = useQuery({
    queryKey: ["denuncias"],
    queryFn: listarDenuncias,
    enabled: !!token,
  });

  const mutationStatus = useMutation({
    mutationFn: ({ id, status }) => atualizarStatusDenuncia(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["denuncias"] });
      Alert.alert("Sucesso", "Status atualizado!");
    },
    onError: () => {
      Alert.alert("Erro", "Falha ao atualizar status");
    },
  });

  function handleAtualizarStatus(id, statusAtual) {
    const novoStatus =
      statusAtual === "NEW"
        ? "UNDER_ANALYSIS"
        : statusAtual === "UNDER_ANALYSIS"
        ? "RESOLVED"
        : "NEW";

    Alert.alert("Atualizar Status", `Mudar para: ${novoStatus}?`, [
      { text: "Cancelar" },
      { text: "Confirmar", onPress: () => mutationStatus.mutate({ id, novoStatus }) },
    ]);
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.vazio}>
          <Ionicons name="lock-closed-outline" size={60} color="#444" />
          <Text style={styles.vazioText}>Faça login para ver os protocolos</Text>
          <TouchableOpacity style={styles.botaoNovo} onPress={() => router.push("/login")}>
            <Text style={styles.botaoNovoText}>Fazer login</Text>
          </TouchableOpacity>
        </View>
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
        <Text style={styles.title}>Histórico de Protocolos</Text>
        <Text style={styles.subtitle}>{denuncias.length} denúncia(s)</Text>
      </View>

      {denuncias.length === 0 ? (
        <View style={styles.vazio}>
          <Ionicons name="document-text-outline" size={60} color="#444" />
          <Text style={styles.vazioText}>Nenhuma denúncia registrada</Text>
          <TouchableOpacity style={styles.botaoNovo} onPress={() => router.push("/")}>
            <Text style={styles.botaoNovoText}>Fazer nova denúncia</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={denuncias}
          keyExtractor={(item) => item.id.toString()}
          refreshing={isLoading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.protocolo}>#{item.protocol}</Text>
                  <Text style={styles.categoria}>{item.game?.championship?.category}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <Text style={styles.info}>Partida: {item.game?.place}</Text>
              <Text style={styles.info}>Data: {item.date}</Text>
              <Text style={styles.info}>Árbitro: {item.referee?.name}</Text>

              <TouchableOpacity
                style={styles.botaoStatus}
                onPress={() => handleAtualizarStatus(item.id, item.status)}
                disabled={mutationStatus.isPending}
              >
                <Text style={styles.botaoStatusText}>Atualizar status</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoVer}
                onPress={() => Alert.alert("Relato Completo", item.content)}
              >
                <Text style={styles.botaoVerText}>Ver relato completo</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.lista}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
  lista: {
    padding: 20,
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  protocolo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#d62828",
  },
  categoria: {
    fontSize: 14,
    color: "#fff",
    marginTop: 5,
  },
  statusBadge: {
    backgroundColor: "#333",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    justifyContent: "center",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  info: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 5,
  },
  botaoStatus: {
    marginTop: 10,
    backgroundColor: "#d62828",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoStatusText: {
    color: "#fff",
    fontWeight: "600",
  },
  botaoVer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  botaoVerText: {
    color: "#d62828",
    fontWeight: "600",
  },
  vazio: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  vazioText: {
    color: "#ccc",
    fontSize: 16,
    marginTop: 20,
    marginBottom: 30,
  },
  botaoNovo: {
    backgroundColor: "#d62828",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  botaoNovoText: {
    color: "#fff",
    fontWeight: "bold",
  },
});