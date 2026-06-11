import type { Strategy, StrategyResult } from "../types";
import { normalize, extractTitle } from "../normalize";
import { addDays } from "../../../utils/date.utils";

const PATTERNS: [RegExp, (m: RegExpMatchArray, hoje: Date) => Date][] = [
  [
    /daqui a (\d+) dias?/,
    (m, hoje) => addDays(hoje, parseInt(m[1])),
  ],
  [
    /daqui a (\d+) semanas?/,
    (m, hoje) => addDays(hoje, parseInt(m[1]) * 7),
  ],
  [
    /daqui a (\d+) meses?/,
    (m, hoje) => {
      const d = new Date(hoje);
      d.setMonth(d.getMonth() + parseInt(m[1]));
      return d;
    },
  ],
];

export class InXStrategy implements Strategy {
  name = "in-x";
  priority = 75;

  matches(frase: string): boolean {
    const n = normalize(frase);
    return PATTERNS.some(([re]) => re.test(n));
  }

  parse(frase: string, hoje: Date): StrategyResult[] {
    const n = normalize(frase);

    for (const [re, fn] of PATTERNS) {
      const m = n.match(re);
      if (m) {
        const consumed = new RegExp(
          m[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "gi"
        );
        const titulo = extractTitle(frase, [consumed]);
        return [
          {
            titulo,
            dataBase: fn(m, hoje),
          },
        ];
      }
    }

    return [];
  }
}
