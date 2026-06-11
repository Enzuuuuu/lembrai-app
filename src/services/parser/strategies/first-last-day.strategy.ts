import type { Strategy, StrategyResult } from "../types";
import { normalize, extractTitle } from "../normalize";

function nextMonthFirstDay(from: Date): Date {
  const year = from.getMonth() === 11 ? from.getFullYear() + 1 : from.getFullYear();
  const month = (from.getMonth() + 1) % 12;
  return new Date(year, month, 1);
}

function nextMonthLastDay(from: Date): Date {
  const year = from.getMonth() === 11 ? from.getFullYear() + 1 : from.getFullYear();
  const month = (from.getMonth() + 1) % 12;
  return new Date(year, month + 1, 0);
}

export class FirstLastDayStrategy implements Strategy {
  name = "first-last-day";
  priority = 20;

  matches(frase: string): boolean {
    const n = normalize(frase);
    return /\b(fim|final|comeco|inicio)\s+do\s+mes\b/.test(n);
  }

  parse(frase: string, _hoje: Date): StrategyResult[] {
    const n = normalize(frase);

    const isLast = /\b(fim|final)\s+do\s+mes\b/.test(n);
    const isFirst = /\b(comeco|inicio)\s+do\s+mes\b/.test(n);

    const titulo = extractTitle(frase, [
      /(fim|final|comeco|inicio)\s+do\s+mes/gi,
    ]);

    if (isLast) {
      return [
        {
          titulo,
          dataBase: nextMonthLastDay(_hoje),
          recorrenciaDias: 30,
        },
      ];
    }

    if (isFirst) {
      return [
        {
          titulo,
          dataBase: nextMonthFirstDay(_hoje),
          recorrenciaDias: 30,
        },
      ];
    }

    return [];
  }
}
