import type { Strategy, StrategyResult } from "../types";
import { normalize, extractTitle } from "../normalize";

const PATTERNS = [
  /\btodo mes\b/,
  /\bmensal\b/,
  /\bmensalmente\b/,
  /\ba cada mes\b/,
  /\buma vez por mes\b/,
];

function nextMonthSameDay(hoje: Date, dia: number): Date {
  const nextMonth = hoje.getMonth() + 1;
  const year = nextMonth > 11 ? hoje.getFullYear() + 1 : hoje.getFullYear();
  const monthIndex = nextMonth % 12;
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const target = Math.min(dia, lastDay);
  return new Date(year, monthIndex, target);
}

export class MonthlyStrategy implements Strategy {
  name = "monthly";
  priority = 60;

  matches(frase: string): boolean {
    const n = normalize(frase);
    return PATTERNS.some((p) => p.test(n));
  }

  parse(frase: string, hoje: Date): StrategyResult[] {
    const titulo = extractTitle(frase, [
      /uma\s+vez\s+por\s+mes/gi,
      /a\s+cada\s+mes/gi,
      /mensalmente/gi,
      /^mensal$/gi,
      /todo\s+mes/gi,
    ]);

    const dia = hoje.getDate();
    const dataBase = nextMonthSameDay(hoje, dia);

    return [
      {
        titulo,
        dataBase,
        recorrenciaDias: 30,
      },
    ];
  }
}
