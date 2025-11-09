import { Text, TextInput, StyleSheet, View, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";

import { API_BASE } from './constants';

export default function Denuncia() {
  const { nome, email } = useLocalSearchParams();
  const [categoria, setCategoria] = useState("");
  const [partida, setPartida] = useState("");
  const [data, setData] = useState("");
  const [arbitro, setArbitro] = useState("");
  const [relato, setRelato] = useState("");
  const [loading, setLoading] = useState(false);

  function validarData(data) {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(data)) return false;
    const [_, dia, mes, ano] = data.match(regex);
    const dataObj = new Date(ano, mes - 1, dia);
    return dataObj.getFullYear() == ano && dataObj.getMonth() == mes - 1 && dataObj.getDate() == dia;
  }

  async function Salvar() {
    if (!categoria) {
      Alert.alert("Atenção", "Selecione uma categoria");
      return;
    }
    if (!partida.trim()) {
      Alert.alert("Atenção", "Preencha a partida");
      return;
    }
    if (!validarData(data)) {
      Alert.alert("Atenção", "Data inválida. Use DD/MM/AAAA");
      return;
    }
    if (!arbitro.trim()) {
      Alert.alert("Atenção", "Preencha o árbitro");
      return;
    }
    if (!relato.trim() || relato.trim().length < 20) {
      Alert.alert("Atenção", "Relato deve ter pelo menos 20 caracteres");
      return;
    }

    setLoading(true);
    const protocolo = Math.floor(100000 + Math.random() * 900000).toString();

    const novaDenuncia = {
      nome,
      email,
      categoria,
      partida: partida.trim(),
      data: data.trim(),
      arbitro: arbitro.trim(),
      relato: relato.trim(),
      protocolo,
      dataEnvio: new Date().toISOString(),
    };

    try {
      await axios.post(`${API_BASE}/denuncias`, novaDenuncia, {
        headers: { 'Content-Type': 'application/json' }
      });
      setLoading(false);
      Alert.alert("Sucesso", "Denúncia enviada com sucesso!");
      router.push({
        pathname: "/user",
        params: { nome, protocolo }
      });
    } catch (error) {
      setLoading(false);
      console.log(error);
      Alert.alert("Erro", "Falha ao enviar a denúncia.");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Formulário de Denúncia</Text>
        <Text style={styles.usuario}>Denunciante: {nome}</Text>

        <Text style={styles.label}>Categoria de base: <Text style={styles.categoriaSelecionadaTexto}>{categoria || "Nenhuma"}</Text></Text>

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
          placeholder="Partida (ex: Corinthians x Palmeiras)"
          placeholderTextColor="#888"
          value={partida}
          onChangeText={setPartida}
        />

        <TextInput
          style={styles.input}
          placeholder="Data da partida (DD/MM/AAAA)"
          placeholderTextColor="#888"
          value={data}
          onChangeText={setData}
          keyboardType="numeric"
          maxLength={10}
        />

        <TextInput
          style={styles.input}
          placeholder="Árbitro"
          placeholderTextColor="#888"
          value={arbitro}
          onChangeText={setArbitro}
        />

        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Relato da denúncia (mínimo 20 caracteres)"
          placeholderTextColor="#888"
          value={relato}
          onChangeText={setRelato}
          multiline
          textAlignVertical="top"
        />
        <Text style={styles.contador}>{relato.length} caracteres</Text>

        <TouchableOpacity onPress={Salvar} style={styles.botaoSalvar} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoText}>Enviar denúncia</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#111",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
    textAlign: "center",
  },
  usuario: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  contador: {
    color: "#666",
    fontSize: 12,
    textAlign: "right",
    marginTop: -10,
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
    padding: 16,
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