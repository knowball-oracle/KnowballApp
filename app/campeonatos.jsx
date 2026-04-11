import {
  Text,
  TextInput,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listarCampeonatos,
  criarCampeonato,
  atualizarCampeonato,
  excluirCampeonato,
} from "../services/championshipService";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const CATEGORIAS = ["SUB_13", "SUB_15", "SUB_17", "SUB_20"];

export default function Campeonatos() {
  const { cores } = useTheme();
  const { token, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [modalVisivel, setModalVisivel] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("SUB_15");
  const [ano, setAno] = useState("2026");

  const {
    data: campeonatos = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["campeonatos"],
    queryFn: listarCampeonatos,
    enabled: !!token,
  });

  const mCriar = useMutation({
    mutationFn: criarCampeonato,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campeonatos"] });
      fechar();
      Alert.alert("Sucesso", "Campeonato criado!");
    },
    onError: () => Alert.alert("Erro", "Falha ao criar campeonato"),
  });

  const mAtualizar = useMutation({
    mutationFn: ({ id, dados }) => atualizarCampeonato(id, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campeonatos"] });
      fechar();
      Alert.alert("Sucesso", "Campeonato atualizado!");
    },
    onError: () => Alert.alert("Erro", "Falha ao atualizar"),
  });

  const mExcluir = useMutation({
    mutationFn: excluirCampeonato,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campeonatos"] });
      Alert.alert("Sucesso", "Campeonato excluído!");
    },
    onError: () =>
      Alert.alert(
        "Erro",
        "Falha ao excluir. O campeonato pode ter partidas vinculadas.",
      ),
  });

  function abrirCriar() {
    setEditando(null);
    setNome("");
    setCategoria("SUB_15");
    setAno("2026");
    setModalVisivel(true);
  }

  function abrirEditar(c) {
    setEditando(c);
    setNome(c.name);
    setCategoria(c.category);
    setAno(String(c.year));
    setModalVisivel(true);
  }

  function fechar() {
    setModalVisivel(false);
    setEditando(null);
  }

  function salvar() {
    if (!nome.trim()) return Alert.alert("Atenção", "Digite o nome");
    const anoNum = parseInt(ano);
    if (isNaN(anoNum) || anoNum < 2000)
      return Alert.alert("Atenção", "Ano inválido");

    const dados = { name: nome.trim(), category: categoria, year: anoNum };

    if (editando) {
      mAtualizar.mutate({ id: editando.id, dados });
    } else {
      mCriar.mutate(dados);
    }
  }

  function confirmarExcluir(id, nome) {
    Alert.alert("Confirmar exclusão", `Excluir o campeonato "${nome}"?`, [
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
            Faça login para acessar
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
        <Text style={[styles.title, { color: cores.texto }]}>Campeonatos</Text>
        <Text style={{ color: cores.textoMuted, fontSize: 13, marginTop: 4 }}>
          {campeonatos.length} cadastrado(s)
        </Text>
      </View>

      {isAdmin() && (
        <TouchableOpacity
          style={[styles.btnAdd, { backgroundColor: cores.primario }]}
          onPress={abrirCriar}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.btnAddText}>Novo campeonato</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={campeonatos}
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
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardNome, { color: cores.texto }]}>
                {item.name}
              </Text>
              <Text style={{ color: cores.textoMuted, fontSize: 13 }}>
                {item.category} • {item.year}
              </Text>
            </View>
            {isAdmin() && (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity onPress={() => abrirEditar(item)}>
                  <Ionicons
                    name="pencil-outline"
                    size={22}
                    color={cores.primario}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => confirmarExcluir(item.id, item.name)}
                >
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
              {editando ? "Editar Campeonato" : "Novo Campeonato"}
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: cores.input,
                  color: cores.texto,
                  borderColor: cores.borda,
                },
              ]}
              placeholder="Nome do campeonato"
              placeholderTextColor={cores.textoMuted}
              value={nome}
              onChangeText={setNome}
            />

            <Text style={{ color: cores.textoSecundario, marginBottom: 8 }}>
              Categoria:
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginBottom: 15,
                flexWrap: "wrap",
              }}
            >
              {CATEGORIAS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.chip,
                    { backgroundColor: cores.input, borderColor: cores.borda },
                    categoria === c && {
                      backgroundColor: cores.primario,
                      borderColor: cores.primario,
                    },
                  ]}
                  onPress={() => setCategoria(c)}
                >
                  <Text
                    style={{
                      color: categoria === c ? "#fff" : cores.texto,
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: cores.input,
                  color: cores.texto,
                  borderColor: cores.borda,
                },
              ]}
              placeholder="Ano"
              placeholderTextColor={cores.textoMuted}
              value={ano}
              onChangeText={setAno}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[styles.btnPrim, { backgroundColor: cores.primario }]}
              onPress={salvar}
              disabled={mCriar.isPending || mAtualizar.isPending}
            >
              {mCriar.isPending || mAtualizar.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimText}>
                  {editando ? "Salvar" : "Criar"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnCancel, { borderColor: cores.borda }]}
              onPress={fechar}
            >
              <Text style={{ color: cores.textoMuted, fontWeight: "600" }}>
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
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
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
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardNome: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
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
    padding: 14,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    fontSize: 15,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
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
});
