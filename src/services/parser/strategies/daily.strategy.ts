import type { Strategy, StrategyResult } from "../types";
import { normalize, extractTitle } from "../normalize";
import { addDays } from "../../../utils/date.utils";

const PATTERNS = [
  /\btodo dia\b/,
  /\btodos os dias\b/,
  /\btodos dias\b/,
  /\bdiariamente\b/,
  /\bcada dia\b/,
  /\bde forma diaria\b/,
  /\bdia a dia\b/,
  /\btodo santo dia\b/,
];

export class DailyStrategy implements Strategy {
  name = "daily";
  priority = 80;

  matches(frase: string): boolean {
    const n = normalize(frase);
    return PATTERNS.some((p) => p.test(n));
  }

  parse(frase: string, hoje: Date): StrategyResult[] {
    const titulo = extractTitle(frase, [
      /todo\s+santo\s+dia/gi,
      /dia\s+a\s+dia/gi,
      /de\s+forma\s+diaria/gi,
      /cada\s+dia/gi,
      /diariamente/gi,
      /todos?\s+(os\s+)?dias/gi,
      /todo\s+dia/gi,
    ]);
    return [
      {
        titulo,
        dataBase: addDays(hoje, 1),
        recorrenciaDias: 1,
      },
    ];
  }
}
