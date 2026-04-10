import { Text, TextInput, StyleSheet, View, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { criarDenuncia } from "../services/reportService";
import { listarPartidas } from "../services/gameService";
import { listarArbitros } from "../services/refereeService";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Denuncia() {
  const { token, userName } = useAuth();
  const { cores } = useTheme();
  const queryClient = useQueryClient();

  const [gameId, setGameId] = useState(null);
  const [refereeId, setRefereeId] = useState(null);
  const [relato, setRelato] = useState("");
  const protocolo = Math.floor(100000 + Math.random() * 900000).toString();

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
        params: { nome: userName, protocolo: data.protocol || protocolo },
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
      <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
        <View style={styles.vazio}>
          <Text style={[styles.vazioText, { color: cores.textoSecundario }]}>
            Faça login para enviar uma denúncia
          </Text>
          <TouchableOpacity
            style={[styles.botao, { backgroundColor: cores.primario }]}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.botaoText}>Fazer login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loadingPartidas || loadingArbitros) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={cores.primario} />
          <Text style={{ color: cores.textoSecundario, marginTop: 10 }}>Carregando dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: cores.texto }]}>Formulário de Denúncia</Text>
        <Text style={[styles.usuario, { color: cores.textoMuted }]}>Denunciante: {userName}</Text>

        <Text style={[styles.label, { color: cores.textoSecundario }]}>Selecione a partida:</Text>
        {partidas.length === 0 ? (
          <Text style={{ color: cores.textoMuted, marginBottom: 20 }}>Nenhuma partida cadastrada</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollHorizontal}>
            {partidas.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.chipBotao,
                  { backgroundColor: cores.fundoCard, borderColor: cores.borda },
                  gameId === p.id && { backgroundColor: cores.primario, borderColor: cores.primario },
                ]}
                onPress={() => setGameId(p.id)}
              >
                <Text style={[styles.chipTexto, { color: cores.texto }]}>
                  {p.place} — {p.championship?.category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Text style={[styles.label, { color: cores.textoSecundario }]}>Selecione o árbitro:</Text>
        {arbitros.length === 0 ? (
          <Text style={{ color: cores.textoMuted, marginBottom: 20 }}>Nenhum árbitro cadastrado</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollHorizontal}>
            {arbitros.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={[
                  styles.chipBotao,
                  { backgroundColor: cores.fundoCard, borderColor: cores.borda },
                  refereeId === a.id && { backgroundColor: cores.primario, borderColor: cores.primario },
                ]}
                onPress={() => setRefereeId(a.id)}
              >
                <Text style={[styles.chipTexto, { color: cores.texto }]}>{a.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <TextInput
          style={[styles.input, { backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }]}
          placeholder="Relato da denúncia (mínimo 20 caracteres)"
          placeholderTextColor={cores.textoMuted}
          value={relato}
          onChangeText={setRelato}
          multiline
          textAlignVertical="top"
        />
        <Text style={[styles.contador, { color: cores.textoMuted }]}>{relato.length} caracteres</Text>

        <TouchableOpacity
          onPress={handleSalvar}
          style={[styles.botao, { backgroundColor: cores.primario }]}
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
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  usuario: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    marginTop: 10,
  },
  scrollHorizontal: {
    marginBottom: 20,
  },
  chipBotao: {
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
  },
  chipTexto: {
    fontWeight: "bold",
    fontSize: 13,
  },
  input: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 5,
    borderWidth: 1,
    height: 120,
  },
  contador: {
    fontSize: 12,
    textAlign: "right",
    marginBottom: 15,
  },
  botao: {
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
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
  },
});