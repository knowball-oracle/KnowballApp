# ⚽ Knowball – Mobile App Development

## 📘 Descrição do Projeto
O **Knowball** é um aplicativo desenvolvido em **React Native com Expo** que visa **combater manipulações e fraudes no futebol brasileiro masculino nas categorias de base**.  
A solução oferece um canal seguro e simples para **denúncias anônimas e registradas localmente**, fortalecendo a integridade esportiva.

---

## 🎯 Objetivos
- Facilitar o registro de denúncias de forma segura e intuitiva.  
- Permitir armazenamento local e consulta posterior dos protocolos.  
- Criar uma interface funcional e coerente com o fluxo lógico de uso.  
- Proporcionar uma navegação fluida entre telas utilizando **Expo Router**.

---

## 📱 Funcionalidades Principais

### 🏠 Tela Inicial (`index.jsx`)
- Coleta o **nome** e **e-mail** do usuário.  
- Direciona para o formulário de denúncia.  
- Exibe o logotipo da solução (Knowball + Oracle).

### 📝 Tela de Denúncia (`denuncia.jsx`)
- Formulário completo com campos controlados por `useState`.  
- Permite escolher a categoria (Sub-13, Sub-15, Sub-17, Sub-20).  
- Gera **protocolo único** de denúncia.  
- Salva todas as denúncias localmente com **AsyncStorage**.

### 🧾 Tela de Protocolos (`protocolo.jsx`)
- Lista todas as denúncias armazenadas localmente.  
- Permite atualizar ou limpar os registros.  
- Utiliza `FlatList` e `Alert` para interação com o usuário.

### 👤 Tela de Usuário (`user.jsx`)
- Exibe mensagem de sucesso após envio da denúncia.  
- Mostra o **número de protocolo gerado** dinamicamente.

### ℹ️ Tela Sobre (`sobre.jsx`)
- Apresenta informações sobre o projeto e seus desenvolvedores.  
- Inclui links diretos para **GitHub** e **LinkedIn** da equipe.  

---

## 💾 Tecnologias Utilizadas
- [React Native](https://reactnative.dev/)  
- [Expo](https://expo.dev/)  
- [Expo Router](https://expo.github.io/router/docs)  
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/docs/install/)  
- [React Hooks (`useState`, `useEffect`)](https://react.dev/reference/react)  
- [Ionicons](https://icons.expo.fyi/Index)  

---

## 🧠 Estrutura do Projeto

```
📦 Knowball
├── app
│   ├── _layout.jsx
│   ├── index.jsx
│   ├── denuncia.jsx
│   ├── protocolo.jsx
│   ├── user.jsx
│   └── sobre.jsx
├── assets
│   ├── knowball-oracle.png
│   ├── 1732279396276.jpg
│   ├── 1760106364040.png
│   └── 1730664856258.jpg
└── package.json
```

---

## 🧭 Como Executar o Projeto

1. Clone o repositório:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o aplicativo:
   ```bash
   npx expo start
   ```

4. Escaneie o QR Code com o aplicativo **Expo Go** para abrir o app no seu celular.

---

## 👥 Equipe de Desenvolvimento

| Nome | RM | GitHub | LinkedIn |
|------|----|---------|----------|
| **Patrick Castro Quintana** | RM559271 | [castropatrick](https://github.com/castropatrick) | [LinkedIn](https://www.linkedin.com/in/patrick-castro-839aa2273/) |
| **Gabriel Oliveira Rossi** | RM560967 | [gabrielrossi01](https://github.com/gabrielrossi01) | [LinkedIn](https://www.linkedin.com/in/gabriel-oliveira-rossi-155baa324/) |
| **Rodrigo Naoki Yamasaki** | RM560759 | [RodrygoYamasaki](https://github.com/RodrygoYamasaki) | [LinkedIn](https://www.linkedin.com/in/rodrigo-yamasaki-74a3b1324/) |

---

## 🏫 Instituição
**FIAP – Mobile App Development (2025)**  
Prof. Fernando Pinéo de Abreu🦤🦤
Projeto desenvolvido como parte da disciplina de **Mobile Application Development**.

---

## 🏁 Licença
Este projeto é de uso acadêmico e não possui fins comerciais.  
© 2025 – Knowball | FIAP | Oracle
