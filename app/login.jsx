import { Text, TextInput, StyleSheet, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const { setToken, setUserName, setUserRole } = useAuth();

  async function handleLogin() {
    if (!email.trim()) {
      Alert.alert("Atenção", "Digite seu e-mail");
      return;
    }
    if (!senha.trim()) {
      Alert.alert("Atenção", "Digite sua senha");
      return;
    }

    setLoading(true);
    try {
      const data = await login(email.trim(), senha);
      setToken(data.token);
      setUserName(data.name);
      setUserRole(data.role);
      router.replace("/");
    } catch (error) {
      Alert.alert("Erro", "E-mail ou senha inválidos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={80} color="#d62828" />
        <Text style={styles.title}>Knowball</Text>
        <Text style={styles.subtitle}>Entre na sua conta</Text>
      </View>

      <View style={styles.form}>
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
          placeholder="Senha"
          placeholderTextColor="#555"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity style={styles.botao} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkCadastro} onPress={() => router.push("/register")}>
          <Text style={styles.linkCadastroText}>Não tem conta? <Text style={styles.linkDestaque}>Cadastre-se</Text></Text>
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
  linkCadastro: {
    alignItems: "center",
  },
  linkCadastroText: {
    color: "#888",
    fontSize: 14,
  },
  linkDestaque: {
    color: "#d62828",
    fontWeight: "bold",
  },
});