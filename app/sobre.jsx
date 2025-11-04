import { Text, StyleSheet, View, Image, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function Sobre() {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../assets/knowball-oracle.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Sobre o App</Text>
      <Text style={styles.text}>
        O Knowball é uma aplicação criada para combater manipulações e fraudes no futebol brasileiro
        masculino nas categorias de base, permitindo denúncias seguras.

        Essas manipulações podem incluir suborno de árbitros, conluio entre equipes, pressão indevida à atletas e acerto de placares. 
        Tal situação ameaça a integridade dos campeonatos, reduz a motivação dos jovens atletas e compromete a credibilidade dos clubes.
      </Text>

      <Text style={styles.subtitle}>Equipe de Desenvolvimento</Text>

      <View style={styles.row}>

        <View style={styles.member}>
          <Image source={require("../assets/1761361880310.jpg")} style={styles.avatar} />
          <Text style={styles.name}>Patrick Castro</Text>
          <View style={styles.icons}>
            <TouchableOpacity onPress={() => Linking.openURL("https://github.com/castropatrick")}>
              <Ionicons name="logo-github" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL("https://www.linkedin.com/in/patrick-castro-839aa2273/")}>
              <Ionicons name="logo-linkedin" size={20} color="#0e76a8" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.member}>
          <Image source={require("../assets/1760106364040.png")} style={styles.avatar} />
          <Text style={styles.name}>Gabriel Rossi</Text>
          <View style={styles.icons}>
            <TouchableOpacity onPress={() => Linking.openURL("https://github.com/GabrielRossi01")}>
              <Ionicons name="logo-github" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL("https://www.linkedin.com/in/gabriel-oliveira-rossi-155baa324/")}>
              <Ionicons name="logo-linkedin" size={20} color="#0e76a8" />
            </TouchableOpacity>
          </View>
        </View>


        <View style={styles.member}>
          <Image source={require("../assets/1730664856258.jpg")} style={styles.avatar} />
          <Text style={styles.name}>Rodrigo Yamasaki</Text>
          <View style={styles.icons}>
            <TouchableOpacity onPress={() => Linking.openURL("https://github.com/RodrygoYamasaki")}>
              <Ionicons name="logo-github" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL("https://www.linkedin.com/in/rodrigo-yamasaki-74a3b1324/")}>
              <Ionicons name="logo-linkedin" size={20} color="#0e76a8" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Text style={styles.footer}>FIAP • Mobile Application Development • 2025</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 250,
    height: 90,
    marginBottom: 35,
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 15,
  },
  text: {
    color: "#ccc",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#d62828",
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
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 6,
  },
  icons: {
    flexDirection: "row",
    gap: 8,
  },
  footer: {
    color: "#777",
    marginTop: 10,
    fontSize: 13,
  },
});
