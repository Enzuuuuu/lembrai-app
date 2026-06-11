import { normalize } from "./normalize";
import { classify } from "./classify";
import { today, toISODate } from "../../utils/date.utils";
import type { ParseResult } from "../../types";

export function parsePhrase(frase: string): ParseResult | null {
  const trimmed = frase.trim();
  if (!trimmed) return null;

  const n = normalize(trimmed);
  const hoje = today();
  const strategy = classify(n);

  if (strategy) {
    const results = strategy.parse(frase, hoje);
    if (results.length === 0) return null;

    const first = results[0];
    return {
      titulo: first.titulo,
      dataBase: toISODate(first.dataBase),
      recorrencia: first.recorrenciaDias,
    };
  }

  return null;
}

export function parseAll(frase: string): ParseResult[] {
  const trimmed = frase.trim();
  if (!trimmed) return [];

  const n = normalize(trimmed);
  const hoje = today();
  const strategy = classify(n);

  if (strategy) {
    const results = strategy.parse(frase, hoje);
    if (results.length === 0) return [];

    return results.map((r) => ({
      titulo: r.titulo,
      dataBase: toISODate(r.dataBase),
      recorrencia: r.recorrenciaDias,
    }));
  }

  return [];
}
