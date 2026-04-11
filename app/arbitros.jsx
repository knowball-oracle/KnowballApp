import { Text, TextInput, StyleSheet, View, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listarArbitros, criarArbitro, atualizarArbitro, excluirArbitro } from "../services/refereeService";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const STATUS_OPCOES = ["ACTIVE", "SUSPENDED", "INACTIVE"];

export default function Arbitros() {
  const queryClient = useQueryClient();
  const { token, isAdmin } = useAuth();
  const { cores } = useTheme();

  const [modalVisivel, setModalVisivel] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  const { data: arbitros = [], isLoading, refetch } = useQuery({
    queryKey: ["arbitros"],
    queryFn: listarArbitros,
    enabled: !!token,
  });

  const mCriar = useMutation({
    mutationFn: criarArbitro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arbitros"] });
      fechar();
      Alert.alert("Sucesso", "Árbitro criado!");
    },
    onError: () => Alert.alert("Erro", "Falha ao criar árbitro"),
  });

  const mAtualizar = useMutation({
    mutationFn: ({ id, dados }) => atualizarArbitro(id, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arbitros"] });
      fechar();
      Alert.alert("Sucesso", "Árbitro atualizado!");
    },
    onError: () => Alert.alert("Erro", "Falha ao atualizar árbitro"),
  });

  const mExcluir = useMutation({
    mutationFn: excluirArbitro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arbitros"] });
      Alert.alert("Sucesso", "Árbitro excluído!");
    },
    onError: () => Alert.alert("Erro", "Falha ao excluir árbitro"),
  });

  function abrirCriar() {
    setEditando(null);
    setNome("");
    setDataNascimento("");
    setStatus("ACTIVE");
    setModalVisivel(true);
  }

  function abrirEditar(a) {
    setEditando(a);
    setNome(a.name);
    setDataNascimento(a.birthDate);
    setStatus(a.status || "ACTIVE");
    setModalVisivel(true);
  }

  function fechar() {
    setModalVisivel(false);
    setEditando(null);
    setNome("");
    setDataNascimento("");
    setStatus("ACTIVE");
  }

  function salvar() {
    if (!nome.trim()) return Alert.alert("Atenção", "Digite o nome do árbitro");
    if (!dataNascimento.trim()) return Alert.alert("Atenção", "Digite a data de nascimento");

    const dados = {
      name: nome.trim(),
      birthDate: dataNascimento.trim(),
      status: status,
    };

    if (editando) {
      mAtualizar.mutate({ id: editando.id, dados });
    } else {
      mCriar.mutate(dados);
    }
  }

  function excluir(id) {
    Alert.alert("Confirmar", "Deseja excluir este árbitro?", [
      { text: "Cancelar" },
      { text: "Excluir", style: "destructive", onPress: () => mExcluir.mutate(id) },
    ]);
  }

  function getCorStatus(s) {
    if (s === "ACTIVE") return "#2a9d8f";
    if (s === "SUSPENDED") return "#f4a261";
    return "#888";
  }

  if (!token) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={60} color={cores.textoMuted} />
          <Text style={[styles.aviso, { color: cores.textoSecundario }]}>
            Faça login para acessar esta área
          </Text>
          <TouchableOpacity
            style={[styles.btnPrim, { backgroundColor: cores.primario }]}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.btnPrimText}>Fazer login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={cores.primario} />
          <Text style={{ color: cores.textoMuted, marginTop: 10 }}>
            Carregando árbitros...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: cores.texto }]}>Árbitros</Text>
        <Text style={[styles.subtitle, { color: cores.textoMuted }]}>
          {arbitros.length} cadastrado(s)
        </Text>
      </View>

      {isAdmin() && (
        <TouchableOpacity
          style={[styles.btnAdd, { backgroundColor: cores.primario }]}
          onPress={abrirCriar}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.btnAddText}>Novo árbitro</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={arbitros}
        keyExtractor={(item) => item.id.toString()}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: cores.fundoCard, borderColor: cores.borda }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.nomeArbitro, { color: cores.texto }]}>
                {item.name}
              </Text>
              <Text style={[styles.infoArbitro, { color: cores.textoMuted }]}>
                Nascimento: {item.birthDate}
              </Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusBadge, { backgroundColor: getCorStatus(item.status) }]}>
                  <Text style={styles.statusBadgeText}>{item.status}</Text>
                </View>
              </View>
            </View>
            {isAdmin() && (
              <View style={styles.acoes}>
                <TouchableOpacity onPress={() => abrirEditar(item)}>
                  <Ionicons name="pencil-outline" size={22} color={cores.primario} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => excluir(item.id)}>
                  <Ionicons name="trash-outline" size={22} color="#ff4444" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      <Modal visible={modalVisivel} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: cores.fundoCard }]}>
            <Text style={[styles.modalTitle, { color: cores.texto }]}>
              {editando ? "Editar Árbitro" : "Novo Árbitro"}
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }]}
              placeholder="Nome do árbitro"
              placeholderTextColor={cores.textoMuted}
              value={nome}
              onChangeText={setNome}
            />

            <TextInput
              style={[styles.input, { backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }]}
              placeholder="Data de nascimento (AAAA-MM-DD)"
              placeholderTextColor={cores.textoMuted}
              value={dataNascimento}
              onChangeText={setDataNascimento}
            />

            <Text style={[styles.label, { color: cores.textoSecundario }]}>Status:</Text>
            <View style={styles.statusOpcoes}>
              {STATUS_OPCOES.map((s) => {
                const ativo = status === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.chipStatus,
                      { backgroundColor: cores.input, borderColor: cores.borda },
                      ativo && { backgroundColor: getCorStatus(s), borderColor: getCorStatus(s) },
                    ]}
                    onPress={() => setStatus(s)}
                  >
                    <Text style={[styles.chipStatusText, { color: ativo ? "#fff" : cores.texto }]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.btnPrim, { backgroundColor: cores.primario }]}
              onPress={salvar}
              disabled={mCriar.isPending || mAtualizar.isPending}
            >
              {mCriar.isPending || mAtualizar.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimText}>
                  {editando ? "Salvar alterações" : "Criar árbitro"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnCancel, { borderColor: cores.borda }]}
              onPress={fechar}
            >
              <Text style={[styles.btnCancelText, { color: cores.textoMuted }]}>
                Cancelar
              </Text>
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
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  aviso: {
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  btnAdd: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 10,
  },
  btnAddText: {
    color: "#fff",
    fontWeight: "600",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
  },
  nomeArbitro: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  infoArbitro: {
    fontSize: 13,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  acoes: {
    flexDirection: "row",
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 24,
  },
  modalBox: {
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    fontSize: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "600",
  },
  statusOpcoes: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  chipStatus: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipStatusText: {
    fontWeight: "600",
    fontSize: 12,
  },
  btnPrim: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  btnPrimText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  btnCancel: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  btnCancelText: {
    fontWeight: "600",
  },
});