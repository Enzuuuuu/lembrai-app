// ============================================================
// services/parser.service.ts — Parser de linguagem natural
// Responsável por: interpretar frases do usuário e extrair
// título, data de referência e recorrência em dias.
// Zero dependências externas — regex + Date nativo.
// ============================================================

import type { ParseResult } from "../types";
import { today, addDays, toISODate } from "../utils/date.utils";

const RECURRENCE_MAP: [RegExp, number | ((m: RegExpMatchArray) => number)][] = [
  [/dia\s+sim\s+dia\s+n[aã]o/i, 2],
  [/todo\s+dia|diariamente/i, 1],
  [/toda\s+semana|semanalmente/i, 7],
  [/quinzenalmente/i, 15],
  [/todo\s+m[eê]s|mensalmente/i, 30],
  [/a\s+cada\s+(\d+)\s+meses?/i, (m) => parseInt(m[1]) * 30],
  [/a\s+cada\s+(\d+)\s+semanas?/i, (m) => parseInt(m[1]) * 7],
  [/a\s+cada\s+(\d+)\s+dias?/i, (m) => parseInt(m[1])],
];

const DAYS_OF_WEEK: [RegExp, number][] = [
  [/domingos?\b/i, 0],
  [/segundas?(?:-feiras?)?\b/i, 1],
  [/ter[cç]as?(?:-feiras?)?\b/i, 2],
  [/quartas?(?:-feiras?)?\b/i, 3],
  [/quintas?(?:-feiras?)?\b/i, 4],
  [/sextas?(?:-feiras?)?\b/i, 5],
  [/s[aá]bados?\b/i, 6],
];

const DOW_SRC = DAYS_OF_WEEK.map(([r]) => r.source).join("|");

const CLEANUP: RegExp[] = [
  // Verbos de ação concluída (antes dos temporais para pegar "Fiz ... hoje")
  /\b(troquei|fiz|limpei|lavei|paguei|terminei|finalizei)\s+/i,
  /daqui\s+a\s+\d+\s+(dias?|semanas?)/gi,
  /\bhoje\b/gi,
  /\bamanh[aã](?!\w)/gi,
  new RegExp(`pr[oó]xim[ao]\\s+(?:${DOW_SRC})`, "gi"),
  /todo\s+dia|diariamente|dia\s+sim\s+dia\s+n[aã]o/gi,
  new RegExp(`tod[ao]s?\\s+(?:as\\s+)?(?:${DOW_SRC})`, "gi"),
  /toda\s+semana|semanalmente|quinzenalmente/gi,
  /todo\s+m[eê]s|mensalmente/gi,
  /a\s+cada\s+\d+\s+(dias?|semanas?|meses?)/gi,
];

function daysUntilWeekday(weekdayIndex: number): number {
  const d = today();
  const diff = (weekdayIndex - d.getDay() + 7) % 7;
  return diff === 0 ? 7 : diff;
}

function getMatchedDay(frase: string, prefix: string): number | undefined {
  for (const [pattern, dayIndex] of DAYS_OF_WEEK) {
    if (new RegExp(`${prefix}${pattern.source}`, "i").test(frase)) return dayIndex;
  }
  return undefined;
}

function parseDateOffset(frase: string): number {
  if (/\bhoje\b/i.test(frase)) return 0;
  if (/\bamanh[aã](?!\w)/i.test(frase)) return 1;

  const dayIdx = getMatchedDay(frase, "pr[oó]xim[ao]\\s+");
  if (dayIdx !== undefined) return daysUntilWeekday(dayIdx);

  const diaMatch = frase.match(/daqui\s+a\s+(\d+)\s+dias?/i);
  if (diaMatch) return parseInt(diaMatch[1]);

  const semanaMatch = frase.match(/daqui\s+a\s+(\d+)\s+semanas?/i);
  if (semanaMatch) return parseInt(semanaMatch[1]) * 7;

  return 0;
}

function parseRecurrence(frase: string): number | undefined {
  for (const [pattern, baseDays] of RECURRENCE_MAP) {
    const match = frase.match(pattern);
    if (match) {
      if (typeof baseDays === "number") return baseDays;
      return baseDays(match);
    }
  }
  return undefined;
}

function hasExplicitDate(frase: string): boolean {
  return /\b(?:hoje|daqui|pr[oó]xim[ao])\b/i.test(frase) || /\bamanh[aã](?!\w)/i.test(frase);
}

function extractTitle(frase: string): string {
  let clean = frase;
  for (const p of CLEANUP) clean = clean.replace(p, "");
  clean = clean.replace(/[.,!?]+$/, "").replace(/\s+/g, " ").trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1) || frase.trim();
}

export function parsePhrase(frase: string): ParseResult | null {
  const trimmed = frase.trim();
  if (!trimmed) return null;

  let offset = parseDateOffset(trimmed);
  let recorrencia = parseRecurrence(trimmed);

  if (recorrencia === undefined) {
    const dayIdx = getMatchedDay(trimmed, "tod[ao]s?\\s+(?:as\\s+)?");
    if (dayIdx !== undefined) {
      recorrencia = 7;
      // Só ajusta o offset se nenhuma data explícita foi dada
      if (!hasExplicitDate(trimmed)) offset = daysUntilWeekday(dayIdx);
    }
  }

  const titulo = extractTitle(trimmed);
  if (!titulo) return null;

  return {
    titulo,
    dataBase: toISODate(addDays(today(), offset)),
    recorrencia,
  };
}
