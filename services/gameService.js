import api from "./api";

export async function listarPartidas() {
  const response = await api.get("/games");
  return response.data._embedded.gameList;
}

export async function buscarPartidaPorId(id) {
  const response = await api.get(`/games/${id}`);
  return response.data;
}