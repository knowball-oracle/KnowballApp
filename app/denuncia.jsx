import { Text, TextInput, StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";

const API_BASE = 'https://6909f3041a446bb9cc20b45c.mockapi.io';

export default function Denuncia() {
  const { nome, email } = useLocalSearchParams();
  const [categoria, setCategoria] = useState("");
  const [partida, setPartida] = useState("");
  const [data, setData] = useState("");
  const [arbitro, setArbitro] = useState("");
  const [relato, setRelato] = useState("");

  async function Salvar() {
    if (!categoria || !partida || !data || !arbitro || !relato) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos.");
      return;
    }

    const protocolo = Math.floor(100000 + Math.random() * 900000).toString();

    const novaDenuncia = {
      nome,
      email,
      categoria,
      partida,
      data,
      arbitro,
      relato,
      protocolo,
    };

    try {
      await axios.post(`${API_BASE}/denuncias`, novaDenuncia, {
        headers: { 'Content-Type': 'application/json' }
      });

      Alert.alert("Sucesso", "Denúncia enviada com sucesso!");
      
      router.push({
        pathname: "/user",
        params: { nome, protocolo }
      });
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Falha ao enviar a denúncia.");
    }
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

      <TouchableOpacity onPress={Salvar} style={styles.botaoSalvar}>
        <Text style={styles.botaoText}>Enviar denúncia</Text>
      </TouchableOpacity>
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