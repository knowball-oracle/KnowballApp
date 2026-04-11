import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

export async function login(email, password) {
  const response = await api.post("/auth/login", { email, password });
  const { token, name, role } = response.data;
  await AsyncStorage.setItem("token", token);
  await AsyncStorage.setItem("userEmail", email);
  await AsyncStorage.setItem("userName", name);
  await AsyncStorage.setItem("userRole", role);
  return response.data;
}

export async function register(name, email, password) {
  const response = await api.post("/auth/register", { name, email, password });
  const { token, role } = response.data;
  await AsyncStorage.setItem("token", token);
  await AsyncStorage.setItem("userEmail", email);
  await AsyncStorage.setItem("userName", name);
  await AsyncStorage.setItem("userRole", role);
  return response.data;
}

export async function logout() {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("userEmail");
  await AsyncStorage.removeItem("userName");
  await AsyncStorage.removeItem("userRole");
}

export async function getToken() {
  return await AsyncStorage.getItem("token");
}

export async function getUserRole() {
  return await AsyncStorage.getItem("userRole");
}

export async function isAuthenticated() {
  const token = await AsyncStorage.getItem("token");
  return !!token;
}
