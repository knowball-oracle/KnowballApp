import { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";

const ThemeContext = createContext({});

export const cores = {
  dark: {
    fundo: "#111111",
    fundoCard: "#1a1a1a",
    texto: "#ffffff",
    textoSecundario: "#cccccc",
    textoMuted: "#888888",
    borda: "#333333",
    primario: "#d62828",
    input: "#1a1a1a",
    tabBar: "#1a1a1a",
  },
  light: {
    fundo: "#f5f5f5",
    fundoCard: "#ffffff",
    texto: "#111111",
    textoSecundario: "#333333",
    textoMuted: "#666666",
    borda: "#dddddd",
    primario: "#d62828",
    input: "#ffffff",
    tabBar: "#ffffff",
  },
};

export function ThemeProvider({ children }) {
  const esquemaSistema = useColorScheme();
  const [tema, setTema] = useState(esquemaSistema || "dark");

  function alternarTema() {
    setTema((atual) => (atual === "dark" ? "light" : "dark"));
  }

  return (
    <ThemeContext.Provider value={{ tema, alternarTema, cores: cores[tema] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
