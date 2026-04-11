import axios from "axios";

const APEX_URL = "https://gff701c74196926-knowballapex.adb.sa-saopaulo-1.oraclecloudapps.com/ords/knowball/knowball";

const apexApi = axios.create({
  baseURL: APEX_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Origin": "https://oracleapex.com",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  },
});

export async function buscarEstatisticas() {
  const response = await apexApi.get("/stats");
  return response.data.items;
}

export async function registrarDenunciaApex(protocolo, status, conteudo) {
  const response = await apexApi.post("/stats", {
    protocolo,
    status,
    conteudo,
  });
  return response.data;
}