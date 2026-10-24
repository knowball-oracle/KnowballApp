<div align="center">

# 🏆 KnowBall

### Denúncias seguras contra manipulação no futebol de base

Mobile Application Development · FIAP 2026

[![Expo](https://img.shields.io/badge/Expo-SDK_57-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react&logoColor=white)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)

</div>

---

## 📋 Aviso

> ⚠️ **A API fica no Railway.**
>
> Ao abrir, o app faz um ping em `GET /auth/health`; se o servidor demorar a responder, mostra a tela **“Acordando o servidor”** até ele ficar disponível.
>
> API: [https://knowball-api-production.up.railway.app](https://knowball-api-production.up.railway.app) · Site: [https://knowball-web-henna.vercel.app](https://knowball-web-henna.vercel.app)

---

## 🎬 Demonstração

| Recurso | Link |
|---------|------|
| 🎥 **Vídeo de apresentação** | [YouTube](https://www.youtube.com/watch?v=c1860B2BVmM) |
| 🔖 **Hash do commit publicado** | Visível na tela **Sobre**, lido de `assets/version.json` |
| 💻 **Backend** | [knowball-api](https://github.com/knowball-oracle/knowball-api) |
| 🌐 **Site** | [knowball-web](https://knowball-web-henna.vercel.app) |

---

## 🎯 O problema

A manipulação de resultados no futebol de base destrói carreiras antes mesmo de começarem: suborno de árbitros, conluio entre equipes, pressão indevida a jovens atletas e acerto de placares. Denunciar essas práticas costuma ser informal, sem rastreabilidade e com medo de retaliação.

## 💡 A solução

O **KnowBall** é um canal de denúncia seguro e rastreável para as categorias **Sub-13 a Sub-20**. Cada relato vira um registro com **protocolo** (`KB-AAAA-NNN`), histórico de status e análise responsável pela equipe administradora. O app tem paridade com o site e foi pensado para o celular.

> O registro de uma denúncia não representa comprovação de irregularidade.

---

## 📱 Funcionalidades

### 👤 Denunciante (USER)
- **Cadastro em 4 etapas** com código de 6 dígitos enviado por e-mail (verificação obrigatória da API).
- **Início** com saudação, contadores por status e denúncias recentes.
- **Nova denúncia em 3 passos**: partida (busca e filtro por categoria, escudos dos times), árbitro escalado e relato (20 a 2.000 caracteres, dicas e trechos prontos), com **revisão** antes de enviar e **rascunho salvo** no aparelho.
- **Comprovante** com o protocolo, copiar e compartilhar.
- **Protocolos** com filtros, **detalhe** com ticket, linha do tempo de status e resultado, e exclusão de denúncias resolvidas.
- **Notificação local** quando o status de uma denúncia muda (verificado ao abrir o app ou voltar para ele).

### 🛡️ Administrador (ADMIN)
- **Indicadores**: KPIs, denúncias por mês, por status, árbitros mais denunciados e recentes (`/analytics/reports/*`).
- **Fila de denúncias** com ações rápidas (iniciar análise, resolver com Positivo, Neutro ou Negativo).
- **Cadastros**: árbitros, campeonatos, times (com sincronização de escudos), partidas (times, arbitragem e exclusão em cascata) e usuários paginados.
- **Painel Oracle APEX** aberto no navegador.

### Para todos
- **Kiko**, o assistente do Knowball, com resposta em streaming (SSE) e conversa guardada no aparelho.
- **Perfil** com troca de foto, **Sobre** (versão, commit e equipe) e **FAQ**.

---

## 🏗️ Arquitetura

```
KnowballApp (Expo)  ──HTTPS/JWT──▶  knowball-api (Spring Boot, Oracle)
                                      ├─ e-mails (verificação, protocolo, status)
                                      └─ Kiko (IA, SSE)
```

- **Sessão**: JWT RS256 de 1 hora, sem refresh. Só o token vai no `expo-secure-store`; o app lê o `exp`, avisa 5 minutos antes e sai sozinho ao expirar (ou num 401).
- **Dados**: TanStack Query com chaves centralizadas, `focusManager` ligado ao `AppState` e `onlineManager` ao NetInfo; sem retry em 4xx.
- **Erros**: todos os formatos da API (texto, mapa de validação, `ProblemDetail`, corpo vazio) passam por `utils/parseApiError.ts`.
- **Visual**: tema escuro com Sora, tokens em `theme/tokens.ts` e componentes base em `components/ui` (ver `DESIGN.md` na pasta do projeto).

## 📁 Estrutura

```
app/            rotas (Expo Router): (auth), (user), (admin), sobre, faq, dev/catalogo
components/     ui/ (componentes base), report/, game/, admin/, charts/
features/       reports/, register/, kiko/, profile/, admin/
services/       um arquivo por recurso da API + http, queryKeys e invalidation
session/        SessionProvider (SecureStore + AsyncStorage)
theme/          tokens e tipografia
types/          tipos da API (a partir dos DTOs)
utils/          hal, jwt, parseApiError, sse, dates, labels, text, validation
scripts/        write-version.js (hash do commit para a tela Sobre)
```

---

## 🚀 Como executar

Pré-requisitos: Node.js 20.19.4+ e o app **Expo Go 57** no celular.

```bash
git clone https://github.com/knowball-oracle/KnowballApp.git
cd KnowballApp
npm install
npm start            # grava assets/version.json e abre o Expo
```

Escaneie o QR code com a câmera (iOS) ou com o Expo Go (Android). Para apontar para outra API, defina `EXPO_PUBLIC_API_URL`.

Contas criadas com Google funcionam só no site (o OAuth da API redireciona para o web); no app, entre com e-mail e senha.

### Verificações

```bash
npx tsc --noEmit     # TypeScript strict
npx expo-doctor      # saúde do projeto
npm test             # testes de parseApiError e do parser SSE
```

## 📦 Build (EAS)

```bash
npx eas-cli login
npm run build:android    # grava o version.json com o commit atual e gera o APK (perfil preview)
```

O `build:android` roda o `scripts/write-version.js` antes do `eas build`, então a tela Sobre mostra o hash do commit empacotado.

---

## 🧪 Tecnologias

**Mobile**: Expo SDK 57, React Native 0.86, Expo Router, TypeScript, TanStack Query 5, Reanimated 4, expo-image, expo-blur, expo-secure-store, expo-notifications, lucide-react-native.
**Backend**: Spring Boot 3.5, Java 21, Oracle, JWT RS256, Spring AI (Kiko), deploy no Railway.
**Web**: Angular 21 + Tailwind 4, deploy na Vercel.

---

## 👥 Equipe

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/castropatrick"><b>Patrick Castro</b></a><br />
      <a href="https://www.linkedin.com/in/patrick-castro-quintana-839aa2273/">LinkedIn</a>
    </td>
    <td align="center">
      <a href="https://github.com/GabrielRossi01"><b>Gabriel Rossi</b></a><br />
      <a href="https://www.linkedin.com/in/gabriel-oliveira-rossi-155baa324/">LinkedIn</a>
    </td>
    <td align="center">
      <a href="https://github.com/RodrygoYamasaki"><b>Rodrigo Yamasaki</b></a><br />
      <a href="https://www.linkedin.com/in/rodrigo-yamasaki-74a3b1324/">LinkedIn</a>
    </td>
  </tr>
</table>

---

## 📝 Evolução

- **Sprint 1** — Definição do problema, modelagem e prototipação do fluxo de denúncia.
- **Sprint 2** — Backend Spring Boot, autenticação JWT e CRUDs principais.
- **Sprint 3** — Integração com Oracle APEX.
- **Sprint 4** — Notificações locais, tela Sobre com o hash do commit e build EAS.
- **Migração para a API nova** — reescrita em TypeScript sobre o Expo SDK 57: cadastro com verificação por e-mail, protocolo gerado pela API, analytics, cadastros completos do admin, Kiko e visual alinhado ao site.

---

## 📄 Licença

Projeto acadêmico da disciplina **Mobile Application Development** — Análise e Desenvolvimento de Sistemas, **FIAP 2026**.

<div align="center">

**Knowball** · feito com ⚽

[App](https://github.com/knowball-oracle/KnowballApp) · [Backend](https://github.com/knowball-oracle/knowball-api) · [Site](https://knowball-web-henna.vercel.app)

</div>
