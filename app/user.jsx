import { Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

export default function User() {
 const { nome, protocolo } = useLocalSearchParams();

 
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Denúncia enviada com sucesso!</Text>
      <Text style={styles.subtitle}>Obrigado, {nome}.</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Protocolo da denúncia:</Text>
        <Text style={styles.code}>#{protocolo}</Text>
      </View>
      <Text style={styles.footer}>Acompanhe sua denúncia com este número.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    color: "#ccc",
    fontSize: 16,
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#222",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 6,
  },
  code: {
    color: "#d62828",
    fontSize: 24,
    fontWeight: "bold",
  },
  footer: {
    color: "#888",
    fontSize: 13,
    textAlign: "center",
  },
});
