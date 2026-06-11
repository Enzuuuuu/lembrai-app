// ============================================================
// hooks/useVoice.ts — Reconhecimento de voz (Web Speech API)
// Responsável por: iniciar/parar escuta, retornar transcript
// e expor se o recurso está disponível no navegador.
// Zero dependências. Apenas Web Speech API nativa.
// ============================================================

import { useState, useRef, useCallback } from "react";
import { LABELS } from "../config";

type VoiceStatus = "idle" | "listening" | "processing" | "error";

export function useVoice(onResult: (text: string) => void) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const start = useCallback(() => {
    if (!isSupported) {
      setError(LABELS.feedback.voiceNotSupported);
      return;
    }

    const SR =
      (window as unknown as { SpeechRecognition: typeof SpeechRecognition })
        .SpeechRecognition ||
      (
        window as unknown as {
          webkitSpeechRecognition: typeof SpeechRecognition;
        }
      ).webkitSpeechRecognition;

    const recognition = new SR();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setStatus("listening");

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setStatus("processing");
      onResult(transcript);
      setStatus("idle");
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setError(e.error);
      setStatus("error");
    };

    recognition.onend = () => {
      if (status === "listening") setStatus("idle");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, onResult, status]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setStatus("idle");
  }, []);

  const statusLabel =
    status === "listening"
      ? LABELS.feedback.listening
      : status === "processing"
      ? LABELS.feedback.processing
      : null;

  return { start, stop, status, statusLabel, error, isSupported };
}
