import type { Strategy, StrategyResult } from "../types";
import { normalize, extractTitle } from "../normalize";
import { addDays } from "../../../utils/date.utils";

const DAYS: [RegExp, number][] = [
  [/domingos?\b/, 0],
  [/seg(?:unda(?:-feira)?)?\b/, 1],
  [/ter(?:ca(?:-feira)?)?\b/, 2],
  [/qua(?:rta(?:-feira)?)?\b/, 3],
  [/qui(?:nta(?:-feira)?)?\b/, 4],
  [/sex(?:ta(?:-feira)?)?\b/, 5],
  [/sab(?:ado)?\b/, 6],
];

const PREFIX = /\b(?:na|no|proxim[ao])\s+/;

function nextDayOfWeek(targetDay: number, from: Date): Date {
  const diff = (targetDay - from.getDay() + 7) % 7;
  return diff === 0 ? addDays(from, 7) : addDays(from, diff);
}

export class NextWeekdayStrategy implements Strategy {
  name = "next-weekday";
  priority = 72;

  matches(frase: string): boolean {
    const n = normalize(frase);
    if (!PREFIX.test(n)) return false;
    const hasDay = DAYS.some(([re]) => re.test(n));
    if (!hasDay) return false;
    const hasTodo = /\btod[ao]\s+/.test(n);
    return !hasTodo;
  }

  parse(frase: string, hoje: Date): StrategyResult[] {
    const n = normalize(frase);

    let targetDay = -1;
    let consumed = "";
    for (const [re, idx] of DAYS) {
      const m = n.match(re);
      if (m) {
        targetDay = idx;
        consumed = m[0];
        break;
      }
    }

    if (targetDay === -1) return [];

    const dayPattern = new RegExp(
      `(?:na|no|proxim[ao])\\s+(?:proxim[ao]\\s+)?${consumed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
      "gi"
    );

    const titulo = extractTitle(frase, [dayPattern]);
    const dataBase = nextDayOfWeek(targetDay, hoje);

    return [
      {
        titulo,
        dataBase,
      },
    ];
  }
}
