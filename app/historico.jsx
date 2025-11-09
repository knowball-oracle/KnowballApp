import { Text, StyleSheet, View, FlatList, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState} from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import axios from "axios";

import { API_BASE } from './constants';

export default function Historico() {
  const [denuncias, setDenuncias] = useState([]);

  
  async function carregarDenuncias() {
    try {
      const response = await axios.get(`${API_BASE}/denuncias`);
      setDenuncias(response.data);
    } catch (error) {
      console.log("Erro ao buscar denúncias:", error);
      Alert.alert("Erro", "Falha ao carregar denúncias");
    }
  }

  
  async function excluirDenuncia(id) {
    Alert.alert("Confirmar", "Deseja excluir esta denúncia?", [
      { text: "Cancelar" },
      {
        text: "Excluir",
        onPress: async () => {
          try {
            await axios.delete(`${API_BASE}/denuncias/${id}`);
            Alert.alert("Sucesso", "Denúncia excluída!");
            carregarDenuncias();
          } catch (error) {
            console.log(error);
            Alert.alert("Erro", "Falha ao excluir denúncia");
          }
        },
      },
    ]);
  }

  async function limparTudo() {
    Alert.alert("Confirmar", "Deseja excluir TODAS as denúncias?", [
      { text: "Cancelar" },
      {
        text: "Excluir Tudo",
        onPress: async () => {
          try {
            for (const denuncia of denuncias) {
              await axios.delete(`${API_BASE}/denuncias/${denuncia.id}`);
            }
            Alert.alert("Sucesso", "Todas as denúncias foram removidas!");
            setDenuncias([]);
          } catch (error) {
            console.log(error);
            Alert.alert("Erro", "Falha ao limpar denúncias");
          }
        },
      },
    ]);
  }

  useFocusEffect(() => {
    carregarDenuncias();
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico de Protocolos</Text>
        <Text style={styles.subtitle}>{denuncias.length} denúncia(s)</Text>
      </View>

      {denuncias.length > 0 && (
        <TouchableOpacity style={styles.botaoLimpar} onPress={limparTudo}>
          <Ionicons name="trash-outline" size={18} color="#ff4444" />
          <Text style={styles.botaoLimparText}>Limpar tudo</Text>
        </TouchableOpacity>
      )}

      {denuncias.length === 0 ? (
        <View style={styles.vazio}>
          <Ionicons name="document-text-outline" size={60} color="#444" />
          <Text style={styles.vazioText}>Nenhuma denúncia registrada</Text>
          <TouchableOpacity style={styles.botaoNovo} onPress={() => router.push("/")}>
            <Text style={styles.botaoNovoText}>Fazer nova denúncia</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={denuncias}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.protocolo}>#{item.protocolo}</Text>
                  <Text style={styles.categoria}>{item.categoria}</Text>
                </View>
                <TouchableOpacity onPress={() => excluirDenuncia(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>

              <Text style={styles.info}>Partida: {item.partida}</Text>
              <Text style={styles.info}>Data: {item.data}</Text>
              <Text style={styles.info}>Árbitro: {item.arbitro}</Text>
              <Text style={styles.info}>Email: {item.email}</Text>

              <TouchableOpacity
                style={styles.botaoVer}
                onPress={() => Alert.alert("Relato Completo", item.relato)}
              >
                <Text style={styles.botaoVerText}>Ver relato completo</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.lista}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
  botaoLimpar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 10,
  },
  botaoLimparText: {
    color: "#ff4444",
    fontWeight: "600",
  },
  lista: {
    padding: 20,
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  protocolo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#d62828",
  },
  categoria: {
    fontSize: 14,
    color: "#fff",
    marginTop: 5,
  },
  info: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 5,
  },
  botaoVer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  botaoVerText: {
    color: "#d62828",
    fontWeight: "600",
  },
  vazio: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  vazioText: {
    color: "#ccc",
    fontSize: 16,
    marginTop: 20,
    marginBottom: 30,
  },
  botaoNovo: {
    backgroundColor: "#d62828",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  botaoNovoText: {
    color: "#fff",
    fontWeight: "bold",
  },
});