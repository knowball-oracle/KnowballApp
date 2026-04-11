import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logout } from "../services/authService";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      const tokenSalvo = await AsyncStorage.getItem("token");
      const nomeSalvo = await AsyncStorage.getItem("userName");
      const emailSalvo = await AsyncStorage.getItem("userEmail");
      const roleSalva = await AsyncStorage.getItem("userRole");
      setToken(tokenSalvo);
      setUserName(nomeSalvo);
      setUserEmail(emailSalvo);
      setUserRole(roleSalva);
      setCarregando(false);
    }
    carregarDados();
  }, []);

  async function fazerLogout() {
    await logout();
    setToken(null);
    setUserName(null);
    setUserEmail(null);
    setUserRole(null);
  }

  function isAdmin() {
    return userRole === "ROLE_ADMIN";
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        userName,
        userEmail,
        userRole,
        carregando,
        fazerLogout,
        isAdmin,
        setToken,
        setUserName,
        setUserEmail,
        setUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}