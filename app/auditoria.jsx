import {
  Text,
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { buscarAuditoria } from "../services/apexService";
import { useTheme } from "../context/ThemeContext";

export default function Auditoria() {
  const { cores } = useTheme();
  const {
    data: logs = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["auditoriaApex"],
    queryFn: buscarAuditoria,
  });

  function corStatus(s) {
    return s === "BLOQUEADO"
      ? "#d62828"
      : s === "ALERTA"
        ? "#f4a261"
        : "#2a9d8f";
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <View style={styles.header}>
        <Ionicons name="receipt-outline" size={30} color={cores.primario} />
        <Text style={[styles.title, { color: cores.texto }]}>
          Auditoria APEX
        </Text>
        <Text style={{ color: cores.textoMuted, fontSize: 13 }}>
          Últimas verificações registradas
        </Text>
      </View>
      {isLoading ? (
        <ActivityIndicator color={cores.primario} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={logs}
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
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <Text style={[styles.nome, { color: cores.texto }]}>
                  {item.nome_arbitro}
                </Text>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: corStatus(item.status_retornado) },
                  ]}
                >
                  <Text style={styles.badgeText}>{item.status_retornado}</Text>
                </View>
              </View>
              <Text style={{ color: cores.textoMuted, fontSize: 12 }}>
                Score: {item.score_retornado}/100 • {item.total_denuncias}{" "}
                denúncia(s)
              </Text>
              <Text
                style={{ color: cores.textoMuted, fontSize: 11, marginTop: 4 }}
              >
                {new Date(item.data_consulta).toLocaleString("pt-BR")}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginTop: 8 },
  card: { padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 10 },
  nome: { fontSize: 15, fontWeight: "bold" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
});
