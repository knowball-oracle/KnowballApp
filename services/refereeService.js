import api from "./api";

export async function listarArbitros() {
  const response = await api.get("/referees");
  return response.data._embedded.refereeList;
}

export async function buscarArbitroPorId(id) {
  const response = await api.get(`/referees/${id}`);
  return response.data;
}

export async function criarArbitro(arbitro) {
  const response = await api.post("/referees", arbitro);
  return response.data;
}

export async function atualizarArbitro(id, arbitro) {
  const response = await api.put(`/referees/${id}`, arbitro);
  return response.data;
}

export async function excluirArbitro(id) {
  await api.delete(`/referees/${id}`);
}

export async function listarArbitrosPorPartida(gameId) {
  const response = await api.get(`/refereeing/game/${gameId}`);
  const lista = response.data._embedded?.refereeingList || [];
  return lista.map((r) => r.referee);
}