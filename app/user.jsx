import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function User() {
  const { nome, protocolo } = useLocalSearchParams();
  const { cores } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <Ionicons name="checkmark-circle" size={80} color={cores.primario} />

      <Text style={[styles.title, { color: cores.texto }]}>
        Denúncia enviada com sucesso!
      </Text>
      <Text style={[styles.subtitle, { color: cores.textoSecundario }]}>
        Obrigado, {nome}.
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: cores.fundoCard, borderColor: cores.borda },
        ]}
      >
        <Text style={[styles.label, { color: cores.textoMuted }]}>
          Protocolo da denúncia:
        </Text>
        <Text style={[styles.code, { color: cores.primario }]}>
          #{protocolo}
        </Text>
      </View>

      <Text style={[styles.footer, { color: cores.textoMuted }]}>
        Acompanhe sua denúncia com este número.
      </Text>

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: cores.primario }]}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.botaoText}>Voltar ao início</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 25,
  },
  card: {
    padding: 25,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 20,
    minWidth: 260,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  code: {
    fontSize: 26,
    fontWeight: "bold",
  },
  footer: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 30,
  },
  botao: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 10,
  },
  botaoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});