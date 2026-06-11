// ============================================================
// components/EventoSection.tsx — Seção de eventos agrupados
// Responsável por: renderizar título de seção + lista de cards
// ou mensagem de lista vazia.
// ============================================================

import type { Evento, EventoStatus } from "../types";
import { LABELS } from "../config";
import { EventoCard } from "./EventoCard";

interface Props {
  titulo: string;
  eventos: Evento[];
  status: EventoStatus;
  onConcluir: (id: string) => void;
  onEditar: (evento: Evento) => void;
  onExcluir: (id: string) => void;
}

export function EventoSection({ titulo, eventos, status, onConcluir, onEditar, onExcluir }: Props) {
  return (
    <section className="evento-section">
      <h2 className="section-title">
        {titulo}
        {eventos.length > 0 && (
          <span className="section-count">{eventos.length}</span>
        )}
      </h2>

      {eventos.length === 0 ? (
        <p className="empty-state">{LABELS.feedback.noEvents}</p>
      ) : (
        <ul className="evento-list">
          {eventos.map((e) => (
            <li key={e.id}>
              <EventoCard
                evento={e}
                status={status}
                onConcluir={onConcluir}
                onEditar={onEditar}
                onExcluir={onExcluir}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
