import type { Strategy, StrategyResult } from "../types";
import { normalize, extractTitle } from "../normalize";
import { addDays } from "../../../utils/date.utils";

const PATTERNS: [RegExp, (hoje: Date) => Date, RegExp][] = [
  [/\bamanha\b/, (hoje) => addDays(hoje, 1), /\bamanha\b/gi],
  [/\bdepois de amanha\b/, (hoje) => addDays(hoje, 2), /\bdepois de amanha\b/gi],
];

export class TomorrowStrategy implements Strategy {
  name = "tomorrow";
  priority = 95;

  matches(frase: string): boolean {
    const n = normalize(frase);
    return PATTERNS.some(([re]) => re.test(n));
  }

  parse(frase: string, hoje: Date): StrategyResult[] {
    const n = normalize(frase);

    for (const [re, fn, strip] of PATTERNS) {
      if (re.test(n)) {
        const titulo = extractTitle(frase, [strip]);
        return [
          {
            titulo,
            dataBase: fn(hoje),
          },
        ];
      }
    }

    return [];
  }
}
