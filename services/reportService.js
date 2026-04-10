import api from "./api";

export async function listarDenuncias() {
  const response = await api.get("/reports");
  return response.data._embedded.reportList;
}

export async function buscarDenunciaPorId(id) {
  const response = await api.get(`/reports/${id}`);
  return response.data;
}

export async function criarDenuncia(denuncia) {
  const response = await api.post("/reports", denuncia);
  return response.data;
}

export async function atualizarStatusDenuncia(id, status) {
  const response = await api.put(`/reports/${id}/status`, { status });
  return response.data;
}