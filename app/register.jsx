import {
  Text,
  TextInput,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { register } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const { setToken, setUserName, setUserRole } = useAuth();
  const { cores } = useTheme();

  async function handleRegister() {
    if (!nome.trim()) return Alert.alert("Atenção", "Digite seu nome");
    if (!email.trim()) return Alert.alert("Atenção", "Digite seu e-mail");
    if (!senha.trim() || senha.length < 6)
      return Alert.alert("Atenção", "Senha deve ter pelo menos 6 caracteres");

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
    <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <View style={styles.header}>
        <Ionicons name="person-add" size={80} color={cores.primario} />
        <Text style={[styles.title, { color: cores.texto }]}>Criar Conta</Text>
        <Text style={[styles.subtitle, { color: cores.textoSecundario }]}>
          Cadastre-se no Knowball
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: cores.input,
              color: cores.texto,
              borderColor: cores.borda,
            },
          ]}
          placeholder="Nome completo"
          placeholderTextColor={cores.textoMuted}
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: cores.input,
              color: cores.texto,
              borderColor: cores.borda,
            },
          ]}
          placeholder="E-mail"
          placeholderTextColor={cores.textoMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: cores.input,
              color: cores.texto,
              borderColor: cores.borda,
            },
          ]}
          placeholder="Senha (mínimo 6 caracteres)"
          placeholderTextColor={cores.textoMuted}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.botao, { backgroundColor: cores.primario }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoText}>Criar conta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkLogin}
          onPress={() => router.back()}
        >
          <Text style={{ color: cores.textoMuted, fontSize: 14 }}>
            Já tem conta?{" "}
            <Text style={{ color: cores.primario, fontWeight: "bold" }}>
              Entrar
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
  },
  form: {
    width: "100%",
  },
  input: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    fontSize: 16,
  },
  botao: {
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
});