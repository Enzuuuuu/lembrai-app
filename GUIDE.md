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
    ├── services/                # Lógica de negócio pura (sem React)
    │   ├── db.service.ts        # CRUD no IndexedDB
    │   ├── parser.service.ts    # Interpreta frases em linguagem natural
    │   └── recurrence.service.ts# Calcula status, próximas datas, conclusão
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
- `APP` — nome, tagline, locale
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

### `src/services/parser.service.ts`
**O que faz:** Interpreta frases em linguagem natural e extrai dados estruturados.

Função exportada:
- `parsePhrase(frase: string): ParseResult | null`

Exemplos de entrada → saída:
| Entrada | titulo | dataBase | recorrencia |
|---|---|---|---|
| `"Troquei a roupa de cama hoje"` | `Roupa de cama` | hoje | `7` |
| `"Trocar óleo daqui a 2 dias"` | `Trocar óleo` | hoje+2 | — |
| `"Limpar filtro a cada 30 dias"` | `Limpar filtro` | hoje | `30` |

**Para expandir:** Adicione novos padrões nos arrays `RECURRENCE_MAP` e na função `parseDateOffset`.

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
  locale: "en-US",          // ← muda formatação de datas
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

### Adicionar nova frase ao parser

No `parser.service.ts`:

```ts
// No array RECURRENCE_MAP:
[/quinzenal/i, 15],

// Na função parseDateOffset:
if (/semana\s+que\s+vem/i.test(frase)) return 7;
```

---

## Fluxo de Dados

```
Usuário
  │
  ├─ digita frase ──► EventoForm
  │                       │
  │               parsePhrase() [parser.service]
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

---

## Camadas da Aplicação

```
┌─────────────────────────────────┐
│           UI (React)            │  App, EventoCard, EventoForm, EventoSection
├─────────────────────────────────┤
│         Estado (Hooks)          │  useEventos, useVoice
├─────────────────────────────────┤
│       Lógica de Negócio         │  parser.service, recurrence.service
├─────────────────────────────────┤
│         Persistência            │  db.service (IndexedDB)
├─────────────────────────────────┤
│       Configuração Central      │  app.config, theme.config
└─────────────────────────────────┘
```

**Regra das camadas:** camadas superiores podem importar das inferiores. O inverso não é permitido. `db.service` não importa nada de React. `parser.service` não conhece o IndexedDB.

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
