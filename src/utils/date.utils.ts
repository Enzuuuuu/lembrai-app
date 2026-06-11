// ============================================================
// utils/date.utils.ts — Utilitários de data (Date nativo)
// Zero dependências. Toda manipulação de data passa por aqui.
// ============================================================

import { APP } from "../config";

/** Retorna um Date zerado para hoje (meia-noite local) */
export function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Adiciona N dias a um Date (retorna novo objeto) */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Diferença em dias inteiros entre dois Dates (b - a) */
export function diffDays(a: Date, b: Date): number {
  const MS_DAY = 1000 * 60 * 60 * 24;
  const aTime = new Date(a).setHours(0, 0, 0, 0);
  const bTime = new Date(b).setHours(0, 0, 0, 0);
  return Math.round((bTime - aTime) / MS_DAY);
}

/** Converte Date → "YYYY-MM-DD" */
export function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/** Converte "YYYY-MM-DD" → Date (meia-noite local) */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Formata data para exibição amigável (ex: "seg, 10 de jun.") */
export function formatDisplay(iso: string): string {
  return parseISODate(iso).toLocaleDateString(APP.dateLocale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Gera um ID único baseado em timestamp + random */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
