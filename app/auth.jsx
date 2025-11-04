import { Text, TextInput, StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

const API_BASE = 'https://6909f3041a446bb9cc20b45c.mockapi.io';

export default function Auth() {
  const [codigo, setCodigo] = useState("");
  const [temDenuncias, setTemDenuncias] = useState(false);

  const CODIGO_CORRETO = "1234";

  async function verificarDenuncias() {
    try {
      const response = await axios.get(`${API_BASE}/denuncias`);
      if (response.data.length > 0) {
        setTemDenuncias(true);
      } else {
        router.push("/historico");
      }
    } catch (error) {
      console.log(error);
      router.push("/historico");
    }
  }

  useFocusEffect(() => {
    verificarDenuncias();
  });

  function verificarCodigo() {
    if (codigo === CODIGO_CORRETO) {
      Alert.alert("Acesso Liberado", "Bem-vindo!");
      setCodigo("");
      router.push("/historico");
    } else {
      Alert.alert("Acesso Negado", "Código incorreto!");
      setCodigo("");
    }
  }

  if (!temDenuncias) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={80} color="#d62828" />
        <Text style={styles.title}>Área Restrita</Text>
        <Text style={styles.subtitle}>
          Digite o código para acessar os protocolos
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Código (1234)"
          value={codigo}
          onChangeText={setCodigo}
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
          placeholderTextColor="#555"
        />

        <TouchableOpacity onPress={verificarCodigo} style={styles.botao}>
          <Text style={styles.botaoText}>Acessar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>Código de demonstração: 1234</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#ccc",
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  input: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 10,
    borderWidth: 2,
    borderColor: "#333",
  },
  botao: {
    backgroundColor: "#d62828",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
  },
  botaoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  info: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
  },
  infoText: {
    color: "#888",
    fontSize: 13,
    textAlign: "center",
  },
});