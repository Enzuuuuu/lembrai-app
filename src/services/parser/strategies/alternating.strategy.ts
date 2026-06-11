import type { Strategy, StrategyResult } from "../types";
import { normalize, extractTitle } from "../normalize";
import { addDays } from "../../../utils/date.utils";

const PHRASES: [RegExp, number, RegExp][] = [
  [/\bdia sim dia nao\b/, 2, /dia\s+sim\s+dia\s+nao/gi],
  [/\bum dia sim outro nao\b/, 2, /um\s+dia\s+sim\s+outro\s+nao/gi],
  [/\balternado\b/, 2, /alternado/gi],
  [/\bintercalado\b/, 2, /intercalado/gi],
  [/\bsemana sim semana nao\b/, 14, /semana\s+sim\s+semana\s+nao/gi],
  [/\buma semana sim outra nao\b/, 14, /uma\s+semana\s+sim\s+outra\s+nao/gi],
  [/\bquinzenal alternado\b/, 14, /quinzenal\s+alternado/gi],
  [/\balterna semanas\b/, 14, /alterna\s+semanas/gi],
  [/\bmes sim mes nao\b/, 60, /mes\s+sim\s+mes\s+nao/gi],
  [/\bbimestral alternado\b/, 60, /bimestral\s+alternado/gi],
  [/\ba cada 2 meses\b/, 60, /a\s+cada\s+2\s+meses/gi],
  [/\balterna meses\b/, 60, /alterna\s+meses/gi],
];

export class AlternatingStrategy implements Strategy {
  name = "alternating";
  priority = 35;

  matches(frase: string): boolean {
    const n = normalize(frase);
    return PHRASES.some(([re]) => re.test(n));
  }

  parse(frase: string, hoje: Date): StrategyResult[] {
    const n = normalize(frase);

    let interval = 0;
    let consumed: RegExp = /(?:)/;

    for (const [re, days, strip] of PHRASES) {
      if (re.test(n)) {
        interval = days;
        consumed = strip;
        break;
      }
    }

    if (interval <= 0) return [];

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
