import { Text, StyleSheet, Image, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { cores } = useTheme();
  const { token, userName, isAdmin } = useAuth();

  const LinkSobre = () => (
    <TouchableOpacity
      onPress={() => router.push("/sobre")}
      style={styles.linkSobre}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons
        name="information-circle-outline"
        size={16}
        color={cores.textoMuted}
      />
      <Text style={[styles.linkSobreText, { color: cores.textoMuted }]}>
        Sobre o projeto
      </Text>
    </TouchableOpacity>
  );

  if (token) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: cores.fundo }]}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/knowball-oracle.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={[styles.bemVindo, { color: cores.texto }]}>
          Olá, {userName}!
        </Text>
        <Text style={[styles.subtitle, { color: cores.textoSecundario }]}>
          Combate à manipulação no futebol brasileiro masculino nas categorias
          de base
        </Text>

        <TouchableOpacity
          style={[styles.botaoPrimario, { backgroundColor: cores.primario }]}
          onPress={() => router.push("/denuncia")}
        >
          <Ionicons name="warning-outline" size={22} color="#fff" />
          <Text style={styles.botaoPrimarioText}>Fazer uma denúncia</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoSecundario, { borderColor: cores.borda }]}
          onPress={() => router.push("/historico")}
        >
          <Ionicons
            name="document-text-outline"
            size={22}
            color={cores.primario}
          />
          <Text style={[styles.botaoSecundarioText, { color: cores.primario }]}>
            Meus protocolos
          </Text>
        </TouchableOpacity>

        {isAdmin() && (
          <TouchableOpacity
            style={[
              styles.botaoAdmin,
              { backgroundColor: cores.fundoCard, borderColor: cores.borda },
            ]}
            onPress={() => router.push("/arbitros")}
          >
            <Ionicons
              name="people-outline"
              size={22}
              color={cores.textoSecundario}
            />
            <Text
              style={[styles.botaoAdminText, { color: cores.textoSecundario }]}
            >
              Gerenciar árbitros
            </Text>
          </TouchableOpacity>
        )}

        <LinkSobre />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/knowball-oracle.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={[styles.subtitle, { color: cores.textoSecundario }]}>
        Combate à manipulação no futebol brasileiro masculino nas categorias de
        base
      </Text>

      <View style={styles.botoesContainer}>
        <TouchableOpacity
          style={[styles.botaoPrimario, { backgroundColor: cores.primario }]}
          onPress={() => router.push("/login")}
        >
          <Ionicons name="warning-outline" size={22} color="#fff" />
          <Text style={styles.botaoPrimarioText}>Quero fazer uma denúncia</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoSecundario, { borderColor: cores.borda }]}
          onPress={() => router.push("/login")}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={22}
            color={cores.primario}
          />
          <Text style={[styles.botaoSecundarioText, { color: cores.primario }]}>
            Área administrativa
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.rodape, { color: cores.textoMuted }]}>
        Sua identidade é protegida pelo protocolo de denúncia
      </Text>

      <LinkSobre />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 350,
    height: 120,
  },
  bemVindo: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    lineHeight: 23,
    textAlign: "center",
  },
  botoesContainer: {
    width: "100%",
    gap: 15,
  },
  botaoPrimario: {
    flexDirection: "row",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 15,
  },
  botaoPrimarioText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  botaoSecundario: {
    flexDirection: "row",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    marginBottom: 15,
  },
  botaoSecundarioText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  botaoAdmin: {
    flexDirection: "row",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    marginBottom: 15,
  },
  botaoAdminText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  rodape: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 20,
  },
  linkSobre: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 20,
    padding: 8,
  },
  linkSobreText: {
    fontSize: 13,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});