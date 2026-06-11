// ============================================================
// hooks/useEventos.ts — Estado global dos eventos
// Responsável por: carregar, salvar, editar, excluir e marcar
// eventos. É a única camada que toca o db.service.
// ============================================================

import { useState, useEffect, useCallback } from "react";
import type { Evento } from "../types";
import { dbGetAll, dbSave, dbDelete } from "../services/db.service";
import { marcarConcluido } from "../services/recurrence.service";
import { generateId, toISODate, today } from "../utils/date.utils";

export function useEventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega todos os eventos do IndexedDB ao montar
  useEffect(() => {
    dbGetAll()
      .then((data) => setEventos(data))
      .finally(() => setLoading(false));
  }, []);

  const salvar = useCallback(
    async (
      partial: Omit<Evento, "id" | "ativo" | "criadoEm"> & { id?: string }
    ) => {
      const isNew = !partial.id;
      const evento: Evento = {
        id: partial.id ?? generateId(),
        titulo: partial.titulo,
        dataReferencia: partial.dataReferencia,
        recorrenciaDias: partial.recorrenciaDias,
        observacoes: partial.observacoes,
        ativo: true,
        criadoEm: partial.id
          ? eventos.find((e) => e.id === partial.id)?.criadoEm ?? toISODate(today())
          : toISODate(today()),
      };

      await dbSave(evento);
      setEventos((prev) =>
        isNew ? [...prev, evento] : prev.map((e) => (e.id === evento.id ? evento : e))
      );
    },
    [eventos]
  );

  const excluir = useCallback(async (id: string) => {
    await dbDelete(id);
    setEventos((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const concluir = useCallback(
    async (id: string) => {
      const evento = eventos.find((e) => e.id === id);
      if (!evento) return;

      const atualizado = marcarConcluido(evento);
      await dbSave(atualizado);
      setEventos((prev) =>
        atualizado.ativo
          ? prev.map((e) => (e.id === id ? atualizado : e))
          : prev.filter((e) => e.id !== id)
      );
    },
    [eventos]
  );

  return { eventos, loading, salvar, excluir, concluir };
}
