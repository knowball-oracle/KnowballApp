import { Text, TextInput, StyleSheet, View, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { criarDenuncia } from "../services/reportService";
import { listarPartidas } from "../services/gameService";
import { listarArbitros } from "../services/refereeService";
import { useAuth } from "../context/AuthContext";

export default function Denuncia() {
  const { nome, email } = useLocalSearchParams();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [gameId, setGameId] = useState(null);
  const [refereeId, setRefereeId] = useState(null);
  const [relato, setRelato] = useState("");
  const [protocolo] = useState(Math.floor(100000 + Math.random() * 900000).toString());

  const { data: partidas = [], isLoading: loadingPartidas } = useQuery({
    queryKey: ["partidas"],
    queryFn: listarPartidas,
    enabled: !!token,
  });

  const { data: arbitros = [], isLoading: loadingArbitros } = useQuery({
    queryKey: ["arbitros"],
    queryFn: listarArbitros,
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: criarDenuncia,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["denuncias"] });
      router.push({
        pathname: "/user",
        params: { nome, protocolo: data.protocol || protocolo },
      });
    },
    onError: () => {
      Alert.alert("Erro", "Falha ao enviar a denúncia.");
    },
  });

  function handleSalvar() {
    if (!gameId) {
      Alert.alert("Atenção", "Selecione uma partida");
      return;
    }
    if (!refereeId) {
      Alert.alert("Atenção", "Selecione um árbitro");
      return;
    }
    if (!relato.trim() || relato.trim().length < 20) {
      Alert.alert("Atenção", "Relato deve ter pelo menos 20 caracteres");
      return;
    }

    mutation.mutate({
      game: { id: gameId },
      referee: { id: refereeId },
      protocol: protocolo,
      content: relato.trim(),
      date: new Date().toISOString().split("T")[0],
      status: "NEW",
      analysisResult: "PENDING",
    });
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.vazio}>
          <Text style={styles.vazioText}>Faça login para enviar uma denúncia</Text>
          <TouchableOpacity style={styles.botao} onPress={() => router.push("/login")}>
            <Text style={styles.botaoText}>Fazer login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loadingPartidas || loadingArbitros) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#d62828" />
          <Text style={{ color: "#ccc", marginTop: 10 }}>Carregando dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Formulário de Denúncia</Text>
        <Text style={styles.usuario}>Denunciante: {nome}</Text>

        <Text style={styles.label}>Selecione a partida:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollHorizontal}>
          {partidas.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.chipBotao, gameId === p.id && styles.chipSelecionado]}
              onPress={() => setGameId(p.id)}
            >
              <Text style={styles.chipTexto}>{p.place} — {p.championship?.category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Selecione o árbitro:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollHorizontal}>
          {arbitros.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={[styles.chipBotao, refereeId === a.id && styles.chipSelecionado]}
              onPress={() => setRefereeId(a.id)}
            >
              <Text style={styles.chipTexto}>{a.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TextInput
          style={[styles.input, { height: 120 }]}
          placeholder="Relato da denúncia (mínimo 20 caracteres)"
          placeholderTextColor="#888"
          value={relato}
          onChangeText={setRelato}
          multiline
          textAlignVertical="top"
        />
        <Text style={styles.contador}>{relato.length} caracteres</Text>

        <TouchableOpacity
          onPress={handleSalvar}
          style={styles.botao}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoText}>Enviar denúncia</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#111",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
    textAlign: "center",
  },
  usuario: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 10,
    marginTop: 10,
  },
  scrollHorizontal: {
    marginBottom: 20,
  },
  chipBotao: {
    backgroundColor: "#1a1a1a",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  chipSelecionado: {
    backgroundColor: "#d62828",
    borderColor: "#d62828",
  },
  chipTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  input: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#333",
  },
  contador: {
    color: "#666",
    fontSize: 12,
    textAlign: "right",
    marginBottom: 15,
  },
  botao: {
    backgroundColor: "#d62828",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  botaoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
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
    marginBottom: 30,
    textAlign: "center",
  },
});