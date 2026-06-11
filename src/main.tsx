// ============================================================
// main.tsx — Ponto de entrada da aplicação
// Injeta as CSS vars geradas pelo theme.config e monta o React.
// ============================================================

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { buildCssVars, THEME } from "./config";
import "./styles/globals.css";

// Injeta o tema como variáveis CSS no :root
const style = document.createElement("style");
style.textContent = buildCssVars(THEME);
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
