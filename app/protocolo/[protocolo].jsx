import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Protocolo() {
  const [listaDenuncias, setListaDenuncias] = useState([]);

  async function buscarDenuncias() {
    const dados = await AsyncStorage.getItem("DENUNCIAS");
    if (dados != null) {
      setListaDenuncias(JSON.parse(dados));
    }
  }

  async function limparDenuncias() {
    await AsyncStorage.removeItem("DENUNCIAS");
    setListaDenuncias([]);
    Alert.alert("Denúncias apagadas com sucesso!");
  }

  useEffect(() => {
    buscarDenuncias();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Denúncias Registradas</Text>

      <TouchableOpacity style={styles.botao} onPress={buscarDenuncias}>
        <Text style={styles.botaoText}>Atualizar Lista</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: "#d62828" }]}
        onPress={limparDenuncias}
      >
        <Text style={styles.botaoText}>Limpar Todas</Text>
      </TouchableOpacity>

      <FlatList
        data={listaDenuncias}
        renderItem={({ item }) => {
          if (!item || !item.categoria) return null;
          return (
            <View style={styles.card}>
              <Text style={styles.info}>Categoria: {item.categoria}</Text>
              <Text style={styles.info}>Partida: {item.partida}</Text>
              <Text style={styles.info}>Data: {item.data}</Text>
              <Text style={styles.info}>Árbitro: {item.arbitro}</Text>
              <Text style={styles.info}>Relato: {item.relato}</Text>
              <Text style={styles.info}>Protocolo: {item.protocolo}</Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 20,
  },
  titulo: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  botao: {
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  botaoText: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  info: {
    color: "#000",
  },
});
