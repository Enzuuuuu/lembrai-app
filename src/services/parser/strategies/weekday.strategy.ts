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

const PREFIX = /\btod[ao]\s+(?:as\s+)?/;

export class WeekdayStrategy implements Strategy {
  name = "weekday";
  priority = 65;

  matches(frase: string): boolean {
    const n = normalize(frase);
    if (!PREFIX.test(n)) return false;
    const rest = n.replace(PREFIX, "").trim();
    return DAYS.some(([re]) => re.test(rest));
  }

  parse(frase: string, hoje: Date): StrategyResult[] {
    const n = normalize(frase);
    const rest = n.replace(PREFIX, "").trim();

    let targetDay = -1;
    let consumed = "";
    for (const [re, idx] of DAYS) {
      if (re.test(rest)) {
        targetDay = idx;
        consumed = rest.match(re)![0];
        break;
      }
    }

    const dayPattern = new RegExp(
      `tod[ao]s?\\s+(?:as\\s+)?${consumed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*(da semana)?`,
      "gi"
    );

    const titulo = extractTitle(frase, [dayPattern]);

    const diff = (targetDay - hoje.getDay() + 7) % 7;
    const offset = diff === 0 ? 7 : diff;

    return [
      {
        titulo,
        dataBase: addDays(hoje, offset),
        recorrenciaDias: 7,
      },
    ];
  }
}
