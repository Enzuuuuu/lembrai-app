export function normalize(frase: string): string {
  return frase
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function extractTitle(
  frase: string,
  additionalPatterns: RegExp[] = []
): string {
  const patterns: RegExp[] = [
    /\b(hoje|amanh[ãa]|depois de amanh[ãa])\b/gi,
    /\b(daqui a \d+ (dias?|semanas?|meses?))\b/gi,
    /\b(proxim[ao] \w+)\b/gi,
    /\b(na|no) (proxim[ao] )?(domingo|segunda|ter[cç]a|quarta|quinta|sexta|s[áa]bado)\b/gi,
    ...additionalPatterns,
  ];

  let clean = frase;
  for (const p of patterns) {
    clean = clean.replace(p, "");
  }

  clean = clean.replace(/[.,!?]+$/, "").replace(/\s+/g, " ").trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1) || frase.trim();
}
