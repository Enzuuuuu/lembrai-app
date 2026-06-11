import type { Strategy, StrategyResult } from "../types";
import { normalize, extractTitle } from "../normalize";
import { addDays } from "../../../utils/date.utils";

const PATTERNS = [
  /\btodo dia util\b/,
  /\bdias uteis\b/,
  /\bsegunda a sexta\b/,
  /\bde segunda a sexta-feira\b/,
  /\bde segunda a sexta\b/,
  /\bdurante a semana\b/,
];

function nextWeekday(weekdayIndex: number, from: Date): Date {
  const diff = (weekdayIndex - from.getDay() + 7) % 7;
  return diff === 0 ? addDays(from, 7) : addDays(from, diff);
}

export class WeekdayDaysStrategy implements Strategy {
  name = "weekday-days";
  priority = 84;

  matches(frase: string): boolean {
    const n = normalize(frase);
    return PATTERNS.some((p) => p.test(n));
  }

  parse(frase: string, hoje: Date): StrategyResult[] {
    const titulo = extractTitle(frase, [
      /todo\s+dia\s+util/gi,
      /dias\s+uteis/gi,
      /(de\s+)?segunda\s+a\s+sexta(?:-feira)?/gi,
      /durante\s+a\s+semana/gi,
    ]);

    return [1, 2, 3, 4, 5].map((day) => ({
      titulo,
      dataBase: nextWeekday(day, hoje),
      recorrenciaDias: 7,
    }));
  }
}
