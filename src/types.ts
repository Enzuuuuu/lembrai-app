// ============================================================
// types.ts — Modelo de dados da aplicação
// ============================================================

export type Evento = {
  id: string;
  titulo: string;
  /** ISO date string: "2026-06-10" */
  dataReferencia: string;
  /** Intervalo de repetição em dias. Undefined = evento único. */
  recorrenciaDias?: number;
  ativo: boolean;
  criadoEm: string;
  observacoes?: string;
};

/** Resultado do parser ao interpretar uma frase do usuário */
export type ParseResult = {
  titulo: string;
  dataBase: string;
  recorrencia?: number;
};

/** Status de um evento em relação à data atual */
export type EventoStatus = "overdue" | "today" | "upcoming";
