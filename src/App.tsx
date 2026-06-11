// ============================================================
// App.tsx — Componente raiz da aplicação
// Responsável por: montar layout principal, gerenciar modal
// de criação/edição, e delegar estado ao useEventos.
// ============================================================

import { useState } from "react";
import type { Evento } from "./types";
import { APP, LABELS } from "./config";
import { useEventos } from "./hooks/useEventos";
import { agruparEventos } from "./services/recurrence.service";
import { EventoSection } from "./components/EventoSection";
import { EventoForm } from "./components/EventoForm";

export default function App() {
  const { eventos, loading, salvar, excluir, concluir } = useEventos();
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Evento | undefined>(undefined);

  const { atrasados, hoje, proximos } = agruparEventos(eventos);

  function abrirNovo() {
    setEditando(undefined);
    setModalAberto(true);
  }

  function abrirEditar(evento: Evento) {
    setEditando(evento);
    setModalAberto(true);
  }

  function handleSalvar(data: Parameters<typeof salvar>[0]) {
    salvar(data);
    setModalAberto(false);
  }

  function handleExcluir(id: string) {
    if (confirm(LABELS.confirmations.deleteEvent)) excluir(id);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">{APP.name}</h1>
        <button className="btn btn--primary" onClick={abrirNovo}>
          + {LABELS.actions.add}
        </button>
      </header>

      <main className="app-main">
        {loading ? (
          <p className="loading">Carregando…</p>
        ) : (
          <>
            <EventoSection
              titulo={LABELS.sections.overdue}
              eventos={atrasados}
              status="overdue"
              onConcluir={concluir}
              onEditar={abrirEditar}
              onExcluir={handleExcluir}
            />
            <EventoSection
              titulo={LABELS.sections.today}
              eventos={hoje}
              status="today"
              onConcluir={concluir}
              onEditar={abrirEditar}
              onExcluir={handleExcluir}
            />
            <EventoSection
              titulo={LABELS.sections.upcoming}
              eventos={proximos}
              status="upcoming"
              onConcluir={concluir}
              onEditar={abrirEditar}
              onExcluir={handleExcluir}
            />
          </>
        )}
      </main>

      {modalAberto && (
        <EventoForm
          inicial={editando}
          onSalvar={handleSalvar}
          onCancelar={() => setModalAberto(false)}
        />
      )}
    </div>
  );
}
