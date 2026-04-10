import { Text, TextInput, StyleSheet, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { register } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const { setToken, setUserName, setUserRole } = useAuth();

  async function handleRegister() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Digite seu nome");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Atenção", "Digite seu e-mail");
      return;
    }
    if (!senha.trim() || senha.length < 6) {
      Alert.alert("Atenção", "Senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const data = await register(nome.trim(), email.trim(), senha);
      setToken(data.token);
      setUserName(data.name);
      setUserRole(data.role);
      router.replace("/auth");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível criar a conta. E-mail já cadastrado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-add" size={80} color="#d62828" />
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Cadastre-se no Knowball</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          placeholderTextColor="#555"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#555"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha (mínimo 6 caracteres)"
          placeholderTextColor="#555"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity style={styles.botao} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoText}>Criar conta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkLogin} onPress={() => router.back()}>
          <Text style={styles.linkLoginText}>Já tem conta? <Text style={styles.linkDestaque}>Entrar</Text></Text>
        </TouchableOpacity>
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
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#ccc",
  },
  form: {
    width: "100%",
  },
  input: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333",
    fontSize: 16,
  },
  botao: {
    backgroundColor: "#d62828",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  botaoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkLogin: {
    alignItems: "center",
  },
  linkLoginText: {
    color: "#888",
    fontSize: 14,
  },
  linkDestaque: {
    color: "#d62828",
    fontWeight: "bold",
  },
});