import { Text, StyleSheet, View, FlatList, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listarDenuncias, atualizarStatusDenuncia, excluirDenuncia } from "../services/reportService";
import { buscarMinhasDenuncias } from "../services/apexService";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const FILTROS = [
  { key: "TODOS", label: "Todas" },
  { key: "NEW", label: "Novas" },
  { key: "UNDER_REVIEW", label: "Em análise" },
  { key: "RESOLVED", label: "Resolvidas" },
];

export default function Historico() {
  const queryClient = useQueryClient();
  const { token, userEmail, isAdmin } = useAuth();
  const { cores } = useTheme();
  const [filtroAtivo, setFiltroAtivo] = useState("TODOS");

  const queryAdmin = useQuery({
    queryKey: ["denuncias"],
    queryFn: listarDenuncias,
    enabled: !!token && isAdmin(),
  });

  const queryUser = useQuery({
    queryKey: ["minhasDenuncias", userEmail],
    queryFn: () => buscarMinhasDenuncias(userEmail),
    enabled: !!token && !isAdmin() && !!userEmail,
  });

  const denunciasRaw = isAdmin() ? queryAdmin.data || [] : queryUser.data || [];
  const isLoading = isAdmin() ? queryAdmin.isLoading : queryUser.isLoading;
  const refetch = isAdmin() ? queryAdmin.refetch : queryUser.refetch;

  const denuncias = filtroAtivo === "TODOS"
    ? denunciasRaw
    : denunciasRaw.filter((d) => d.status === filtroAtivo);

  const mStatus = useMutation({
    mutationFn: ({ id, status, analysisResultType }) =>
      atualizarStatusDenuncia(id, status, analysisResultType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["denuncias"] });
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

  function getProximoStatus(atual) {
    if (atual === "NEW") return "UNDER_REVIEW";
    if (atual === "UNDER_REVIEW") return "RESOLVED";
    return null;
  }

  function getLabelStatus(s) {
    if (s === "NEW") return "Nova";
    if (s === "UNDER_REVIEW") return "Em análise";
    if (s === "RESOLVED") return "Resolvida";
    return s;
  }

  function getCorStatus(s) {
    if (s === "NEW") return "#3b82f6";
    if (s === "UNDER_REVIEW") return "#f4a261";
    if (s === "RESOLVED") return "#2a9d8f";
    return "#888";
  }

  function avancarStatus(id, atual) {
    const novo = getProximoStatus(atual);
    if (!novo) return;

    if (novo === "RESOLVED") {
      Alert.alert("Encerrar denúncia", "Qual foi o veredito da comissão?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Improcedente",
          onPress: () => mStatus.mutate({ id, status: "RESOLVED", analysisResultType: "NEGATIVE" }),
        },
        {
          text: "Procedente",
          style: "destructive",
          onPress: () => mStatus.mutate({ id, status: "RESOLVED", analysisResultType: "POSITIVE" }),
        },
      ]);
      return;
    }

    Alert.alert("Avançar status", `Mudar para "${getLabelStatus(novo)}"?`, [
      { text: "Cancelar" },
      {
        text: "Confirmar",
        onPress: () => mStatus.mutate({ id, status: novo, analysisResultType: "NEUTRAL" }),
      },
    ]);
  }

  function confirmarExcluir(id, protocolo) {
    Alert.alert("Excluir denúncia", `Remover o protocolo ${protocolo}?`, [
      { text: "Cancelar" },
      { text: "Excluir", style: "destructive", onPress: () => mExcluir.mutate(id) },
    ]);
  }

  if (!token) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={60} color={cores.textoMuted} />
          <Text style={[styles.aviso, { color: cores.textoSecundario }]}>
            Faça login para ver os protocolos
          </Text>
          <TouchableOpacity
            style={[styles.btnLogin, { backgroundColor: cores.primario }]}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.btnLoginText}>Fazer login</Text>
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
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: cores.texto }]}>
          {isAdmin() ? "Todas as Denúncias" : "Meus Protocolos"}
        </Text>
        <Text style={[styles.subtitle, { color: cores.textoMuted }]}>
          {denuncias.length} {isAdmin() ? "no sistema" : "registrada(s) por você"}
          {filtroAtivo !== "TODOS" && ` • filtro: ${getLabelStatus(filtroAtivo)}`}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtros}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {FILTROS.map((f) => {
          const ativo = filtroAtivo === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.chipFiltro,
                { backgroundColor: cores.fundoCard, borderColor: cores.borda },
                ativo && { backgroundColor: cores.primario, borderColor: cores.primario },
              ]}
              onPress={() => setFiltroAtivo(f.key)}
            >
              <Text style={[styles.chipFiltroText, { color: ativo ? "#fff" : cores.texto }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {denuncias.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="document-text-outline" size={60} color={cores.textoMuted} />
          <Text style={[styles.vazioTexto, { color: cores.textoSecundario }]}>
            {filtroAtivo !== "TODOS"
              ? "Nenhuma denúncia neste status"
              : isAdmin()
                ? "Nenhuma denúncia registrada"
                : "Você ainda não fez denúncias"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={denuncias}
          keyExtractor={(i) => (i.id || i.protocolo).toString()}
          refreshing={isLoading}
          onRefresh={refetch}
          contentContainerStyle={{ padding: 20, paddingTop: 10 }}
          renderItem={({ item }) => {
            const protocolo = item.protocol || item.protocolo;
            const status = item.status;
            const arbitro = item.referee?.name || item.nome_arbitro;
            const partida = item.game?.place || "—";
            const data = item.date || (item.data_criacao || "").split("T")[0];
            const conteudo = item.content || item.conteudo;
            const categoria = item.game?.championship?.category;
            const corStatus = getCorStatus(status);
            const proximo = getProximoStatus(status);

            return (
              <View style={[styles.card, { backgroundColor: cores.fundoCard, borderColor: cores.borda }]}>
                <View style={styles.cardTopo}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.protocolo, { color: cores.primario }]}>
                      #{protocolo}
                    </Text>
                    {categoria && (
                      <Text style={[styles.categoria, { color: cores.textoMuted }]}>
                        {categoria}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: corStatus }]}>
                    <Text style={styles.statusBadgeText}>{getLabelStatus(status)}</Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: cores.borda }]} />

                <View style={styles.infoLinha}>
                  <Ionicons name="football-outline" size={14} color={cores.textoMuted} />
                  <Text style={[styles.infoTexto, { color: cores.textoSecundario }]}>
                    {partida}
                  </Text>
                </View>
                <View style={styles.infoLinha}>
                  <Ionicons name="person-outline" size={14} color={cores.textoMuted} />
                  <Text style={[styles.infoTexto, { color: cores.textoSecundario }]}>
                    {arbitro}
                  </Text>
                </View>
                <View style={styles.infoLinha}>
                  <Ionicons name="calendar-outline" size={14} color={cores.textoMuted} />
                  <Text style={[styles.infoTexto, { color: cores.textoSecundario }]}>
                    {data}
                  </Text>
                </View>

                {isAdmin() && proximo && (
                  <TouchableOpacity
                    style={[styles.btnAvancar, { borderColor: corStatus }]}
                    onPress={() => avancarStatus(item.id, status)}
                  >
                    <Text style={[styles.btnAvancarText, { color: corStatus }]}>
                      Avançar para "{getLabelStatus(proximo)}"
                    </Text>
                    <Ionicons name="arrow-forward" size={14} color={corStatus} />
                  </TouchableOpacity>
                )}

                <View style={[styles.acoesRodape, { borderTopColor: cores.borda }]}>
                  <TouchableOpacity
                    style={styles.acaoBtn}
                    onPress={() => Alert.alert("Relato completo", conteudo)}
                  >
                    <Ionicons name="eye-outline" size={16} color={cores.primario} />
                    <Text style={[styles.acaoTexto, { color: cores.primario }]}>
                      Ver relato
                    </Text>
                  </TouchableOpacity>

                  {isAdmin() && (
                    <TouchableOpacity
                      style={styles.acaoBtn}
                      onPress={() => confirmarExcluir(item.id, protocolo)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ff4444" />
                      <Text style={[styles.acaoTexto, { color: "#ff4444" }]}>
                        Excluir
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
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
  aviso: {
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  btnLogin: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnLoginText: {
    color: "#fff",
    fontWeight: "bold",
  },
  vazioTexto: {
    marginTop: 20,
    textAlign: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
  filtros: {
    maxHeight: 50,
    marginBottom: 5,
  },
  chipFiltro: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipFiltroText: {
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  cardTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  protocolo: {
    fontSize: 16,
    fontWeight: "bold",
  },
  categoria: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    marginBottom: 10,
  },
  infoLinha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 5,
  },
  infoTexto: {
    fontSize: 13,
  },
  btnAvancar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  btnAvancarText: {
    fontSize: 13,
    fontWeight: "600",
  },
  acoesRodape: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  acaoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  acaoTexto: {
    fontSize: 13,
    fontWeight: "600",
  },
});