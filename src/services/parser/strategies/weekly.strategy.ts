import type { Strategy, StrategyResult } from "../types";
import { normalize, extractTitle } from "../normalize";
import { addDays } from "../../../utils/date.utils";

const PATTERNS = [
  /\btoda semana\b/,
  /\bsemanalmente\b/,
  /\b1x por semana\b/,
  /\buma vez por semana\b/,
  /\btoda semana nesse dia\b/,
  /\btoda semana mesmo dia\b/,
  /\bsemanal nesse dia\b/,
];

export class WeeklyStrategy implements Strategy {
  name = "weekly";
  priority = 70;

  matches(frase: string): boolean {
    const n = normalize(frase);
    return PATTERNS.some((p) => p.test(n));
  }

  parse(frase: string, hoje: Date): StrategyResult[] {
    const titulo = extractTitle(frase, [
      /semanal\s+nesse\s+dia/gi,
      /toda\s+semana\s+(nesse\s+dia|mesmo\s+dia)/gi,
      /1x\s+por\s+semana/gi,
      /uma\s+vez\s+por\s+semana/gi,
      /semanalmente/gi,
      /toda\s+semana/gi,
    ]);

    const diaSemana = hoje.getDay();
    const diff = (diaSemana - hoje.getDay() + 7) % 7;
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
