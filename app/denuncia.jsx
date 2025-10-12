import { Text, TextInput, StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, } from "react";
import { Link, useLocalSearchParams } from "expo-router";

export default function Denuncia() {
  const { nome, email } = useLocalSearchParams();
  const [categoria, setCategoria] = useState("");
  const [partida, setPartida] = useState("");
  const [data, setData] = useState("");
  const [arbitro, setArbitro] = useState("");
  const [relato, setRelato] = useState("");



  async function Salvar() {
    let denuncias = [];

    const dados = await AsyncStorage.getItem("DENUNCIAS");
    if (dados !== null) {
      denuncias = JSON.parse(dados);
    }

     const protocolo = Math.floor(100000 + Math.random() * 900000).toString();

    denuncias.push({
      nome,
      email,
      categoria,
      partida,
      data,
      arbitro,
      relato,
      protocolo,
    });

    await AsyncStorage.setItem("DENUNCIAS", JSON.stringify(denuncias));

    Alert.alert("Denúncia registrada com sucesso!",`Protocolo: ${protocolo}`);

    setCategoria("");
    setPartida("");
    setData("");
    setArbitro("");
    setRelato("");
    
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Formulário de Denúncia</Text>

      <Text style={styles.label}>
        Categoria de base:{" "}
        <Text style={styles.categoriaSelecionadaTexto}>{categoria || "Nenhuma"}</Text>
      </Text>

      <View style={styles.categoriaContainer}>
        <TouchableOpacity style={styles.categoriaBotao} onPress={() => setCategoria("Sub-13")}>
          <Text style={styles.categoriaTexto}>Sub-13</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoriaBotao} onPress={() => setCategoria("Sub-15")}>
          <Text style={styles.categoriaTexto}>Sub-15</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoriaBotao} onPress={() => setCategoria("Sub-17")}>
          <Text style={styles.categoriaTexto}>Sub-17</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoriaBotao} onPress={() => setCategoria("Sub-20")}>
          <Text style={styles.categoriaTexto}>Sub-20</Text>
        </TouchableOpacity>
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

      <Link href="/user" asChild>
        <TouchableOpacity onPress={Salvar} style={styles.botaoSalvar}>
          <Text style={styles.botaoText}>Enviar denúncia</Text>
        </TouchableOpacity>
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
    backgroundColor: "#D62828",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
  },
  categoriaSelecionadaTexto: {
    color: "#fff",
    fontWeight: "bold",
  },
  categoriaTexto: {
    color: "#fff",
    fontWeight: "bold",
  },
  botaoSalvar: {
    backgroundColor: "#d62828",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  botaoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
