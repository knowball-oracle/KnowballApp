import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function Protocolo() {
  const { protocolo } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#111" }}>
      <Text style={{ color: "#ccc", fontSize: 20, marginBottom: 10 }}>
        Protocolo da denúncia:
      </Text>
      <Text style={{ color: "#d62828", fontSize: 28, fontWeight: "bold" }}>
        #{protocolo}
      </Text>
    </View>
  );
}
