// ============================================================
// components/EventoForm.tsx — Formulário de criação/edição
// Responsável por: exibir campos do evento, integrar input
// por texto e voz, exibir prévia do parser, confirmar/salvar.
// ============================================================

import { useState } from "react";
import type { Evento } from "../types";
import { LABELS, RECURRENCE_PRESETS } from "../config";
import { parsePhrase } from "../services/parser.service";
import { useVoice } from "../hooks/useVoice";
import { toISODate, today } from "../utils/date.utils";

interface Props {
  inicial?: Evento;
  onSalvar: (data: Omit<Evento, "id" | "ativo" | "criadoEm"> & { id?: string }) => void;
  onCancelar: () => void;
}

export function EventoForm({ inicial, onSalvar, onCancelar }: Props) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? "");
  const [dataReferencia, setDataReferencia] = useState(
    inicial?.dataReferencia ?? toISODate(today())
  );
  const [recorrenciaDias, setRecorrenciaDias] = useState<number | undefined>(
    inicial?.recorrenciaDias
  );
  const [recorrenciaCustom, setRecorrenciaCustom] = useState(
    inicial?.recorrenciaDias?.toString() ?? ""
  );
  const [observacoes, setObservacoes] = useState(inicial?.observacoes ?? "");
  const [fraseRapida, setFraseRapida] = useState("");
  const [parseError, setParseError] = useState(false);

  // Preenche o formulário a partir de uma frase rápida (texto ou voz)
  function aplicarFrase(frase: string) {
    const result = parsePhrase(frase);
    if (!result) {
      setParseError(true);
      return;
    }
    setParseError(false);
    setTitulo(result.titulo);
    setDataReferencia(result.dataBase);
    if (result.recorrencia !== undefined) setRecorrenciaDias(result.recorrencia);
    setFraseRapida("");
  }

  const { start, stop, status, statusLabel, isSupported } = useVoice(aplicarFrase);
  const isListening = status === "listening";

  function handleSubmit() {
    if (!titulo.trim()) return;
    onSalvar({
      id: inicial?.id,
      titulo: titulo.trim(),
      dataReferencia,
      recorrenciaDias,
      observacoes: observacoes.trim() || undefined,
    });
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancelar()}>
      <div className="modal">
        <h2 className="modal__title">
          {inicial ? LABELS.actions.edit : LABELS.actions.add}
        </h2>

        {/* Input rápido por frase */}
        <div className="form-row form-row--voice">
          <input
            className="input"
            placeholder={LABELS.placeholders.inputText}
            value={fraseRapida}
            onChange={(e) => { setFraseRapida(e.target.value); setParseError(false); }}
            onKeyDown={(e) => e.key === "Enter" && aplicarFrase(fraseRapida)}
          />
          {isSupported && (
            <button
              className={`btn btn--icon ${isListening ? "btn--active" : ""}`}
              onClick={isListening ? stop : start}
              title={isListening ? LABELS.actions.stopListening : LABELS.actions.listen}
            >
              🎙
            </button>
          )}
          <button
            className="btn btn--secondary btn--sm"
            onClick={() => aplicarFrase(fraseRapida)}
          >
            Interpretar
          </button>
        </div>

        {statusLabel && <p className="form-hint form-hint--info">{statusLabel}</p>}
        {parseError && <p className="form-hint form-hint--error">{LABELS.feedback.parseError}</p>}

        <hr className="divider" />

        {/* Campos detalhados */}
        <div className="form-field">
          <label className="label">{LABELS.form.titleLabel}</label>
          <input
            className="input"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="label">{LABELS.form.dateLabel}</label>
          <input
            className="input"
            type="date"
            value={dataReferencia}
            onChange={(e) => setDataReferencia(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="label">{LABELS.form.recurrenceLabel}</label>
          <select
            className="input"
            value={recorrenciaDias ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "custom") { setRecorrenciaDias(undefined); return; }
              setRecorrenciaDias(v === "" ? undefined : Number(v));
            }}
          >
            {RECURRENCE_PRESETS.map((p) => (
              <option key={String(p.value)} value={p.value ?? ""}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {recorrenciaDias === undefined && recorrenciaCustom !== "" && (
          <div className="form-field">
            <input
              className="input"
              type="number"
              min={1}
              placeholder="Ex: 45"
              value={recorrenciaCustom}
              onChange={(e) => {
                setRecorrenciaCustom(e.target.value);
                setRecorrenciaDias(Number(e.target.value));
              }}
            />
          </div>
        )}

        <div className="form-field">
          <label className="label">{LABELS.form.notesLabel}</label>
          <textarea
            className="input input--textarea"
            placeholder={LABELS.placeholders.notes}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={2}
          />
        </div>

        <div className="modal__actions">
          <button className="btn btn--ghost" onClick={onCancelar}>
            {LABELS.actions.cancel}
          </button>
          <button className="btn btn--primary" onClick={handleSubmit} disabled={!titulo.trim()}>
            {LABELS.actions.save}
          </button>
        </div>
      </div>
    </div>
  );
}
