import { Text, TextInput, StyleSheet, Image, View, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";

export default function Home() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function handleContinuar() {
    if (!nome.trim() || nome.trim().length < 3) {
      Alert.alert("Atenção", "Nome deve ter pelo menos 3 caracteres");
      return;
    }
    if (!validarEmail(email)) {
      Alert.alert("Atenção", "E-mail inválido");
      return;
    }
    router.push({
      pathname: "/denuncia",
      params: { nome: nome.trim(), email: email.trim() },
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/knowball-oracle.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.subtitle}>
        Combate à manipulação no futebol brasileiro masculino nas categorias de base
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Digite seu nome"
        placeholderTextColor="#888"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.botao} onPress={handleContinuar}>
        <Text style={styles.botaoTexto}>Continuar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#111111",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 350,
    height: 120,
  },
  subtitle: {
    fontSize: 17,
    color: "#ccc",
    marginBottom: 25,
    lineHeight: 23,
    textAlign: "center",
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
  botao: {
    backgroundColor: "#d62828",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});