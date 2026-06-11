# Lembrai — Guia do Projeto

> Documentação de arquitetura, responsabilidades de cada arquivo e instruções para personalização e reaproveitamento do projeto como template.

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Estrutura de Pastas](#estrutura-de-pastas)
3. [Mapa de Responsabilidades](#mapa-de-responsabilidades)
4. [Como Personalizar](#como-personalizar)
5. [Fluxo de Dados](#fluxo-de-dados)
6. [Camadas da Aplicação](#camadas-da-aplicação)
7. [Como Rodar](#como-rodar)
8. [Deploy (Vercel)](#deploy-vercel)
9. [Próximos Passos](#próximos-passos)

---

## Visão Geral

O Lembrai é uma PWA de lembretes pessoais que funciona 100% offline, sem backend e sem custo operacional. Todos os dados ficam no dispositivo do usuário via IndexedDB.

**Stack:** React + TypeScript + Vite + `vite-plugin-pwa`  
**Dependências externas:** zero (além do React e Vite)  
**APIs nativas utilizadas:** IndexedDB, Web Speech API, Date

---

## Estrutura de Pastas

```
lembrai/
├── index.html                   # HTML raiz, monta o #root
├── package.json                 # Dependências e scripts
├── tsconfig.json                # Configuração TypeScript
├── vite.config.ts               # Vite + PWA manifest (lê app.config)
│
└── src/
    ├── main.tsx                 # Ponto de entrada — injeta CSS vars e monta React
    ├── App.tsx                  # Componente raiz — orquestra tudo
    ├── types.ts                 # Tipos globais: Evento, ParseResult, EventoStatus
    │
    ├── config/                  # ★ ARQUIVOS DE PERSONALIZAÇÃO ★
    │   ├── app.config.ts        # Nome, textos, labels, presets de recorrência
    │   ├── theme.config.ts      # Cores, fontes, raios, sombras, transições
    │   └── index.ts             # Barrel — re-exporta tudo do config/
    │
    ├── utils/
    │   └── date.utils.ts        # Utilitários de data (today, addDays, diffDays, formatação)
    │
    ├── services/                # Lógica de negócio pura (sem React)
    │   ├── db.service.ts        # CRUD no IndexedDB
    │   ├── parser.service.ts    # Barrel que re-exporta o sub-módulo parser/
    │   ├── recurrence.service.ts# Calcula status, próximas datas, conclusão
    │   └── parser/              # ★ SUB-MÓDULO DE PARSER (padrão Strategy) ★
    │       ├── index.ts         # parsePhrase() / parseAll() — API pública
    │       ├── types.ts         # Interfaces Strategy e StrategyResult
    │       ├── normalize.ts     # Normalização de texto (remove acentos, lowercase)
    │       ├── classify.ts      # Classifica frase → Strategy (por prioridade)
    │       └── strategies/      # 14 estratégias concretas:
    │           ├── daily.strategy.ts         # "todo dia", "diariamente"
    │           ├── weekly.strategy.ts        # "toda semana", "semanalmente"
    │           ├── monthly.strategy.ts       # "todo mês", "mensal"
    │           ├── yearly.strategy.ts        # "todo ano"
    │           ├── weekday.strategy.ts       # "dia útil"
    │           ├── weekend.strategy.ts       # "fim de semana"
    │           ├── weekday-days.strategy.ts  # "dias úteis" (plural)
    │           ├── tomorrow.strategy.ts      # "hoje", "amanhã", "depois de amanhã"
    │           ├── specific-day.strategy.ts  # "todo dia 15"
    │           ├── month-name.strategy.ts    # "em janeiro"
    │           ├── next-weekday.strategy.ts  # "próxima segunda"
    │           ├── first-last-day.strategy.ts# "primeiro/último dia do mês"
    │           ├── interval.strategy.ts      # "a cada N dias/semanas/meses"
    │           ├── alternating.strategy.ts   # "dia sim dia não"
    │           └── in-x.strategy.ts          # "daqui a N dias"
    │
    ├── hooks/                   # Estado React com lógica encapsulada
    │   ├── useEventos.ts        # Estado global de eventos (load/save/delete/done)
    │   └── useVoice.ts          # Web Speech API — escuta e retorna transcrição
    │
    ├── components/              # Componentes de UI
    │   ├── EventoCard.tsx       # Card individual de um evento
    │   ├── EventoForm.tsx       # Modal de criação e edição
    │   └── EventoSection.tsx    # Agrupa cards em seções (Hoje, Próximos, etc.)
    │
    └── styles/
        └── globals.css          # Todos os estilos — usa CSS vars do theme.config
```

---

## Mapa de Responsabilidades

### `src/config/app.config.ts`
**O que faz:** Define toda a identidade textual e comportamental da aplicação.

Contém:
- `APP` — nome, tagline, locale, dateLocale, description
- `PWA` — cor do tema, cor de fundo, modo de exibição
- `LABELS` — todos os textos da UI (seções, botões, placeholders, feedbacks)
- `RECURRENCE_PRESETS` — opções do select de recorrência

**Regra:** Nenhum componente deve ter string de UI hardcoded. Tudo passa por aqui.

---

### `src/config/theme.config.ts`
**O que faz:** Define todos os tokens de design: cores, tipografia, espaçamento, raios, sombras.

Contém:
- `THEME.colors` — paleta completa (background, acento, semânticas, texto, borda)
- `THEME.fonts` — fontes para UI (`sans`) e dados/datas (`mono`)
- `THEME.radius`, `THEME.shadows`, `THEME.transitions`
- `buildCssVars()` — helper que gera o bloco `:root { --var: value }` a partir do objeto

**Como funciona:** `main.tsx` chama `buildCssVars(THEME)` e injeta um `<style>` no `<head>`. O CSS em `globals.css` usa apenas `var(--color-*)`, `var(--font-*)`, etc. Trocar o tema = trocar o objeto `THEME`.

---

### `src/types.ts`
**O que faz:** Define os tipos TypeScript compartilhados entre camadas.

- `Evento` — modelo de dados principal (id, título, data, recorrência, etc.)
- `ParseResult` — saída do parser (titulo, dataBase, recorrencia)
- `EventoStatus` — `"overdue" | "today" | "upcoming"`

---

### `src/utils/date.utils.ts`
**O que faz:** Utilitários puros de manipulação de datas. Zero dependências de React.

Funções exportadas:
| Função | O que faz |
|---|---|
| `today()` | Retorna Date de hoje (meia-noite local) |
| `addDays(date, days)` | Adiciona N dias |
| `diffDays(a, b)` | Diferença em dias inteiros |
| `toISODate(date)` | Date → `"YYYY-MM-DD"` |
| `parseISODate(iso)` | `"YYYY-MM-DD"` → Date |
| `formatDisplay(iso)` | Data amigável (ex: `"seg, 10 de jun."`) |
| `generateId()` | ID único baseado em timestamp + random |

**Regra:** Toda manipulação de data passa por aqui. Nenhum outro módulo faz contas com Date diretamente.

---

### `src/services/db.service.ts`
**O que faz:** Toda comunicação com o IndexedDB.

Funções exportadas:
| Função | O que faz |
|---|---|
| `dbGetAll()` | Retorna todos os eventos |
| `dbSave(evento)` | Cria ou atualiza um evento (upsert por `id`) |
| `dbDelete(id)` | Remove um evento pelo id |

**Regra:** É a única camada que toca o IndexedDB. Nenhum componente ou hook acessa `indexedDB` diretamente.

---

### `src/services/parser/` (sub-módulo)

Implementa o **padrão Strategy** para interpretar frases em linguagem natural.

**Arquitetura:**

```
frase bruta
    │
    ▼
normalize(frase)      ← remove acentos, lowercase, extrai título
    │
    ▼
classify(frase)       ← percorre estratégias por prioridade (maior primeiro)
    │                     retorna a primeira que der matches()
    ▼
strategy.parse()      ← executa a estratégia vencedora → StrategyResult[]
    │
    ▼
parsePhrase() / parseAll()   ← monta ParseResult (título, dataBase, recorrência)
```

**API pública** (exportada via `src/services/parser.service.ts`):

| Função | O que faz |
|---|---|
| `parsePhrase(frase)` | Retorna `ParseResult \| null` para o primeiro resultado |
| `parseAll(frase)` | Retorna `ParseResult[]` para frases com múltiplos eventos |
| `getAllStrategies()` | Retorna lista de todas as estratégias registradas |

**Interface `Strategy`** (`parser/types.ts`):

```ts
interface Strategy {
  name: string;
  priority: number;
  matches(frase: string): boolean;
  parse(frase: string, hoje: Date): StrategyResult[];
}
```

**Estratégias disponíveis** (14 no total):

| Estratégia | Prioridade | Exemplo de frase |
|---|---|---|
| `alternating` | 100 | `"dia sim dia não"` |
| `daily` | 90 | `"todo dia"`, `"diariamente"` |
| `weekly` | 80 | `"toda semana"`, `"semanalmente"` |
| `monthly` | 70 | `"todo mês"`, `"mensal"` |
| `yearly` | 60 | `"todo ano"` |
| `weekday` | 55 | `"dia útil"` |
| `weekend` | 50 | `"fim de semana"` |
| `weekday-days` | 45 | `"dias úteis"` |
| `specific-day` | 40 | `"todo dia 15"` |
| `next-weekday` | 35 | `"próxima segunda"` |
| `first-last-day` | 30 | `"primeiro/último dia do mês"` |
| `tomorrow` | 25 | `"hoje"`, `"amanhã"`, `"depois de amanhã"` |
| `interval` | 20 | `"a cada N dias/semanas/meses"` |
| `in-x` | 10 | `"daqui a N dias"` |
| `month-name` | 5 | `"em janeiro"` |

**Regra:** Adicionar uma nova estratégia = criar arquivo em `strategies/` e registrá-lo em `classify.ts`.

---

### `src/services/recurrence.service.ts`
**O que faz:** Toda a lógica de recorrência e ciclo de vida dos eventos.

Funções exportadas:
| Função | O que faz |
|---|---|
| `getEventoStatus(evento)` | Retorna `"overdue"`, `"today"` ou `"upcoming"` |
| `diasParaVencimento(evento)` | Retorna número inteiro de dias (negativo = atrasado) |
| `marcarConcluido(evento)` | Recorrente: avança data. Único: desativa. |
| `agruparEventos(eventos)` | Separa em `{ atrasados, hoje, proximos }` |

---

### `src/hooks/useEventos.ts`
**O que faz:** Hook React que gerencia o estado de todos os eventos.

Expõe:
- `eventos` — array reativo
- `loading` — boolean durante carga inicial
- `salvar(data)` — cria ou atualiza (detecta por presença de `id`)
- `excluir(id)` — remove do estado e do DB
- `concluir(id)` — delega ao `recurrence.service`, persiste e atualiza estado

**Regra:** É a única camada que chama `db.service`. Componentes nunca chamam o DB diretamente.

---

### `src/hooks/useVoice.ts`
**O que faz:** Abstrai a Web Speech API.

Expõe:
- `start()` / `stop()` — controla a escuta
- `status` — `"idle" | "listening" | "processing" | "error"`
- `statusLabel` — texto amigável do estado atual (lido de `LABELS`)
- `isSupported` — `boolean` para esconder o botão em browsers sem suporte
- `error` — mensagem de erro se houver

---

### `src/components/EventoCard.tsx`
**O que faz:** Renderiza um único evento como card.

Responsabilidades:
- Exibir badge de status com cor semântica
- Formatar data para exibição legível
- Mostrar indicador de recorrência se existir
- Botões de ação: concluir (✓), editar (✎), excluir (✕)

**Não contém estado.** Recebe tudo via props.

---

### `src/components/EventoForm.tsx`
**O que faz:** Modal de criação e edição de eventos.

Responsabilidades:
- Input rápido por frase (chama parser ao pressionar Enter ou "Interpretar")
- Botão de microfone (usa `useVoice`)
- Campos detalhados: título, data, recorrência (select + campo customizado), notas
- Exibe feedback de voz e erros de parse

---

### `src/components/EventoSection.tsx`
**O que faz:** Renderiza uma seção com título, contagem e lista de cards.

Responsabilidades:
- Exibir título e badge de contagem
- Renderizar lista de `EventoCard`
- Exibir mensagem de lista vazia

---

### `src/styles/globals.css`
**O que faz:** Todos os estilos da aplicação.

**Regra:** Nenhuma cor, fonte, raio ou sombra deve ser hardcoded aqui. Tudo usa `var(--*)` injetados pelo `theme.config.ts`. Isso garante que trocar o tema em um arquivo troca toda a aparência da app.

Classes principais:
- `.app`, `.app-header`, `.app-main` — layout
- `.evento-card`, `.evento-card__*` — card de evento
- `.badge`, `.badge--overdue/today/upcoming` — status visual
- `.btn`, `.btn--primary/secondary/ghost/icon` — sistema de botões
- `.modal-overlay`, `.modal` — modal bottom-sheet (mobile) / centrado (desktop)
- `.input`, `.label`, `.form-field` — formulário

---

### `vite.config.ts`
**O que faz:** Configura Vite com React e o plugin PWA.

Lê `APP` e `PWA` do `app.config.ts` para gerar o `manifest.json` automaticamente. Trocar o nome ou cor do tema no config reflete no manifest sem editar este arquivo.

---

## Como Personalizar

### Trocar nome, textos e idioma

Edite **apenas** `src/config/app.config.ts`:

```ts
export const APP = {
  name: "MeuApp",           // ← nome que aparece no header e no manifest
  tagline: "Meu slogan",
  locale: "en-US",          // ← locale geral
  dateLocale: "en-US",      // ← formatação de datas
};

export const LABELS = {
  actions: {
    add: "New reminder",    // ← textos dos botões
    save: "Save",
  },
  // ...
};
```

### Trocar cores e fontes

Edite **apenas** `src/config/theme.config.ts`:

```ts
export const THEME = {
  colors: {
    bgBase: "#FFFFFF",       // ← fundo branco para tema claro
    accent: "#FF6B35",       // ← laranja como cor de destaque
    // ...
  },
  fonts: {
    sans: "'Poppins', sans-serif",   // ← nova fonte principal
  },
};
```

As CSS vars serão regeneradas automaticamente ao iniciar. Nenhum outro arquivo precisa ser alterado.

### Adicionar nova recorrência pré-definida

No `app.config.ts`:

```ts
export const RECURRENCE_PRESETS = [
  // ...
  { label: "A cada 2 semanas", value: 14 },  // ← adicione aqui
];
```

### Adicionar nova estratégia ao parser

1. Crie um arquivo em `src/services/parser/strategies/`, por exemplo `fortnightly.strategy.ts`:

```ts
import type { Strategy, StrategyResult } from "../types";

export const fortnightlyStrategy: Strategy = {
  name: "fortnightly",
  priority: 85,
  matches(frase: string) {
    return /quinzenal/i.test(frase);
  },
  parse(frase: string, hoje: Date): StrategyResult[] {
    return [{
      titulo: extrairTitulo(frase, /quinzenal/i),
      dataBase: hoje,
      recorrenciaDias: 15,
    }];
  },
};
```

2. Registre no `src/services/parser/classify.ts`:

```ts
import { fortnightlyStrategy } from "./strategies/fortnightly.strategy";

const STRATEGIES: Strategy[] = [
  alternatingStrategy,
  fortnightlyStrategy,  // ← adicione aqui
  dailyStrategy,
  // ...
];
```

---

## Fluxo de Dados

### Criação de lembrete (texto ou voz)

```
Usuário
  │
  ├─ digita frase ──► EventoForm
  │                       │
  │               normalize(frase) [parser/normalize]
  │                       │
  │               classify(frase) [parser/classify]
  │                       │
  │               strategy.matches()? → strategy.parse()
  │                       │
  │               StrategyResult[] (titulo, dataBase, recorrenciaDias)
  │                       │
  │               parsePhrase() [parser/index]
  │                       │
  │               ParseResult { titulo, dataBase, recorrencia }
  │                       │
  │               useEventos.salvar()
  │                       │
  │               dbSave() [db.service] ──► IndexedDB
  │                       │
  │               setEventos() ──► re-render
  │
  └─ vê eventos ◄── agruparEventos() [recurrence.service]
                         │
                    { atrasados, hoje, proximos }
                         │
                    EventoSection > EventoCard
```

### Conclusão de evento

```
Usuário clica ✓
  │
  ▼
useEventos.concluir(id)
  │
  ▼
marcarConcluido(evento) [recurrence.service]
  │
  ├─ Recorrente: avança dataReferencia em recorrenciaDias
  └─ Único: define ativo = false
  │
  ▼
dbSave(evento atualizado) [db.service] ──► IndexedDB
  │
  ▼
setEventos() ──► re-render
```

---

## Camadas da Aplicação

```
┌──────────────────────────────────────┐
│         UI (Componentes React)        │  App, EventoCard, EventoForm, EventoSection
│   Importa de: hooks, config           │
├──────────────────────────────────────┤
│        Estado (Hooks React)           │  useEventos, useVoice
│   Importa de: services, config        │
├──────────────────────────────────────┤
│      Lógica de Negócio (Services)     │  parser/, recurrence.service
│   Importa de: utils, config, types    │  (zero dependência de React)
├──────────────────────────────────────┤
│         Utilitários (Utils)           │  date.utils
│   Importa de: config                  │  (zero dependência de React)
├──────────────────────────────────────┤
│          Persistência                 │  db.service (IndexedDB)
│   Importa de: types                   │  (zero dependência de React)
├──────────────────────────────────────┤
│      Configuração Central             │  app.config, theme.config
│   Não importa de outras camadas       │
└──────────────────────────────────────┘
```

**Regra das camadas:** camadas superiores podem importar das inferiores. O inverso não é permitido. Nenhum service importa React. `db.service` não conhece negócio. `parser/` não conhece IndexedDB.

---

## Como Rodar

```bash
# Instalar dependências
npm install

# Desenvolvimento (hot reload)
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

**Ícones PWA:** Coloque `icon-192.png` e `icon-512.png` em `public/icons/` antes do build.

---

## Deploy (Vercel)

1. Push para um repositório GitHub
2. Importe no [vercel.com](https://vercel.com)
3. Framework: **Vite** (detectado automaticamente)
4. Build command: `npm run build`
5. Output directory: `dist`

Custo: **zero** no plano gratuito da Vercel.

---

## Próximos Passos

Features fora do MVP atual, ordenadas por valor:

| Feature | Complexidade | Observação |
|---|---|---|
| Notificações push (Notification API) | Média | Funciona offline via Service Worker |
| Histórico de conclusões | Baixa | Novo campo `historico[]` no tipo `Evento` |
| Exportar/importar JSON | Baixa | Backup manual sem backend |
| Filtro por busca | Baixa | Filter no array `eventos` |
| Ordenação configurável | Baixa | Estado local de sort no `App` |
| Widget de estatísticas | Média | Contar eventos por status |
| Temas claro/escuro | Baixa | Trocar objeto `THEME` e persistir no localStorage |
| Múltiplos temas | Baixa | Array de `THEME[]` + seletor |
