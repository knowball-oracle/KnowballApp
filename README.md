# ⚽ Knowball — Sistema Anti-Manipulação no Futebol de Base

Aplicativo mobile para denúncias de manipulação em partidas das categorias de base do futebol brasileiro masculino, integrando um backend Spring Boot e o **Oracle APEX como sistema anti-manipulação com regras de negócio em PL/SQL**.

---

## 📘 O Problema

Manipulações e fraudes em campeonatos de base (suborno de árbitros, conluio entre equipes, acerto de placares) comprometem a integridade dos torneios, reduzem a motivação dos jovens atletas e afetam a credibilidade dos clubes. Faltam canais estruturados para denúncia segura e mecanismos inteligentes de triagem.

## 💡 A Solução

O **Knowball** oferece:

1. **Canal de denúncia** com protocolo oficial rastreável, acessível via app mobile
2. **Triagem automática anti-manipulação** no Oracle APEX, que calcula um **score de risco (0-100)** por árbitro via **procedure PL/SQL** e classifica em três níveis: `LIBERADO`, `ALERTA`, `BLOQUEADO`
3. **Bloqueio automático** de novas denúncias contra árbitros já sob alto escrutínio (score ≥70), evitando abuso do sistema
4. **Área administrativa** para a comissão disciplinar acompanhar casos, avançar status, julgar vereditos e consultar auditoria

O Oracle APEX é **peça central** da solução: sem ele, o app **não consegue criar denúncias** — toda nova denúncia passa obrigatoriamente pela verificação do APEX.

---

## 🏗️ Arquitetura

```
┌─────────────────────┐        ┌──────────────────────┐
│  App React Native   │◄──────►│  Spring Boot API     │
│  (Expo Router)      │        │  (JWT RSA + Oracle)  │
│                     │        │  knowball-api        │
└──────────┬──────────┘        └──────────────────────┘
           │
           │    ┌────────────────────────────────┐
           └───►│  Oracle APEX (ORDS)            │
                │  - Procedure PL/SQL (score)    │
                │  - Sequence (protocolo)        │
                │  - Auditoria (rastreabilidade) │
                └────────────────────────────────┘
```

- **Backend Spring Boot** (knowball-api): persistência principal de campeonatos, partidas, árbitros, escalações e denúncias. Autenticação JWT com chaves RSA assimétricas.
- **Oracle APEX**: lógica anti-manipulação (procedure `CALCULAR_SCORE_ARBITRO`), geração de protocolos (sequence), auditoria de verificações.
- **App React Native**: consome ambos. Toda denúncia passa primeiro pelo APEX antes de ser registrada.

---

## 🔐 Oracle APEX — Sistema Anti-Manipulação

### Regra de Negócio (PL/SQL)

A procedure `CALCULAR_SCORE_ARBITRO` calcula o score de risco de um árbitro com pesos diferenciados:

| Critério | Peso |
|---|---|
| Denúncia `NEW` nos últimos 7 dias | **50** |
| Denúncia `UNDER_REVIEW` (em análise) | **30** |
| Denúncia antiga (>90 dias, qualquer status) | **10** |

O score final é limitado a 100 e classificado:

- **0-39** → 🟢 `LIBERADO`
- **40-69** → 🟡 `ALERTA`
- **70-100** → 🔴 `BLOQUEADO` (novas denúncias bloqueadas automaticamente)

### Endpoints REST do APEX (ORDS)

| Método | Endpoint | Função |
|---|---|---|
| `GET` | `/knowball/verificar/{arbitro_id}` | Roda a procedure, calcula score, registra auditoria |
| `POST` | `/knowball/registrar` | Gera protocolo via sequence e persiste denúncia |
| `GET` | `/knowball/minhas/{email}` | Retorna denúncias do usuário (filtro por email) |
| `GET` | `/knowball/ranking` | Top 5 árbitros mais denunciados (agregado) |
| `GET` | `/knowball/auditoria` | Últimas 50 verificações registradas |

### Dependência do APEX

A tela `denuncia.jsx` chama `verificarElegibilidade()` **antes** de registrar qualquer denúncia. Se o APEX estiver indisponível, a denúncia é abortada com mensagem explícita ao usuário. **Sem APEX, o app não funciona.**

---

## 📱 Telas do App

| Tela | Descrição | Acesso |
|---|---|---|
| **Início** | Home com navegação principal | Público |
| **Login / Cadastro** | Autenticação JWT | Público |
| **Nova Denúncia** | Formulário com verificação APEX em tempo real | USER + ADMIN |
| **Meus Protocolos** | Denúncias do usuário logado (filtro via APEX) | USER |
| **Todas as Denúncias** | Listagem completa com filtro por status | ADMIN |
| **Árbitros** | CRUD completo com seletor de status funcional | ADMIN |
| **Campeonatos** | CRUD completo com seletor de categoria | ADMIN |
| **Central de Integridade** | Ranking de risco (APEX) | ADMIN |
| **Auditoria APEX** | Log de verificações | ADMIN |
| **Sobre** | Informações do projeto e equipe | Público |
| **Sucesso** | Confirmação de denúncia com protocolo | USER |

---

## ✅ Funcionalidades

### Autenticação
- JWT com chave RSA assimétrica (Spring Security)
- Persistência de sessão com AsyncStorage
- Roles `ROLE_ADMIN` e `ROLE_USER` com permissões distintas
- Tela APEX completamente bloqueada para USER (tab escondida + check interno)

### CRUD completo (integrado à API)
- **Árbitros** — criar, listar, editar (com status ACTIVE/SUSPENDED/INACTIVE), excluir
- **Campeonatos** — criar, listar, editar (com categoria SUB_13/15/17/20), excluir
- **Denúncias** — criar (com verificação APEX), listar (filtrada por role), avançar status (NEW → UNDER_REVIEW → RESOLVED), definir veredito (POSITIVE/NEUTRAL/NEGATIVE), excluir

### Filtro de visão USER vs ADMIN
- **USER** vê apenas as próprias denúncias, consumindo o endpoint `/minhas/{email}` do APEX
- **ADMIN** vê todas as denúncias do sistema, consumindo `/reports` do Spring Boot
- Tela de Protocolos tem título e contador dinâmicos ("Meus Protocolos" vs "Todas as Denúncias")
- Filtros por status (Novas / Em análise / Resolvidas / Todas) com chips horizontais

### Tema claro/escuro
- Implementado via Context API (`ThemeContext`)
- Alternância manual pelo botão na tela Sobre
- Todas as telas usam `useTheme()` — zero cores hardcoded

### Estados de carregamento
- Indicators em todas as queries
- Invalidação automática via TanStack Query (`invalidateQueries`)
- Pull-to-refresh nas listas

---

## 💾 Stack Técnica

### Mobile
- **React Native** + **Expo** ~52
- **Expo Router** ~4 (navegação declarativa)
- **TanStack Query** (estado assíncrono)
- **Axios** (HTTP client com interceptor JWT)
- **AsyncStorage** (persistência de sessão)
- **Ionicons** (ícones)

### Backend API (projeto separado)
- **Spring Boot 3** (Java 17)
- **Spring Security + OAuth2 Resource Server** (JWT RSA)
- **Spring Data JPA** + **Oracle Database**
- **Flyway** (versionamento do schema)
- **HATEOAS** (Richardson Maturity Model Level 3)
- **Swagger / OpenAPI**
- Repositório: [knowball-oracle/knowball-api](https://github.com/knowball-oracle/knowball-api)

### Oracle APEX
- **Oracle Autonomous Database** (Free Tier)
- **PL/SQL** (procedure de scoring)
- **ORDS** (exposição REST dos endpoints)

---

## 🏛️ Arquitetura do Código Mobile

```
KnowballApp/
├── app/                         # Telas (Expo Router)
│   ├── _layout.jsx              # Tab navigator + providers
│   ├── index.jsx                # Home
│   ├── login.jsx
│   ├── register.jsx
│   ├── auth.jsx                 # Dashboard do usuário logado
│   ├── denuncia.jsx             # Fluxo APEX-first
│   ├── user.jsx                 # Confirmação com protocolo
│   ├── historico.jsx            # Protocolos com filtro USER/ADMIN
│   ├── arbitros.jsx             # CRUD árbitros
│   ├── campeonatos.jsx          # CRUD campeonatos
│   ├── apex.jsx                 # Central de Integridade (ranking)
│   ├── auditoria.jsx            # Log de verificações APEX
│   └── sobre.jsx                # Sobre + alternador de tema
├── services/                    # Camada de acesso HTTP
│   ├── api.js                   # Instância axios + interceptor JWT
│   ├── authService.js           # Login / register / logout
│   ├── apexService.js           # 5 endpoints do Oracle APEX
│   ├── reportService.js         # CRUD denúncias (Spring Boot)
│   ├── refereeService.js        # CRUD árbitros (Spring Boot)
│   ├── championshipService.js   # CRUD campeonatos (Spring Boot)
│   └── gameService.js           # Partidas e participações
├── context/                     # Estado global
│   ├── AuthContext.jsx          # Token, email, role, isAdmin
│   └── ThemeContext.jsx         # Tema claro/escuro
└── providers/
    └── QueryProvider.jsx        # TanStack Query client
```

**Separação de responsabilidades:** telas não contêm chamadas HTTP nem regras de negócio. Tudo passa pelos services. Hooks do TanStack Query isolados em cada tela consumindo os services.

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Expo Go no celular **ou** Android Studio com emulador
- **API Spring Boot rodando localmente** ([knowball-api](https://github.com/knowball-oracle/knowball-api))
- Conexão com Oracle APEX (já hospedado no Oracle Cloud, URL hardcoded no `apexService.js`)

### 1. Subir a API Spring Boot

```bash
git clone https://github.com/knowball-oracle/knowball-api.git
cd knowball-api
./mvnw spring-boot:run
```

A API sobe em `http://localhost:8080`. O Flyway cria o schema automaticamente. Confira em `http://localhost:8080/swagger-ui.html`.

### 2. Subir o app mobile

```bash
git clone https://github.com/knowball-oracle/KnowballApp.git
cd KnowballApp
npm install
npx expo start
```

Pressione `a` para abrir no emulador Android. A URL `http://10.0.2.2:8080` no `services/api.js` é o alias que o emulador usa pra acessar o `localhost` do host.

> ⚠️ Se for rodar em celular físico via Expo Go, troque `10.0.2.2` pelo IP da sua máquina na rede local (`ipconfig` no Windows, `ifconfig` no Linux/Mac).

### 3. Credenciais iniciais

A API cria automaticamente um usuário ADMIN e um USER via Flyway (ver `src/main/resources/db/migration` no knowball-api). Consulte o repositório da API para as credenciais.

---

## 🎥 Demonstração em Vídeo

[🎬 Assista no YouTube](https://youtu.be/SEU-LINK-AQUI)

**Tópicos demonstrados:**
- Autenticação JWT real com persistência
- Denúncia bloqueada pelo Oracle APEX em tempo real
- Protocolo oficial gerado via sequence PL/SQL
- Central de Integridade com ranking de risco
- Auditoria de verificações
- CRUD completo de árbitros e campeonatos
- Filtro USER vs ADMIN na tela de protocolos
- Avanço de status com veredito da comissão
- Tema claro/escuro

---

## 👥 Equipe DevAvatar

| Nome | RM | GitHub | LinkedIn |
|---|---|---|---|
| **Patrick Castro Quintana** | RM559271 | [@castropatrick](https://github.com/castropatrick) | [LinkedIn](https://www.linkedin.com/in/patrick-castro-839aa2273/) |
| **Gabriel Oliveira Rossi** | RM560967 | [@GabrielRossi01](https://github.com/GabrielRossi01) | [LinkedIn](https://www.linkedin.com/in/gabriel-oliveira-rossi-155baa324/) |
| **Rodrigo Naoki Yamasaki** | RM560759 | [@RodrygoYamasaki](https://github.com/RodrygoYamasaki) | [LinkedIn](https://www.linkedin.com/in/rodrigo-yamasaki-74a3b1324/) |

---

## 🏫 Contexto Acadêmico

**FIAP** — Mobile Application Development — **Sprint 3 (2026)**

---

## 📄 Licença

Projeto acadêmico. Sem fins comerciais.

© 2026 — **Knowball** | FIAP | Oracle
