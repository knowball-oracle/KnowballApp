import {Text, StyleSheet, View, Image, TouchableOpacity, Linking, ScrollView,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import versionInfo from "../assets/version.json";

export default function Sobre() {
  const { cores, tema, alternarTema } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image
          source={require("../assets/knowball-oracle.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <TouchableOpacity
          style={[
            styles.botaoTema,
            { backgroundColor: cores.fundoCard, borderColor: cores.borda },
          ]}
          onPress={alternarTema}
        >
          <Ionicons
            name={tema === "dark" ? "sunny-outline" : "moon-outline"}
            size={20}
            color={cores.primario}
          />
          <Text style={[styles.botaoTemaText, { color: cores.texto }]}>
            {tema === "dark" ? "Modo claro" : "Modo escuro"}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: cores.texto }]}>Sobre o App</Text>
        <Text style={[styles.text, { color: cores.textoSecundario }]}>
          O Knowball é uma aplicação criada para combater manipulações e fraudes
          no futebol brasileiro masculino nas categorias de base, permitindo
          denúncias seguras. Essas manipulações podem incluir suborno de árbitros,
          conluio entre equipes, pressão indevida à atletas e acerto de placares.
          Tal situação ameaça a integridade dos campeonatos, reduz a motivação dos
          jovens atletas e compromete a credibilidade dos clubes.
        </Text>

        {/* CARD DE VERSÃO — RUBRICA: Tela Sobre com identificação da versão */}
        <View
          style={[
            styles.versionCard,
            { backgroundColor: cores.fundoCard, borderColor: cores.borda },
          ]}
        >
          <View style={styles.versionHeader}>
            <Ionicons name="git-commit-outline" size={18} color={cores.primario} />
            <Text style={[styles.versionTitle, { color: cores.texto }]}>
              Versão Publicada
            </Text>
          </View>
          <View style={styles.versionRow}>
            <Text style={[styles.versionLabel, { color: cores.textoMuted }]}>
              Versão:
            </Text>
            <Text style={[styles.versionValue, { color: cores.texto }]}>
              {versionInfo.appVersion}
            </Text>
          </View>
          <View style={styles.versionRow}>
            <Text style={[styles.versionLabel, { color: cores.textoMuted }]}>
              Commit:
            </Text>
            <Text style={[styles.versionValue, { color: cores.primario, fontFamily: "monospace" }]}>
              {versionInfo.commitHash}
            </Text>
          </View>
          <View style={styles.versionRow}>
            <Text style={[styles.versionLabel, { color: cores.textoMuted }]}>
              Build:
            </Text>
            <Text style={[styles.versionValue, { color: cores.textoSecundario, fontSize: 11 }]}>
              {new Date(versionInfo.buildDate).toLocaleString("pt-BR")}
            </Text>
          </View>
        </View>

        <Text style={[styles.subtitle, { color: cores.primario }]}>
          Equipe de Desenvolvimento
        </Text>

        <View style={styles.row}>
          <View style={styles.member}>
            <Image
              source={require("../assets/1761361880310.jpg")}
              style={styles.avatar}
            />
            <Text style={[styles.name, { color: cores.texto }]}>
              Patrick Castro
            </Text>
            <View style={styles.icons}>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL("https://github.com/castropatrick")
                }
              >
                <Ionicons name="logo-github" size={20} color={cores.texto} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    "https://www.linkedin.com/in/patrick-castro-839aa2273/",
                  )
                }
              >
                <Ionicons name="logo-linkedin" size={20} color="#0e76a8" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.member}>
            <Image
              source={require("../assets/1760106364040.png")}
              style={styles.avatar}
            />
            <Text style={[styles.name, { color: cores.texto }]}>
              Gabriel Rossi
            </Text>
            <View style={styles.icons}>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL("https://github.com/GabrielRossi01")
                }
              >
                <Ionicons name="logo-github" size={20} color={cores.texto} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    "https://www.linkedin.com/in/gabriel-oliveira-rossi-155baa324/",
                  )
                }
              >
                <Ionicons name="logo-linkedin" size={20} color="#0e76a8" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.member}>
            <Image
              source={require("../assets/1730664856258.jpg")}
              style={styles.avatar}
            />
            <Text style={[styles.name, { color: cores.texto }]}>
              Rodrigo Yamasaki
            </Text>
            <View style={styles.icons}>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL("https://github.com/RodrygoYamasaki")
                }
              >
                <Ionicons name="logo-github" size={20} color={cores.texto} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    "https://www.linkedin.com/in/rodrigo-yamasaki-74a3b1324/",
                  )
                }
              >
                <Ionicons name="logo-linkedin" size={20} color="#0e76a8" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={[styles.footer, { color: cores.textoMuted }]}>
          FIAP • Mobile Application Development • 2026
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 250,
    height: 90,
    marginBottom: 15,
  },
  botaoTema: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  botaoTemaText: {
    fontWeight: "600",
    fontSize: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  text: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 25,
  },
  versionCard: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 30,
  },
  versionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  versionTitle: {
    fontWeight: "bold",
    fontSize: 15,
  },
  versionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  versionLabel: {
    fontSize: 13,
  },
  versionValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 25,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 30,
  },
  member: {
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
  },
  name: {
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 6,
    textAlign: "center",
  },
  icons: {
    flexDirection: "row",
    gap: 8,
  },
  footer: {
    marginTop: 10,
    fontSize: 13,
  },
});