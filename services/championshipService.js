import api from "./api";

export async function listarCampeonatos() {
  const { data } = await api.get("/championships");
  return data._embedded?.championshipList || [];
}

export async function criarCampeonato(campeonato) {
  const { data } = await api.post("/championships", campeonato);
  return data;
}

export async function atualizarCampeonato(id, campeonato) {
  const { data } = await api.put(`/championships/${id}`, campeonato);
  return data;
}

export async function excluirCampeonato(id) {
  await api.delete(`/championships/${id}`);
}
