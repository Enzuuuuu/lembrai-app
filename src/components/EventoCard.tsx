// ============================================================
// components/EventoCard.tsx — Card de exibição de um evento
// Responsável por: mostrar título, data, badge de status,
// e botões de ação (concluir, editar, excluir).
// ============================================================

import type { Evento, EventoStatus } from "../types";
import { LABELS } from "../config";
import { formatDisplay } from "../utils/date.utils";
import { diasParaVencimento } from "../services/recurrence.service";

interface Props {
  evento: Evento;
  status: EventoStatus;
  onConcluir: (id: string) => void;
  onEditar: (evento: Evento) => void;
  onExcluir: (id: string) => void;
}

const STATUS_STYLES: Record<EventoStatus, string> = {
  overdue: "badge--overdue",
  today: "badge--today",
  upcoming: "badge--upcoming",
};

function diasLabel(status: EventoStatus, dias: number): string {
  if (status === "overdue") return `${Math.abs(dias)}d atrasado`;
  if (status === "today") return "hoje";
  return `em ${dias}d`;
}

export function EventoCard({ evento, status, onConcluir, onEditar, onExcluir }: Props) {
  const dias = diasParaVencimento(evento);

  return (
    <article className="evento-card">
      <div className="evento-card__main">
        <span className={`badge ${STATUS_STYLES[status]}`}>
          {diasLabel(status, dias)}
        </span>
        <h3 className="evento-card__titulo">{evento.titulo}</h3>
        <p className="evento-card__data">{formatDisplay(evento.dataReferencia)}</p>
        {evento.recorrenciaDias && (
          <p className="evento-card__recorrencia">
            ↻ a cada {evento.recorrenciaDias} dias
          </p>
        )}
        {evento.observacoes && (
          <p className="evento-card__obs">{evento.observacoes}</p>
        )}
      </div>

      <div className="evento-card__actions">
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => onConcluir(evento.id)}
          title={LABELS.actions.done}
        >
          ✓
        </button>
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => onEditar(evento)}
          title={LABELS.actions.edit}
        >
          ✎
        </button>
        <button
          className="btn btn--ghost btn--sm btn--danger"
          onClick={() => onExcluir(evento.id)}
          title={LABELS.actions.delete}
        >
          ✕
        </button>
      </div>
    </article>
  );
}
