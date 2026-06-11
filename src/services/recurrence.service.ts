// ============================================================
// services/recurrence.service.ts — Motor de recorrência
// Responsável por: calcular status, próximas ocorrências
// e atualizar dataReferencia ao marcar evento como feito.
// ============================================================

import type { Evento, EventoStatus } from "../types";
import { today, addDays, toISODate, parseISODate, diffDays } from "../utils/date.utils";

/**
 * Retorna o status atual de um evento em relação à data de hoje.
 */
export function getEventoStatus(evento: Evento): EventoStatus {
  const ref = parseISODate(evento.dataReferencia);
  const now = today();
  const diff = diffDays(now, ref);

  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  return "upcoming";
}

/**
 * Retorna quantos dias faltam (negativo = atrasado).
 */
export function diasParaVencimento(evento: Evento): number {
  return diffDays(today(), parseISODate(evento.dataReferencia));
}

/**
 * Atualiza o evento ao ser marcado como concluído.
 * - Evento recorrente: avança dataReferencia para hoje + recorrência.
 * - Evento único: desativa o evento.
 */
export function marcarConcluido(evento: Evento): Evento {
  if (!evento.recorrenciaDias) {
    return { ...evento, ativo: false };
  }

  const proximaData = addDays(today(), evento.recorrenciaDias);
  return {
    ...evento,
    dataReferencia: toISODate(proximaData),
  };
}

/**
 * Agrupa uma lista de eventos em seções: atrasados, hoje, próximos.
 */
export function agruparEventos(eventos: Evento[]): {
  atrasados: Evento[];
  hoje: Evento[];
  proximos: Evento[];
} {
  const ativos = eventos.filter((e) => e.ativo);

  return {
    atrasados: ativos
      .filter((e) => getEventoStatus(e) === "overdue")
      .sort((a, b) => a.dataReferencia.localeCompare(b.dataReferencia)),
    hoje: ativos
      .filter((e) => getEventoStatus(e) === "today"),
    proximos: ativos
      .filter((e) => getEventoStatus(e) === "upcoming")
      .sort((a, b) => a.dataReferencia.localeCompare(b.dataReferencia)),
  };
}
