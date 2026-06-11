import type { Strategy, StrategyResult } from "../types";
import { normalize, extractTitle } from "../normalize";

const PATTERNS = [
  /\btodo dia (\d{1,2})\b/,
  /\bdia (\d{1,2}) todo mes\b/,
  /\bmensal no dia (\d{1,2})\b/,
];

function nextDayOfMonth(day: number, from: Date): Date {
  const clampedDay = Math.min(day, 31);

  const year = from.getFullYear();
  const month = from.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();

  if (clampedDay <= lastDay) {
    const candidate = new Date(year, month, clampedDay);
    if (candidate > from) return candidate;
  }

  const nextMonth = month + 1;
  const nextYear = nextMonth > 11 ? year + 1 : year;
  const nextMonthIndex = nextMonth % 12;
  const nextLastDay = new Date(nextYear, nextMonthIndex + 1, 0).getDate();
  const target = Math.min(clampedDay, nextLastDay);
  return new Date(nextYear, nextMonthIndex, target);
}

export class SpecificDayStrategy implements Strategy {
  name = "specific-day";
  priority = 85;

  matches(frase: string): boolean {
    const n = normalize(frase);
    return PATTERNS.some((p) => p.test(n));
  }

  parse(frase: string, hoje: Date): StrategyResult[] {
    const n = normalize(frase);

    let dia = 0;
    let pattern: RegExp = /(?:)/;

    for (const p of PATTERNS) {
      const m = n.match(p);
      if (m) {
        dia = parseInt(m[1], 10);
        pattern = p;
        break;
      }
    }

    if (dia < 1 || dia > 31) return [];

    const consumed = new RegExp(
      pattern.source.replace(/\\d\{\d+(?:,\d+)?\}/, String(dia)),
      "gi"
    );

    const titulo = extractTitle(frase, [consumed]);
    const dataBase = nextDayOfMonth(dia, hoje);

    return [
      {
        titulo,
        dataBase,
        recorrenciaDias: 30,
      },
    ];
  }
}
