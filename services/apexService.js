import axios from "axios";

const APEX_BASE =
  "https://gff701c74196926-knowballapex.adb.sa-saopaulo-1.oraclecloudapps.com/ords/knowball/knowball";

const apexApi = axios.create({
  baseURL: APEX_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Origin: "https://oracleapex.com",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  },
});

export async function verificarElegibilidade(arbitroId) {
  const { data } = await apexApi.get(`/verificar/${arbitroId}`);
  return data;
}

export async function registrarDenunciaApex(arbitroId, nomeArbitro, conteudo) {
  const { data } = await apexApi.post("/registrar", {
    arbitro_id: arbitroId,
    nome_arbitro: nomeArbitro,
    conteudo,
  });
  return data;
}

export async function buscarAuditoria() {
  const { data } = await apexApi.get("/auditoria");
  return data.items || [];
}

export async function buscarRanking() {
  const { data } = await apexApi.get("/ranking");
  return data.items || [];
}
