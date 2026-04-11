import axios from "axios";
import api from "./api";

const APEX_BASE = "https://gff701c74196926-knowballapex.adb.sa-saopaulo-1.oraclecloudapps.com/ords/knowball/knowball";

const apexApi = axios.create({
  baseURL: APEX_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': 'https://oracleapex.com',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});

export async function buscarEstatisticas() {
  try {
    console.log("Tentando conectar ao APEX...");
    const response = await apexApi.get("/stats");
    console.log("APEX RESPONSE:", JSON.stringify(response.data));
    return response.data.items;
  } catch (error) {
    console.log("APEX ERROR:", error.message);
    console.log("APEX STATUS:", error.response?.status);
    console.log("APEX DATA:", JSON.stringify(error.response?.data));
    throw error;
  }
}

export async function sincronizarDenuncias() {
  // Busca denúncias reais da API do Gabriel
  const response = await api.get("/reports");
  const denuncias = response.data._embedded?.reportList || [];

  // Conta por status
  const contagem = {
    NEW: denuncias.filter(d => d.status === "NEW").length,
    UNDER_ANALYSIS: denuncias.filter(d => d.status === "UNDER_ANALYSIS").length,
    RESOLVED: denuncias.filter(d => d.status === "RESOLVED").length,
  };

  // Atualiza cada status no APEX
  for (const [status, total] of Object.entries(contagem)) {
    await apexApi.post("/sync", { status, total });
  }

  return contagem;
  
}

export async function verificarElegibilidade(arbitroId) {
  const response = await apexApi.get(`/verificar/${arbitroId}`);
  return response.data;
}