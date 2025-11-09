# ⚽ Knowball – Sistema de Denúncias Anônimas

## 📘 Descrição do Projeto

O **Knowball** é um aplicativo mobile desenvolvido em **React Native com Expo** que visa **combater manipulações e fraudes no futebol brasileiro masculino nas categorias de base**.

A solução oferece um canal seguro e simples para **denúncias anônimas** com **integração completa de API REST**, permitindo registro, consulta e gerenciamento de denúncias, fortalecendo a integridade esportiva.

---

## 🎯 Objetivos

- Facilitar o registro de denúncias de forma segura e intuitiva
- Integrar com API REST para operações CRUD completas
- Gerenciar denúncias através de área administrativa protegida
- Criar interface funcional e responsiva
- Proporcionar navegação fluida entre telas com Expo Router

---

## 📱 Funcionalidades Principais

### 🏠 Tela Inicial (`index.jsx`)
- Coleta **nome** e **e-mail** do denunciante
- **Validação em tempo real** de campos obrigatórios
- Validação de formato de e-mail
- Direciona para o formulário de denúncia
- Exibe logotipo Knowball + Oracle

### 📝 Tela de Denúncia (`denuncia.jsx`)
- Formulário completo com validações:
  - Seleção de categoria (Sub-13, Sub-15, Sub-17, Sub-20)
  - Informações da partida e árbitro
  - Validação de data (formato DD/MM/AAAA)
  - Relato com contador de caracteres (mínimo 20)
- **Integração com API REST** via POST
- Gera **protocolo único** automático
- Loading visual durante envio
- Feedback de sucesso/erro ao usuário

### 👤 Tela de Confirmação (`user.jsx`)
- Exibe mensagem de sucesso após envio
- Mostra **número de protocolo gerado**
- Informações sobre próximos passos
- Opções de navegação (nova denúncia ou voltar)

### 🔐 Tela de Autenticação (`auth.jsx`)
- Área restrita protegida por código
- **Integração com API** para verificar denúncias
- Validação de acesso administrativo
- Código de demonstração: **1234**

### 📋 Histórico de Protocolos (`historico.jsx`)
- **Integração com API REST** via GET
- Lista todas as denúncias registradas
- Exibição em cards com informações principais
- **Pull-to-refresh** para atualizar lista
- Ver detalhes completos de cada denúncia
- **Operações DELETE:**
  - Exclusão individual de denúncias
  - Exclusão em lote (limpar tudo)
- Confirmações de segurança antes de excluir
- Tela vazia personalizada quando não há denúncias

### ℹ️ Tela Sobre (`sobre.jsx`)
- Informações sobre o projeto
- Apresentação da equipe de desenvolvimento
- Links diretos para **GitHub** e **LinkedIn** dos integrantes

---

## 🔌 Integração com API

### **API Utilizada:** MockAPI
**Base URL:** `https://6909f3041a446bb9cc20b45c.mockapi.io`

### **Endpoints Implementados:**

| Método | Endpoint | Descrição | Usado em |
|--------|----------|-----------|----------|
| `GET` | `/denuncias` | Lista todas as denúncias | historico.jsx, auth.jsx |
| `POST` | `/denuncias` | Cria nova denúncia | denuncia.jsx |
| `DELETE` | `/denuncias/:id` | Exclui denúncia específica | historico.jsx |

### **Estrutura de Dados:**
```json
{
  "id": "1",
  "nome": "João Silva",
  "email": "joao@email.com",
  "categoria": "Sub-17",
  "partida": "Corinthians x Palmeiras",
  "data": "15/11/2025",
  "arbitro": "Carlos Roberto",
  "relato": "Descrição detalhada da denúncia...",
  "protocolo": "123456",
  "dataEnvio": "2025-11-09T10:30:00.000Z"
}
```

---

## 💾 Tecnologias Utilizadas

- [React Native](https://reactnative.dev/) - Framework mobile
- [Expo](https://expo.dev/) ~52.0.23 - Plataforma de desenvolvimento
- [Expo Router](https://expo.github.io/router/docs) ~4.0.17 - Navegação
- [Axios](https://axios-http.com/) ^1.7.9 - Cliente HTTP para API
- [Expo Vector Icons](https://icons.expo.fyi/) - Ícones (Ionicons)
- React Hooks (useState, useFocusEffect, useCallback)

---

## 🏗️ Arquitetura do Código

```
📦 Knowball
├── 📱 app/
│   ├── constants.js          # Constantes e configurações da API
│   ├── _layout.jsx           # Configuração de navegação (Tabs)
│   ├── index.jsx             # Tela inicial (validações)
│   ├── denuncia.jsx          # Formulário com integração API
│   ├── user.jsx              # Confirmação de envio
│   ├── auth.jsx              # Autenticação área restrita
│   ├── historico.jsx         # Lista e gerenciamento (CRUD)
│   └── sobre.jsx             # Informações do app
├── 🖼️ assets/
│   ├── knowball-oracle.png   # Logo principal
│   ├── 1761361880310.jpg     # Foto Patrick
│   ├── 1760106364040.png     # Foto Gabriel
│   └── 1730664856258.jpg     # Foto Rodrigo
└── 📄 package.json
```

### **Organização e Boas Práticas:**
✅ Separação de responsabilidades (constants.js para API)  
✅ Validações centralizadas e reutilizáveis  
✅ Nomenclatura clara e padronizada  
✅ Código limpo e bem estruturado  
✅ Indentação consistente  
✅ Tratamento de erros em todas requisições  
✅ Loading states e feedback visual  
✅ Componentes funcionais com hooks  

---

## 🚀 Como Executar o Projeto

### **Pré-requisitos:**
- Node.js (v16 ou superior)
- npm ou yarn
- Expo Go (app no celular) ou Emulador Android/iOS

### **Instalação:**

1. Clone o repositório:
   ```bash
   git clone https://github.com/castropatrick/knowball-mobile.git
   cd knowball-mobile
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o aplicativo:
   ```bash
   npx expo start
   ```

4. **Opções de execução:**
   - Pressione `a` para Android
   - Pressione `i` para iOS
   - Escaneie o QR Code com **Expo Go** no celular

---

## 🎥 Demonstração em Vídeo

**Assista à demonstração completa das funcionalidades:**  
[🎬 Vídeo no YouTube](https://www.youtube.com/watch?v=B3ITeh9_UTI)

**Demonstrado no vídeo:**
- ✅ Criação de denúncias (POST)
- ✅ Validações de formulário
- ✅ Listagem de denúncias (GET)
- ✅ Exclusão de denúncias (DELETE)
- ✅ Autenticação administrativa
- ✅ Pull-to-refresh
- ✅ Navegação completa
- ✅ CRUD funcional integrado com API

---

## 👥 Equipe de Desenvolvimento

| Nome | RM | GitHub | LinkedIn |
|------|-------|---------|----------|
| **Patrick Castro Quintana** | RM559271 | [@castropatrick](https://github.com/castropatrick) | [LinkedIn](https://www.linkedin.com/in/patrick-castro-839aa2273/) |
| **Gabriel Oliveira Rossi** | RM560967 | [@gabrielrossi01](https://github.com/gabrielrossi01) | [LinkedIn](https://www.linkedin.com/in/gabriel-oliveira-rossi-155baa324/) |
| **Rodrigo Naoki Yamasaki** | RM560759 | [@RodrygoYamasaki](https://github.com/RodrygoYamasaki) | [LinkedIn](https://www.linkedin.com/in/rodrigo-yamasaki-74a3b1324/) |

---

## 🏫 Instituição

**FIAP – Mobile Application Development (2025)**  
**Professor:** Fernando Pinéo de Abreu

Projeto desenvolvido como parte da disciplina de **Mobile Application Development**, com foco em:
- Integração com API REST (40 pontos)
- Protótipo funcional completo (20 pontos)
- Arquitetura de código profissional (20 pontos)
- Demonstração em vídeo (20 pontos)

---

## ✨ Destaques Técnicos

### **Integração com API:**
- Requisições HTTP reais (GET, POST, DELETE)
- Tratamento de erros e timeout
- Loading states em todas operações
- Feedback visual constante ao usuário

### **Validações:**
- Email (formato válido)
- Data (formato DD/MM/AAAA)
- Campos obrigatórios
- Contador de caracteres no relato

### **UX/UI:**
- Design responsivo e profissional
- Paleta de cores consistente
- Ícones intuitivos (Ionicons)
- Animações e transições suaves
- Pull-to-refresh nativo

---

## 📊 Funcionalidades CRUD

| Operação | Método HTTP | Implementado | Tela |
|----------|-------------|--------------|------|
| **Create** | POST | ✅ | denuncia.jsx |
| **Read** | GET | ✅ | historico.jsx, auth.jsx |
| **Update** | PUT | ⚪ | - |
| **Delete** | DELETE | ✅ | historico.jsx |

---

## 🏁 Licença

Este projeto é de uso acadêmico e não possui fins comerciais.

© 2025 – **Knowball** | FIAP | Oracle

---

## 🚀 Melhorias Futuras

- [ ] Autenticação JWT real
- [ ] Upload de evidências (fotos/vídeos)
- [ ] Sistema de notificações
- [ ] Dashboard de estatísticas
- [ ] Exportação de relatórios
- [ ] Atualização de denúncias (PUT)
- [ ] Filtros e busca avançada
- [ ] Testes automatizados

---

**🦤🦤Desenvolvido pela equipe Knowball**
