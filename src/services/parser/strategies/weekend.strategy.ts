import type { Strategy, StrategyResult } from "../types";
import { normalize, extractTitle } from "../normalize";
import { addDays } from "../../../utils/date.utils";

const PATTERNS = [
  /\bfim de semana\b/,
  /\bfinal de semana\b/,
  /\btodo fim de semana\b/,
  /\btodos os fins de semana\b/,
  /\bsabado e domingo\b/,
  /\btodo weekend\b/,
];

function nextWeekday(weekdayIndex: number, from: Date): Date {
  const diff = (weekdayIndex - from.getDay() + 7) % 7;
  return diff === 0 ? addDays(from, 7) : addDays(from, diff);
}

export class WeekendStrategy implements Strategy {
  name = "weekend";
  priority = 30;

  matches(frase: string): boolean {
    const n = normalize(frase);
    return PATTERNS.some((p) => p.test(n));
  }

  parse(frase: string, hoje: Date): StrategyResult[] {
    const titulo = extractTitle(frase, [
      /todos?\s+os?\s+fins?\s+de\s+semana/gi,
      /sabado\s+e\s+domingo/gi,
      /todo\s+weekend/gi,
      /(final|fim)\s+de\s+semana/gi,
    ]);

    return [
      {
        titulo,
        dataBase: nextWeekday(6, hoje),
        recorrenciaDias: 7,
      },
      {
        titulo,
        dataBase: nextWeekday(0, hoje),
        recorrenciaDias: 7,
      },
    ];
  }
}
