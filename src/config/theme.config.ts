// ============================================================
// theme.config.ts — Tokens de design centralizados
// Troque aqui: paleta, tipografia, raios, sombras.
// Importado pelo index.css como variáveis CSS e usado
// pelo Tailwind (tailwind.config.ts) como tema customizado.
// ============================================================

export const THEME = {
  // --- Paleta ---
  colors: {
    // Backgrounds
    bgBase: "#0F0F14",       // fundo principal da app
    bgSurface: "#17171F",    // cards, modais
    bgElevated: "#1F1F2A",   // inputs, hover

    // Acento principal
    accent: "#6C63FF",       // roxo elétrico — identidade
    accentHover: "#8A83FF",
    accentMuted: "#6C63FF22",

    // Semânticas
    overdue: "#FF5C5C",      // vermelho — atrasado
    today: "#FFB347",        // laranja — hoje
    upcoming: "#4ECDC4",     // verde-água — próximo

    // Texto
    textPrimary: "#F0EFF8",
    textSecondary: "#9897B0",
    textMuted: "#5A5970",

    // Bordas
    border: "#2A2A38",
    borderFocus: "#6C63FF",
  },

  // --- Tipografia ---
  fonts: {
    // Fonte principal — UI e corpo
    sans: "'Inter', system-ui, sans-serif",
    // Fonte monoespaçada — datas, IDs, badges
    mono: "'JetBrains Mono', 'Fira Mono', monospace",
  },

  // Font sizes (rem)
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
  },

  // --- Espaçamento base (4px grid) ---
  spacing: {
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
    "16": "4rem",
  },

  // --- Raios de borda ---
  radius: {
    sm: "6px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    full: "9999px",
  },

  // --- Sombras ---
  shadows: {
    card: "0 2px 12px rgba(0,0,0,0.4)",
    modal: "0 8px 32px rgba(0,0,0,0.6)",
    glow: "0 0 20px rgba(108,99,255,0.25)",
  },

  // --- Transições ---
  transitions: {
    fast: "150ms ease",
    base: "250ms ease",
    slow: "400ms ease",
  },
} as const;

// Helper — gera o bloco :root com todas as CSS vars
// Usado em main.tsx para injetar o tema dinamicamente.
export function buildCssVars(theme: typeof THEME): string {
  const lines: string[] = [];

  for (const [colorKey, value] of Object.entries(theme.colors)) {
    lines.push(`  --color-${camel2kebab(colorKey)}: ${value};`);
  }
  lines.push(`  --font-sans: ${theme.fonts.sans};`);
  lines.push(`  --font-mono: ${theme.fonts.mono};`);
  for (const [key, value] of Object.entries(theme.radius)) {
    lines.push(`  --radius-${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(theme.shadows)) {
    lines.push(`  --shadow-${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(theme.transitions)) {
    lines.push(`  --transition-${key}: ${value};`);
  }

  return `:root {\n${lines.join("\n")}\n}`;
}

function camel2kebab(str: string): string {
  return str.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
}
