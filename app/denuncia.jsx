import { Text, Button, TextInput, StyleSheet, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Link, useLocalSearchParams } from "expo-router";

export default function Denuncia() {
  const { nome, email } = useLocalSearchParams();

  const [categoria, setCategoria] = useState("");
  const [partida, setPartida] = useState("");
  const [data, setData] = useState("");
  const [arbitro, setArbitro] = useState("");
  const [relato, setRelato] = useState("");

  const protocolo = "123456";

  const categorias = ["Sub-13", "Sub-15", "Sub-17", "Sub-20"];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Formulário de Denúncia</Text>

      <Text style={styles.label}>Categoria de base:</Text>
      <View style={styles.categoriaContainer}>
        {categorias.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.categoriaBotao,
              categoria === item && styles.categoriaSelecionada
            ]}
            onPress={() => setCategoria(item)}
          >
            <Text style={styles.categoriaTexto}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Partida"
        value={partida}
        onChangeText={setPartida}
      />

      <TextInput
        style={styles.input}
        placeholder="Data da partida (DD/MM/AAAA)"
        value={data}
        onChangeText={setData}
      />

      <TextInput
        style={styles.input}
        placeholder="Árbitro"
        value={arbitro}
        onChangeText={setArbitro}
      />

      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Relato da denúncia"
        value={relato}
        onChangeText={setRelato}
        multiline
      />

      <Link
        href={{
          pathname: "/user",
          params: {
            nome,
            email,
            categoria,
            partida,
            arbitro,
            relato,
            protocolo,
          },
        }}
        asChild
      >
        <Button title="Enviar denúncia" color="#d62828" />
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#111",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  categoriaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    gap: 10,
  },
  categoriaBotao: {
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 8,
  },
  categoriaSelecionada: {
    backgroundColor: "#d62828",
  },
  categoriaTexto: {
    color: "#fff",
    fontWeight: "bold",
  },
});
