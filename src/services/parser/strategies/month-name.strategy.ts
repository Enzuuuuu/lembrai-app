import type { Strategy, StrategyResult } from "../types";
import { normalize, extractTitle } from "../normalize";

const MONTHS: [RegExp, number][] = [
  [/janeiro/, 0],
  [/fev(?:ereiro)?/, 1],
  [/mar(?:co)?/, 2],
  [/abr(?:il)?/, 3],
  [/mai(?:o)?/, 4],
  [/jun(?:ho)?/, 5],
  [/jul(?:ho)?/, 6],
  [/ago(?:sto)?/, 7],
  [/set(?:embro)?/, 8],
  [/out(?:ubro)?/, 9],
  [/nov(?:embro)?/, 10],
  [/dez(?:embro)?/, 11],
];

const PREFIX = /\btod[ao]\s+/;

function nextMonthOccurrence(
  monthIndex: number,
  day: number,
  from: Date
): Date {
  const currentYear = from.getFullYear();
  const candidate = new Date(currentYear, monthIndex, 1);
  const candidateDay = Math.min(day, new Date(currentYear, monthIndex + 1, 0).getDate());

  if (candidate > from) {
    return new Date(currentYear, monthIndex, candidateDay);
  }

  return new Date(currentYear + 1, monthIndex, candidateDay);
}

export class MonthNameStrategy implements Strategy {
  name = "month-name";
  priority = 50;

  matches(frase: string): boolean {
    const n = normalize(frase);
    if (!PREFIX.test(n) && !/\banual\s+em\s/.test(n)) return false;
    return MONTHS.some(([re]) => re.test(n));
  }

  parse(frase: string, hoje: Date): StrategyResult[] {
    const n = normalize(frase);

    let monthIndex = -1;
    let monthMatch = "";
    for (const [re, idx] of MONTHS) {
      if (re.test(n)) {
        monthIndex = idx;
        monthMatch = n.match(re)![0];
        break;
      }
    }

    if (monthIndex === -1) return [];

    let day = hoje.getDate();
    const diaMatch = n.match(/dia\s+(\d{1,2})/);
    if (diaMatch) {
      day = Math.min(parseInt(diaMatch[1], 10), 31);
    }

    const isUltimo = /ultimo\s+dia/.test(n);
    if (isUltimo) {
      day = new Date(hoje.getFullYear(), monthIndex + 1, 0).getDate();
    }

    const consumed = new RegExp(
      `tod[ao]\\s+${monthMatch}\\s*(?:dia\\s+\\d{1,2})?|anual\\s+em\\s+${monthMatch}`,
      "gi"
    );

    const titulo = extractTitle(frase, [consumed, /(?:todo|anual em) \w+/gi]);
    const dataBase = nextMonthOccurrence(monthIndex, day, hoje);

    return [
      {
        titulo,
        dataBase,
        recorrenciaDias: 365,
      },
    ];
  }
}
