import { Text, StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { buscarRanking } from "../services/apexService";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Apex() {
  const { cores } = useTheme();
  const { isAdmin } = useAuth();

  const { data: ranking = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["rankingApex"],
    queryFn: buscarRanking,
    enabled: isAdmin(),
  });

  if (!isAdmin()) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={60} color={cores.textoMuted} />
          <Text style={[styles.restritoTitulo, { color: cores.textoSecundario }]}>
            Área restrita
          </Text>
          <Text style={[styles.restritoTexto, { color: cores.textoMuted }]}>
            A Central de Integridade do Oracle APEX é exclusiva para administradores da comissão disciplinar.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  function getCorScore(total) {
    if (total >= 3) return "#d62828";
    if (total >= 2) return "#f4a261";
    return "#2a9d8f";
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={cores.primario} />
          <Text style={{ color: cores.textoMuted, marginTop: 10 }}>
            Conectando ao Oracle APEX...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={60} color="#444" />
          <Text style={[styles.erroTexto, { color: cores.textoSecundario }]}>
            APEX indisponível
          </Text>
          <TouchableOpacity
            style={[styles.botao, { backgroundColor: cores.primario, marginTop: 20 }]}
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
      <ScrollView>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={40} color={cores.primario} />
          <Text style={[styles.title, { color: cores.texto }]}>
            Central de Integridade
          </Text>
          <Text style={[styles.subtitle, { color: cores.textoMuted }]}>
            Oracle APEX • Análise Anti-Manipulação
          </Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: cores.fundoCard, borderColor: cores.borda }]}>
          <Ionicons name="information-circle" size={20} color={cores.primario} />
          <Text style={[styles.infoTexto, { color: cores.textoSecundario }]}>
            Toda denúncia passa pelo Oracle APEX, que calcula um score de risco (0-100) via procedure PL/SQL. Árbitros com score ≥70 são bloqueados automaticamente.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: cores.texto }]}>
          Ranking de Risco
        </Text>

        {ranking.length === 0 ? (
          <Text style={[styles.vazio, { color: cores.textoMuted }]}>
            Nenhuma denúncia registrada
          </Text>
        ) : (
          ranking.map((item, i) => {
            const cor = getCorScore(item.total_denuncias);
            return (
              <View
                key={item.id_arbitro}
                style={[styles.rankCard, { backgroundColor: cores.fundoCard, borderColor: cores.borda }]}
              >
                <View style={[styles.rankPos, { backgroundColor: cor }]}>
                  <Text style={styles.rankPosText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rankNome, { color: cores.texto }]}>
                    {item.nome_arbitro}
                  </Text>
                  <Text style={[styles.rankInfo, { color: cores.textoMuted }]}>
                    {item.total_denuncias} total • {item.novas} novas • {item.em_analise} em análise
                  </Text>
                </View>
              </View>
            );
          })
        )}

        <TouchableOpacity
          style={[styles.botao, { backgroundColor: cores.primario, marginTop: 20 }]}
          onPress={() => router.push("/auditoria")}
        >
          <Ionicons name="document-text-outline" size={18} color="#fff" />
          <Text style={styles.botaoText}>Ver auditoria de verificações</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  restritoTitulo: {
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
  },
  restritoTexto: {
    textAlign: "center",
    fontSize: 13,
    paddingHorizontal: 20,
    lineHeight: 19,
  },
  erroTexto: {
    marginTop: 20,
    textAlign: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  infoCard: {
    flexDirection: "row",
    gap: 10,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoTexto: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 12,
  },
  vazio: {
    textAlign: "center",
    marginTop: 20,
  },
  rankCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  rankPos: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  rankPosText: {
    color: "#fff",
    fontWeight: "bold",
  },
  rankNome: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
  },
  rankInfo: {
    fontSize: 12,
  },
  botao: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  botaoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});