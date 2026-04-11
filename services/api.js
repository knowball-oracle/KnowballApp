import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

//URL PREVIA ANTES DE TROCAR PARA O FLYWAY
const BASE_URL = "http://10.0.2.2:8080";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
