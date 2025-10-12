import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

export default function Protocolo() {
  const { protocolo } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>Protocolo da denúncia:</Text>
      <Text style={styles.codigo}>#{protocolo}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  label: {
    color: "#ccc",
    fontSize: 20,
    marginBottom: 10,
  },
  codigo: {
    color: "#d62828",
    fontSize: 28,
    fontWeight: "bold",
  },
});
