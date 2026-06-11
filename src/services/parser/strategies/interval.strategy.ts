import type { Strategy, StrategyResult } from "../types";
import { normalize, extractTitle } from "../normalize";
import { addDays } from "../../../utils/date.utils";

const PATTERNS: [RegExp, (m: RegExpMatchArray) => number][] = [
  [/a\s+cada\s+(\d+)\s+mes(?:es)?/, (m) => parseInt(m[1]) * 30],
  [/a\s+cada\s+(\d+)\s+semanas?/, (m) => parseInt(m[1]) * 7],
  [/a\s+cada\s+(\d+)\s+dias?/, (m) => parseInt(m[1])],
  [/de\s+(\d+)\s+em\s+(\d+)\s+dias?/, (m) => parseInt(m[1])],
  [/a\s+cada\s+(\d+)\s+meses?/, (m) => parseInt(m[1]) * 30],
  [/intervalo\s+de\s+(\d+)\s+dias?/, (m) => parseInt(m[1])],
];

export class IntervalStrategy implements Strategy {
  name = "interval";
  priority = 40;

  matches(frase: string): boolean {
    const n = normalize(frase);
    return PATTERNS.some(([re]) => re.test(n));
  }

  parse(frase: string, hoje: Date): StrategyResult[] {
    const n = normalize(frase);

    let interval = 0;
    let matched = "";

    for (const [re, fn] of PATTERNS) {
      const m = n.match(re);
      if (m) {
        interval = fn(m);
        matched = m[0];
        break;
      }
    }

    if (interval <= 0) return [];

    const consumed = new RegExp(matched.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const titulo = extractTitle(frase, [consumed]);

    return [
      {
        titulo,
        dataBase: addDays(hoje, 1),
        recorrenciaDias: interval,
      },
    ];
  }
}
