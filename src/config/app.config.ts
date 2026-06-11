// ============================================================
// app.config.ts — Configuração central da aplicação
// Troque aqui: nome do app, textos, ícones, fontes, cores.
// Nunca hardcode textos ou identidade em componentes.
// ============================================================

export const APP = {
  name: "Lembrai",
  tagline: "Seus lembretes, simples assim.",
  description: "Registre tarefas recorrentes e lembretes pessoais por texto ou voz.",
  locale: "pt-BR",
  dateLocale: "pt-BR",
  version: "0.1.0",
} as const;

// Ícone e manifest PWA
export const PWA = {
  themeColor: "#6C63FF",
  backgroundColor: "#0F0F14",
  display: "standalone" as const,
  orientation: "portrait" as const,
} as const;

// Textos da interface — traduza ou personalize aqui
export const LABELS = {
  sections: {
    today: "Hoje",
    upcoming: "Próximos",
    overdue: "Atrasados",
    all: "Todos",
  },
  actions: {
    add: "Novo lembrete",
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    edit: "Editar",
    done: "Concluído",
    confirm: "Confirmar",
    listen: "Falar",
    stopListening: "Parar",
  },
  placeholders: {
    inputText: "Ex: Trocar óleo daqui a 2 dias…",
    notes: "Observações (opcional)",
  },
  feedback: {
    listening: "Ouvindo…",
    processing: "Interpretando…",
    saved: "Lembrete salvo.",
    deleted: "Lembrete excluído.",
    markedDone: "Marcado como feito.",
    noEvents: "Nenhum lembrete aqui.",
    voiceNotSupported: "Seu navegador não suporta reconhecimento de voz.",
    parseError: "Não consegui entender. Tente reformular.",
  },
  confirmations: {
    deleteEvent: "Excluir este lembrete?",
  },
  form: {
    titleLabel: "Lembrete",
    dateLabel: "Data de referência",
    recurrenceLabel: "Repetir a cada",
    recurrenceSuffix: "dias",
    notesLabel: "Observações",
  },
} as const;

// Recorrências pré-definidas para o select do formulário
export const RECURRENCE_PRESETS = [
  { label: "Sem repetição", value: undefined },
  { label: "Todo dia", value: 1 },
  { label: "Toda semana", value: 7 },
  { label: "A cada 15 dias", value: 15 },
  { label: "Todo mês", value: 30 },
  { label: "A cada 3 meses", value: 90 },
  { label: "Personalizado", value: "custom" as const },
] as const;
