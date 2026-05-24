<div align="center">

# 🏆 KnowBall

### Sistema Anti-Manipulação no Futebol de Base

**Sprint 4** · Mobile Application Development · FIAP 2026

[![React Native](https://img.shields.io/badge/React_Native-Expo_SDK_54-61DAFB?logo=react&logoColor=white)](https://expo.dev)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![Oracle APEX](https://img.shields.io/badge/Oracle_APEX-PL%2FSQL-F80000?logo=oracle&logoColor=white)](https://apex.oracle.com)
[![Firebase](https://img.shields.io/badge/Firebase-App_Distribution-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/products/app-distribution)

</div>

---

## 📋 Aviso

> ⚠️ **IMPORTANTE — LEIA ANTES DE TESTAR**
>
> O backend Spring Boot está hospedado no **Render (plano gratuito)**, que **hiberna após 15 minutos sem atividade**. Antes de testar o aplicativo, por favor **acorde a API** acessando o link abaixo no navegador e aguardando 30-60 segundos até a resposta:
>
> ### 🔗 [https://knowball-api.onrender.com](https://knowball-api.onrender.com)
>
> Se a página retornar qualquer resposta (mesmo um 404 ou tela em branco), a API está acordada. Após isso, o aplicativo funcionará normalmente.
>
> O Oracle APEX também pode ter um pequeno cold start na primeira chamada. Caso a primeira denúncia demore alguns segundos a mais, é por isso. As chamadas seguintes serão imediatas.

---

## 🎬 Demonstração

| Recurso | Link |
|---------|------|
| 🎥 **Vídeo de Apresentação (YouTube)** | [Link do vídeo](https://www.youtube.com/watch?v=c1860B2BVmM) |
| 📱 **APK no Firebase App Distribution** | Disponível aos testers cadastrados (Professor adicionado como Tester.) |
| 🔖 **Hash do commit publicado** | `c58a998` — visível na tela "Sobre o App". Refere-se ao commit do código-fonte empacotado no APK. |
| 💻 **Repositório do Backend** | [knowball-api](https://github.com/knowball-oracle/knowball-api) |

---

## 🎯 O Problema

A manipulação de resultados no futebol de base é uma realidade silenciosa que destrói carreiras de jovens atletas antes mesmo de começarem. Suborno de árbitros, conluio entre equipes, pressão indevida a jovens jogadores e acerto de placares ameaçam a integridade dos campeonatos, desmotivam atletas e comprometem a credibilidade dos clubes.

Atualmente, denunciar essas práticas é informal, vulnerável a retaliações e sem qualquer rastreabilidade. **Não existe canal estruturado** entre testemunhas de irregularidades (pais, comissão técnica, atletas, árbitros honestos) e os órgãos competentes.

## 💡 A Solução: KnowBall

O **KnowBall** é um aplicativo mobile que oferece um canal de denúncia seguro, rastreável e protegido por uma camada anti-manipulação automatizada baseada em **Oracle APEX**. Cada denúncia é processada por uma procedure PL/SQL que calcula em tempo real o **score de risco** do árbitro denunciado, permitindo decisões automáticas e auditáveis sem intervenção humana até o momento certo.

---

## 🏗️ Arquitetura em Três Camadas

O sistema é construído sobre **três camadas independentes**, cada uma com responsabilidade clara e bem definida:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    📱 APP MOBILE (React Native + Expo Router)               │
│       └─ Apresentação, navegação, notificações locais       │
│                                                             │
└──────────────┬─────────────────────────┬────────────────────┘
               │                         │
               │ JWT                     │ ORDS REST
               ▼                         ▼
┌──────────────────────────┐  ┌──────────────────────────────┐
│  ☕ SPRING BOOT API       │  │  🗄️  ORACLE APEX             │
│  (knowball-api)          │  │     (Anti-Manipulação)       │
│                          │  │                              │
│  • Persistência REST     │  │  • Procedure PL/SQL          │
│  • Autenticação JWT      │  │    CALCULAR_SCORE_ARBITRO    │
│  • CRUD de entidades     │  │  • Sequence de protocolos    │
│  • HATEOAS               │  │  • Tabela de auditoria       │
│  • Hospedagem: Render    │  │  • Hospedagem: Oracle Cloud  │
└──────────────────────────┘  └──────────────────────────────┘
```

**Princípio fundamental**: o Oracle APEX **não é banco de dados**, é a **camada de inteligência de negócio anti-manipulação**. O Spring Boot é a camada de persistência e API REST. O app é apenas apresentação. Sem o APEX, o aplicativo não consegue registrar denúncias.

---

## 🔥 Destaques da Sprint 4

| Funcionalidade | Status |
|---|---|
| ✅ Todas as 11 telas funcionais com fluxo contínuo | Implementado |
| ✅ Integração total e dependente com Oracle APEX | Implementado |
| ✅ Notificações locais em 2 cenários reais | **Novidade Sprint 4** |
| ✅ Tela "Sobre o App" com hash do commit publicado | **Novidade Sprint 4** |
| ✅ Publicação no Firebase App Distribution | **Novidade Sprint 4** |
| ✅ Build automatizado com EAS Build | **Novidade Sprint 4** |
| ✅ Cliente HTTP do APEX com timeout e retry automático | **Novidade Sprint 4** |
| ✅ Arquitetura em camadas (telas / services / context / providers) | Mantido |
| ✅ CRUDs completos de árbitros, campeonatos e denúncias | Mantido |

---

## 📱 Funcionalidades

### 👤 Usuário Comum (USER)

- **Cadastro e Login** com autenticação JWT
- **Criar Denúncia** — fluxo guiado em 3 passos (escolher partida → escolher árbitro → escrever relato), com verificação anti-manipulação em tempo real pelo Oracle APEX antes da gravação
- **Visualizar Próprios Protocolos** — lista filtrada por status (Nova / Em análise / Resolvida)
- **Acompanhar Resultado** — vê quando o ADMIN avança o status ou define o veredito

### 🛡️ Administrador (ADMIN)

- Tudo o que o USER faz, **mais**:
- **CRUD completo de Árbitros** — criar, editar, alterar status (ACTIVE/SUSPENDED/INACTIVE), excluir
- **CRUD completo de Campeonatos** — criar, editar, excluir, categorizar por divisão (SUB_13/15/17/20)
- **Gerenciar Todas as Denúncias** — filtrar, avançar status, definir veredito (Procedente / Inconclusivo / Improcedente)
- **Central de Integridade APEX** — ranking de risco dos árbitros gerado pela procedure PL/SQL
- **Auditoria APEX** — histórico cronológico de **todas** as verificações realizadas, incluindo as bloqueadas (rastreabilidade total)

---

## 🔔 Notificações Locais

Foram implementados **dois cenários realistas** integrados ao contexto da aplicação:

### Cenário 1 — Avanço de Status de Denúncia
Quando o ADMIN avança uma denúncia (NEW → UNDER_REVIEW → RESOLVED) ou define um veredito, uma notificação local é disparada confirmando a ação. O título contém o protocolo e o corpo descreve a mudança.

### Cenário 2 — Bloqueio pelo Oracle APEX
Quando um USER tenta denunciar um árbitro com **score de risco ≥ 70** (BLOQUEADO pelo APEX), uma notificação local é disparada **imediatamente** informando o motivo. Isso reforça a percepção de que o APEX é parte ativa da experiência.

### Integração com o fluxo
Ao tocar na notificação:
- Tipo `STATUS_AVANCADO` / `VEREDITO_DEFINIDO` → navega para tela de **histórico de denúncias**
- Tipo `APEX_BLOQUEADO` → navega para a **Central de Integridade APEX**

---

## 🔗 Integração com Oracle APEX

O Oracle APEX é **parte essencial e determinante** da solução. Não é mero banco de dados — é a **camada de regras de negócio anti-manipulação**.

### Endpoints REST (via ORDS)

| Método | Endpoint | Função |
|--------|----------|--------|
| `GET` | `/verificar/{arbitro_id}` | Executa procedure de score e retorna classificação |
| `POST` | `/registrar` | Registra denúncia + gera protocolo via sequence + grava auditoria |
| `GET` | `/minhas/{email}` | Lista denúncias do usuário |
| `GET` | `/ranking` | Ranking de risco dos árbitros denunciados |
| `GET` | `/auditoria` | Histórico de todas as verificações realizadas |

### Procedure principal: `CALCULAR_SCORE_ARBITRO`

Calcula um **score de risco ponderado** baseado no histórico de denúncias do árbitro:

| Critério | Peso |
|----------|------|
| Denúncia recente (status NEW) | 50 pontos |
| Denúncia em análise (UNDER_REVIEW) | 30 pontos |
| Denúncia antiga (histórico) | 10 pontos |

**Classificação resultante**:
- 🟢 **LIBERADO** (score < 40) — denúncia aceita normalmente
- 🟠 **ALERTA** (score 40-69) — denúncia aceita com flag de atenção
- 🔴 **BLOQUEADO** (score ≥ 70) — denúncia recusada, árbitro sob escrutínio

### Resiliência da integração

O cliente HTTP do APEX (em `services/apexService.js`) implementa:
- **Timeout de 30 segundos** — protege contra cold start do tier gratuito
- **Retry automático** em caso de timeout ou erro de rede
- **Tratamento explícito de erro** em todas as queries TanStack

### Dependência real do APEX

Sem o APEX **operacional**, o aplicativo **não consegue criar denúncias**. Esta é uma decisão arquitetural consciente: preferimos falhar seguro a aceitar uma denúncia sem triagem anti-manipulação. Em produção real, isso seria mitigado com replicação ativa do Oracle Cloud.

---

## 📁 Estrutura do Projeto

```
KnowballApp/
│
├── 📱 app/                         # Telas (Expo Router file-based routing)
│   ├── _layout.jsx                 # Layout raiz: Tabs + hook de notificações
│   ├── index.jsx                   # Home (com/sem login)
│   ├── login.jsx                   # Login
│   ├── register.jsx                # Cadastro
│   ├── auth.jsx                    # Dashboard pós-login
│   ├── denuncia.jsx                # Criar denúncia (3 passos)
│   ├── historico.jsx               # Lista de denúncias (USER/ADMIN)
│   ├── arbitros.jsx                # CRUD de árbitros
│   ├── campeonatos.jsx             # CRUD de campeonatos
│   ├── apex.jsx                    # Central de Integridade
│   ├── auditoria.jsx               # Auditoria APEX
│   ├── user.jsx                    # Tela de protocolo gerado
│   └── sobre.jsx                   # Sobre o App + hash do commit
│
├── 🔌 services/                    # Camada de acesso a dados
│   ├── api.js                      # Axios + interceptor JWT (Spring Boot)
│   ├── apexService.js              # Cliente Oracle APEX (timeout + retry)
│   ├── authService.js              # Login/registro/logout
│   ├── reportService.js            # Denúncias
│   ├── refereeService.js           # Árbitros
│   ├── championshipService.js      # Campeonatos
│   ├── gameService.js              # Partidas
│   └── notificationService.js      # Notificações locais
│
├── 🧠 context/                     # Estado global
│   ├── AuthContext.jsx             # Auth (token, userId, role)
│   └── ThemeContext.jsx            # Tema claro/escuro
│
├── 📦 providers/                   # Providers React
│   └── QueryProvider.jsx           # TanStack Query
│
├── 🛠️  scripts/                    # Scripts utilitários
│   └── write-version.js            # Gera hash do commit em build time
│
├── 🖼️  assets/
│   └── version.json                # Hash do commit (gerado automaticamente)
│
├── app.json                        # Configuração Expo
├── eas.json                        # Configuração EAS Build
├── package.json                    # Dependências + hook de pre-install
└── README.md
```

### Separação de responsabilidades

- **Telas (`app/`)** — apenas apresentação. Nenhuma chamada HTTP direta, nenhuma regra de negócio.
- **Services (`services/`)** — toda a camada de acesso a dados (Spring Boot + Oracle APEX).
- **Context (`context/`)** — estado global (autenticação, tema).
- **Providers (`providers/`)** — wrapper de bibliotecas (TanStack Query).

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Conta no Expo (https://expo.dev)
- Android Studio com emulador OU dispositivo Android físico com Expo Go

### Passos

```bash
# 1. Clonar o repositório
git clone https://github.com/knowball-oracle/KnowballApp.git
cd KnowballApp

# 2. Instalar dependências (resolve conflito de peer deps)
npm install --legacy-peer-deps

# 3. Gerar hash do commit atual
node scripts/write-version.js

# 4. Iniciar o servidor de desenvolvimento
npx expo start

# 5. Pressionar 'a' para abrir no emulador Android,
#    ou escanear o QR code com o Expo Go no celular
```

---

## 📦 Build de Produção (EAS Build)

```bash
# Login no Expo
npx expo login

# Build do APK preview (Android)
npx eas build --platform android --profile preview
```

O hash do commit é injetado **automaticamente** em build time através do script `eas-build-pre-install` definido no `package.json`, garantindo que a versão exibida na tela "Sobre" sempre corresponda ao commit empacotado.

---

## 🧪 Tecnologias Utilizadas

### Mobile
- **React Native** (Expo SDK 54)
- **Expo Router** (file-based routing)
- **TanStack Query v5** (gerenciamento de estado server)
- **Axios** (cliente HTTP com interceptors)
- **AsyncStorage** (persistência local de JWT e dados de sessão)
- **Expo Notifications** (notificações locais)
- **Ionicons** (ícones)

### Backend
- **Spring Boot 3.x** com Spring Security + JWT
- **Spring HATEOAS** (links de navegação na API)
- **Spring Data JPA** com Oracle Database
- **Flyway** (migrações de banco)
- **Lombok + MapStruct**
- **OpenAPI / Swagger UI**

### Oracle
- **Oracle APEX** + ORDS (REST endpoints)
- **PL/SQL** (procedures de score, sequence de protocolo, auditoria)
- **Oracle Cloud Autonomous Database** (free tier)

### DevOps
- **EAS Build** (build em nuvem do APK)
- **Firebase App Distribution** (distribuição aos testers)
- **Render** (hosting do Spring Boot)
- **GitHub Classroom** (entrega acadêmica)

---

## 👥 Equipe

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/castropatrick">
        <b>Patrick Castro</b>
      </a>
      <br />
      <a href="https://www.linkedin.com/in/patrick-castro-839aa2273/">LinkedIn</a>
    </td>
    <td align="center">
      <a href="https://github.com/GabrielRossi01">
        <b>Gabriel Rossi</b>
      </a>
      <br />
      <a href="https://www.linkedin.com/in/gabriel-oliveira-rossi-155baa324/">LinkedIn</a>
    </td>
    <td align="center">
      <a href="https://github.com/RodrygoYamasaki">
        <b>Rodrigo Yamasaki</b>
      </a>
      <br />
      <a href="https://www.linkedin.com/in/rodrigo-yamasaki-74a3b1324/">LinkedIn</a>
    </td>
  </tr>
</table>

---

## 📝 Evolução por Sprint

### Sprint 1 — Fundação
Definição do problema, modelagem inicial, primeiras telas estáticas e prototipação do fluxo de denúncia.

### Sprint 2 — Backend e Persistência
Integração com Spring Boot, autenticação JWT, CRUDs principais (árbitros, campeonatos, partidas), tema claro/escuro.

### Sprint 3 — Integração Oracle APEX
Implementação das procedures PL/SQL anti-manipulação, sequence de protocolo, tabela de auditoria, endpoints ORDS, e refatoração das telas para consumir o APEX como camada de regras de negócio.

### Sprint 4 — Entrega Final (esta entrega)
- ✅ Notificações locais em dois cenários realistas
- ✅ Tela "Sobre o App" com hash do commit publicado
- ✅ Publicação no Firebase App Distribution
- ✅ Build automatizado via EAS Build
- ✅ Cliente HTTP do APEX com timeout e retry para resiliência
- ✅ Vídeo de apresentação demonstrando todas as funcionalidades

---

## 📄 Licença

Projeto acadêmico desenvolvido para a disciplina **Mobile Application Development** do curso de Análise e Desenvolvimento de Sistemas da **FIAP — 2026**.

---

<div align="center">

**Knowball** · feito com ⚽
🦤

[GitHub](https://github.com/knowball-oracle/KnowballApp) · [Backend](https://github.com/knowball-oracle/knowball-api)

</div>
