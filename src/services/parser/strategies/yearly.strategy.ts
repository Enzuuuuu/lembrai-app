import type { Strategy, StrategyResult } from "../types";
import { normalize, extractTitle } from "../normalize";

const PATTERNS = [
  /\btodo ano\b/,
  /\banual\b/,
  /\banualmente\b/,
  /\buma vez por ano\b/,
  /\btodo ano nessa data\b/,
];

function nextYearSameDate(hoje: Date): Date {
  const candidate = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate()
  );
  if (candidate > hoje) return candidate;
  return new Date(
    hoje.getFullYear() + 1,
    hoje.getMonth(),
    hoje.getDate()
  );
}

export class YearlyStrategy implements Strategy {
  name = "yearly";
  priority = 45;

  matches(frase: string): boolean {
    const n = normalize(frase);
    return PATTERNS.some((p) => p.test(n));
  }

  parse(frase: string, hoje: Date): StrategyResult[] {
    const titulo = extractTitle(frase, [
      /todo\s+ano\s+(nessa\s+data)?/gi,
      /uma\s+vez\s+por\s+ano/gi,
      /anualmente/gi,
      /^anual$/gi,
    ]);

    const dataBase = nextYearSameDate(hoje);

    return [
      {
        titulo,
        dataBase,
        recorrenciaDias: 365,
      },
    ];
  }
}
