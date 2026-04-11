import {
  Text,
  TextInput,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { criarDenuncia } from "../services/reportService";
import {
  listarPartidas,
  listarParticipacoesPorPartida,
} from "../services/gameService";
import { listarArbitrosPorPartida } from "../services/refereeService";
import {
  verificarElegibilidade,
  registrarDenunciaApex,
} from "../services/apexService";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Denuncia() {
  const { token, userName } = useAuth();
  const { cores } = useTheme();
  const queryClient = useQueryClient();

  const [gameId, setGameId] = useState(null);
  const [refereeId, setRefereeId] = useState(null);
  const [refereeNome, setRefereeNome] = useState("");
  const [relato, setRelato] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [resultadoApex, setResultadoApex] = useState(null);

  const { data: partidas = [], isLoading: loadingPartidas } = useQuery({
    queryKey: ["partidas"],
    queryFn: listarPartidas,
    enabled: !!token,
  });
  const { data: arbitros = [], isLoading: loadingArbitros } = useQuery({
    queryKey: ["arbitrosPorPartida", gameId],
    queryFn: () => listarArbitrosPorPartida(gameId),
    enabled: !!gameId,
  });
  const { data: participacoes = [] } = useQuery({
    queryKey: ["participacoes", gameId],
    queryFn: () => listarParticipacoesPorPartida(gameId),
    enabled: !!gameId,
  });

  function selecionarArbitro(a) {
    setRefereeId(a.id);
    setRefereeNome(a.name);
    setResultadoApex(null);
  }

  async function handleEnviar() {
    if (!gameId) return Alert.alert("Atenção", "Selecione uma partida");
    if (!refereeId) return Alert.alert("Atenção", "Selecione um árbitro");
    if (relato.trim().length < 20)
      return Alert.alert("Atenção", "Relato deve ter pelo menos 20 caracteres");

    setVerificando(true);
    let elegibilidade;
    try {
      elegibilidade = await verificarElegibilidade(refereeId);
      setResultadoApex(elegibilidade);
    } catch (e) {
      setVerificando(false);
      return Alert.alert(
        "Oracle APEX indisponível",
        "Não é possível registrar denúncias sem o sistema de verificação anti-manipulação. Tente novamente mais tarde.",
      );
    }

    if (elegibilidade.status === "BLOQUEADO") {
      setVerificando(false);
      return Alert.alert(
        "🔴 Árbitro Bloqueado pelo APEX",
        `${elegibilidade.nome} possui score de risco ${elegibilidade.score}/100 (${elegibilidade.total_denuncias} denúncias). Novas denúncias estão temporariamente suspensas para este árbitro até análise da comissão.`,
      );
    }

    try {
      const apexResp = await registrarDenunciaApex(
        refereeId,
        elegibilidade.nome,
        relato.trim(),
      );
      await criarDenuncia({
        game: { id: gameId },
        referee: { id: refereeId },
        protocol: apexResp.protocolo,
        content: relato.trim(),
        date: new Date().toISOString().split("T")[0],
        status: "NEW",
        analysisResult: "NEUTRAL",
      });
      queryClient.invalidateQueries({ queryKey: ["denuncias"] });
      queryClient.invalidateQueries({ queryKey: ["auditoriaApex"] });
      queryClient.invalidateQueries({ queryKey: ["rankingApex"] });
      router.push({
        pathname: "/user",
        params: { nome: userName, protocolo: apexResp.protocolo },
      });
    } catch (e) {
      Alert.alert("Erro", "Falha ao registrar denúncia");
    } finally {
      setVerificando(false);
    }
  }

  function getNomePartida(p) {
    return `${p.place} — ${p.championship?.category}`;
  }

  if (!token) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: cores.fundo }]}
      >
        <View style={styles.center}>
          <Text style={{ color: cores.textoSecundario, marginBottom: 20 }}>
            Faça login para denunciar
          </Text>
          <TouchableOpacity
            style={[styles.botao, { backgroundColor: cores.primario }]}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.botaoText}>Fazer login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loadingPartidas) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: cores.fundo }]}
      >
        <View style={styles.center}>
          <ActivityIndicator size="large" color={cores.primario} />
        </View>
      </SafeAreaView>
    );
  }

  const corStatus =
    resultadoApex?.status === "BLOQUEADO"
      ? "#d62828"
      : resultadoApex?.status === "ALERTA"
        ? "#f4a261"
        : "#2a9d8f";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: cores.texto }]}>
          Nova Denúncia
        </Text>
        <Text style={[styles.usuario, { color: cores.textoMuted }]}>
          Denunciante: {userName}
        </Text>

        <Text style={[styles.label, { color: cores.textoSecundario }]}>
          Partida:
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 15 }}
        >
          {partidas.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.chip,
                { backgroundColor: cores.fundoCard, borderColor: cores.borda },
                gameId === p.id && {
                  backgroundColor: cores.primario,
                  borderColor: cores.primario,
                },
              ]}
              onPress={() => {
                setGameId(p.id);
                setRefereeId(null);
                setResultadoApex(null);
              }}
            >
              <Text
                style={{ color: cores.texto, fontWeight: "bold", fontSize: 13 }}
              >
                {getNomePartida(p)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {gameId && (
          <>
            <Text style={[styles.label, { color: cores.textoSecundario }]}>
              Árbitro:
            </Text>
            {loadingArbitros ? (
              <ActivityIndicator color={cores.primario} />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 15 }}
              >
                {arbitros.map((a) => (
                  <TouchableOpacity
                    key={a.id}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: cores.fundoCard,
                        borderColor: cores.borda,
                      },
                      refereeId === a.id && {
                        backgroundColor: cores.primario,
                        borderColor: cores.primario,
                      },
                    ]}
                    onPress={() => selecionarArbitro(a)}
                  >
                    <Text
                      style={{
                        color: cores.texto,
                        fontWeight: "bold",
                        fontSize: 13,
                      }}
                    >
                      {a.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </>
        )}

        {resultadoApex && (
          <View
            style={[
              styles.apexCard,
              { borderColor: corStatus, backgroundColor: cores.fundoCard },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Ionicons name="shield-checkmark" size={20} color={corStatus} />
              <Text style={{ color: corStatus, fontWeight: "bold" }}>
                Oracle APEX — Verificação
              </Text>
            </View>
            <Text style={{ color: cores.texto }}>
              Score de risco:{" "}
              <Text style={{ fontWeight: "bold", color: corStatus }}>
                {resultadoApex.score}/100
              </Text>
            </Text>
            <Text style={{ color: cores.texto }}>
              Status:{" "}
              <Text style={{ fontWeight: "bold", color: corStatus }}>
                {resultadoApex.status}
              </Text>
            </Text>
            <Text style={{ color: cores.textoMuted, fontSize: 12 }}>
              {resultadoApex.total_denuncias} denúncia(s) registrada(s)
            </Text>
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: cores.input,
              color: cores.texto,
              borderColor: cores.borda,
            },
          ]}
          placeholder="Relato (mínimo 20 caracteres)"
          placeholderTextColor={cores.textoMuted}
          value={relato}
          onChangeText={setRelato}
          multiline
          textAlignVertical="top"
        />
        <Text
          style={{
            color: cores.textoMuted,
            fontSize: 12,
            textAlign: "right",
            marginBottom: 15,
          }}
        >
          {relato.length} caracteres
        </Text>

        <TouchableOpacity
          style={[styles.botao, { backgroundColor: cores.primario }]}
          onPress={handleEnviar}
          disabled={verificando}
        >
          {verificando ? (
            <View
              style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
            >
              <ActivityIndicator color="#fff" />
              <Text style={styles.botaoText}>Consultando Oracle APEX...</Text>
            </View>
          ) : (
            <Text style={styles.botaoText}>Verificar e enviar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  usuario: {
    fontSize: 13,
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 15,
    marginBottom: 8,
    marginTop: 5,
  },
  chip: {
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
  },
  apexCard: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    marginBottom: 15,
  },
  input: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    height: 110,
    marginBottom: 5,
  },
  botao: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  botaoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
