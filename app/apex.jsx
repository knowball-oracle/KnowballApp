import { Text, StyleSheet, View, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buscarEstatisticas, sincronizarDenuncias } from "../services/apexService";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Apex() {
  const { token } = useAuth();
  const { cores } = useTheme();
  const queryClient = useQueryClient();

  const { data: stats = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["apexStats"],
    queryFn: buscarEstatisticas,
  });

  const mutation = useMutation({
    mutationFn: sincronizarDenuncias,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apexStats"] });
    },
    onError: (error) => {
      console.log("Erro sync:", error.message);
    },
  });

  function getCorStatus(status) {
    switch (status) {
      case "NEW": return "#d62828";
      case "UNDER_ANALYSIS": return "#f4a261";
      case "RESOLVED": return "#2a9d8f";
      default: return "#888";
    }
  }

  function getLabelStatus(status) {
    switch (status) {
      case "NEW": return "Novas";
      case "UNDER_ANALYSIS": return "Em Análise";
      case "RESOLVED": return "Resolvidas";
      default: return status;
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={cores.primario} />
          <Text style={{ color: cores.textoSecundario, marginTop: 10 }}>
            Conectando ao Oracle APEX...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 40 }}>
          <Ionicons name="cloud-offline-outline" size={60} color="#444" />
          <Text style={[styles.erroText, { color: cores.textoSecundario }]}>
            Não foi possível conectar ao Oracle APEX
          </Text>
          <TouchableOpacity
            style={[styles.botao, { backgroundColor: cores.primario }]}
            onPress={refetch}
          >
            <Text style={styles.botaoText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="analytics-outline" size={40} color={cores.primario} />
          <Text style={[styles.title, { color: cores.texto }]}>Painel Oracle APEX</Text>
          <Text style={[styles.subtitle, { color: cores.textoMuted }]}>
            Estatísticas de denúncias em tempo real
          </Text>
        </View>

        <View style={styles.statsContainer}>
          {stats.map((item) => (
            <View
              key={item.status}
              style={[styles.statCard, { backgroundColor: cores.fundoCard, borderColor: cores.borda }]}
            >
              <View style={[styles.statIndicador, { backgroundColor: getCorStatus(item.status) }]} />
              <View style={styles.statInfo}>
                <Text style={[styles.statLabel, { color: cores.textoMuted }]}>
                  {getLabelStatus(item.status)}
                </Text>
                <Text style={[styles.statTotal, { color: cores.texto }]}>
                  {item.total}
                </Text>
                <Text style={[styles.statData, { color: cores.textoMuted }]}>
                  Atualizado: {new Date(item.data_atualizacao).toLocaleString("pt-BR")}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: cores.fundoCard, borderColor: cores.borda }]}>
          <Ionicons name="information-circle-outline" size={20} color={cores.primario} />
          <Text style={[styles.infoText, { color: cores.textoSecundario }]}>
            Este painel é alimentado pelo Oracle APEX via REST API. Sincronize para atualizar as estatísticas com os dados reais do sistema.
          </Text>
        </View>

        {token && (
          <TouchableOpacity
            style={[styles.botao, { backgroundColor: cores.primario }]}
            onPress={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="sync-outline" size={20} color="#fff" />
                <Text style={styles.botaoText}>Sincronizar denúncias com APEX</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.botaoRefresh, { borderColor: cores.borda }]}
          onPress={refetch}
        >
          <Ionicons name="refresh-outline" size={20} color={cores.primario} />
          <Text style={[styles.botaoRefreshText, { color: cores.primario }]}>Atualizar dados</Text>
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
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  statsContainer: {
    gap: 15,
    marginBottom: 20,
  },
  statCard: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  statIndicador: {
    width: 6,
  },
  statInfo: {
    flex: 1,
    padding: 15,
  },
  statLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  statTotal: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statData: {
    fontSize: 11,
  },
  infoCard: {
    flexDirection: "row",
    gap: 10,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
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
  botaoRefresh: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  botaoRefreshText: {
    fontWeight: "600",
    fontSize: 15,
  },
  erroText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
  },
});