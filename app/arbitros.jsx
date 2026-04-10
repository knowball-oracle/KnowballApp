import { Text, TextInput, StyleSheet, View, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listarArbitros, criarArbitro, atualizarArbitro, excluirArbitro } from "../services/refereeService";
import { useAuth } from "../context/AuthContext";

export default function Arbitros() {
  const queryClient = useQueryClient();
  const { token, isAdmin } = useAuth();

  const [modalVisivel, setModalVisivel] = useState(false);
  const [arbitroEditando, setArbitroEditando] = useState(null);
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");

  const { data: arbitros = [], isLoading, refetch } = useQuery({
    queryKey: ["arbitros"],
    queryFn: listarArbitros,
    enabled: !!token,
  });

  const mutationCriar = useMutation({
    mutationFn: criarArbitro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arbitros"] });
      fecharModal();
      Alert.alert("Sucesso", "Árbitro criado!");
    },
    onError: () => Alert.alert("Erro", "Falha ao criar árbitro"),
  });

  const mutationAtualizar = useMutation({
    mutationFn: ({ id, dados }) => atualizarArbitro(id, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arbitros"] });
      fecharModal();
      Alert.alert("Sucesso", "Árbitro atualizado!");
    },
    onError: () => Alert.alert("Erro", "Falha ao atualizar árbitro"),
  });

  const mutationExcluir = useMutation({
    mutationFn: excluirArbitro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arbitros"] });
      Alert.alert("Sucesso", "Árbitro excluído!");
    },
    onError: () => Alert.alert("Erro", "Falha ao excluir árbitro"),
  });

  function abrirModalCriar() {
    setArbitroEditando(null);
    setNome("");
    setDataNascimento("");
    setModalVisivel(true);
  }

  function abrirModalEditar(arbitro) {
    setArbitroEditando(arbitro);
    setNome(arbitro.name);
    setDataNascimento(arbitro.birthDate);
    setModalVisivel(true);
  }

  function fecharModal() {
    setModalVisivel(false);
    setArbitroEditando(null);
    setNome("");
    setDataNascimento("");
  }

  function handleSalvar() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Digite o nome do árbitro");
      return;
    }
    if (!dataNascimento.trim()) {
      Alert.alert("Atenção", "Digite a data de nascimento");
      return;
    }

    const dados = {
      name: nome.trim(),
      birthDate: dataNascimento.trim(),
      status: "ACTIVE",
    };

    if (arbitroEditando) {
      mutationAtualizar.mutate({ id: arbitroEditando.id, dados });
    } else {
      mutationCriar.mutate(dados);
    }
  }

  function handleExcluir(id) {
    Alert.alert("Confirmar", "Deseja excluir este árbitro?", [
      { text: "Cancelar" },
      { text: "Excluir", style: "destructive", onPress: () => mutationExcluir.mutate(id) },
    ]);
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.vazio}>
          <Ionicons name="lock-closed-outline" size={60} color="#444" />
          <Text style={styles.vazioText}>Faça login para acessar esta área</Text>
          <TouchableOpacity style={styles.botaoPrimario} onPress={() => router.push("/login")}>
            <Text style={styles.botaoPrimarioText}>Fazer login</Text>
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
          <Text style={{ color: "#ccc", marginTop: 10 }}>Carregando árbitros...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Árbitros</Text>
        <Text style={styles.subtitle}>{arbitros.length} cadastrado(s)</Text>
      </View>

      {isAdmin() && (
        <TouchableOpacity style={styles.botaoAdicionar} onPress={abrirModalCriar}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.botaoAdicionarText}>Novo árbitro</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={arbitros}
        keyExtractor={(item) => item.id.toString()}
        refreshing={isLoading}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.nomeArbitro}>{item.name}</Text>
                <Text style={styles.infoArbitro}>Nascimento: {item.birthDate}</Text>
                <Text style={styles.infoArbitro}>Status: {item.status}</Text>
              </View>
              {isAdmin() && (
                <View style={styles.acoes}>
                  <TouchableOpacity onPress={() => abrirModalEditar(item)} style={styles.botaoEditar}>
                    <Ionicons name="pencil-outline" size={20} color="#d62828" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleExcluir(item.id)} style={styles.botaoEditar}>
                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={styles.lista}
      />

      <Modal visible={modalVisivel} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {arbitroEditando ? "Editar Árbitro" : "Novo Árbitro"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do árbitro"
              placeholderTextColor="#555"
              value={nome}
              onChangeText={setNome}
            />

            <TextInput
              style={styles.input}
              placeholder="Data de nascimento (AAAA-MM-DD)"
              placeholderTextColor="#555"
              value={dataNascimento}
              onChangeText={setDataNascimento}
            />

            <TouchableOpacity
              style={styles.botaoPrimario}
              onPress={handleSalvar}
              disabled={mutationCriar.isPending || mutationAtualizar.isPending}
            >
              {mutationCriar.isPending || mutationAtualizar.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botaoPrimarioText}>
                  {arbitroEditando ? "Salvar alterações" : "Criar árbitro"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoCancelar} onPress={fecharModal}>
              <Text style={styles.botaoCancelarText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  botaoAdicionar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d62828",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 10,
  },
  botaoAdicionarText: {
    color: "#fff",
    fontWeight: "600",
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
    alignItems: "center",
  },
  nomeArbitro: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  infoArbitro: {
    fontSize: 13,
    color: "#888",
    marginBottom: 3,
  },
  acoes: {
    flexDirection: "row",
    gap: 10,
  },
  botaoEditar: {
    padding: 5,
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
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 24,
  },
  modalContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#111",
    color: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333",
    fontSize: 15,
  },
  botaoPrimario: {
    backgroundColor: "#d62828",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  botaoPrimarioText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  botaoCancelar: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  botaoCancelarText: {
    color: "#888",
    fontWeight: "600",
  },
});