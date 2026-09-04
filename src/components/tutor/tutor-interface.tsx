"use client";

import { useEffect, useRef, useState } from "react";
import { buildClientTutorHistory } from "@/lib/tutor/tutor-conversation";
import type { PracticeMode, TutorProfile } from "@/types/session";

interface TutorInterfaceProps {
  sessionId: string;
  currentItemId: string;
  answered?: boolean;
  mode?: PracticeMode;
  profile?: TutorProfile;
  onProfileChange?: (profile: TutorProfile) => void;
  fallbackMessage?: string;
  onTurnExecuted?: () => void;
}

interface TutorMessage {
  role: "assistant" | "user";
  text: string;
}

const initialTutorMessage =
  "El Tutor GCM te ayuda a organizar el análisis sin indicar ni descartar respuestas.";

export function getTutorGuidedActions(answered: boolean, mode: PracticeMode = "guided") {
  if (mode === "simulation" && !answered) {
    return [];
  }
  return answered
    ? [
        "¿Por qué mi opción no funciona?",
        "Explícame la respuesta correcta",
        "Pedir explicación alternativa",
        "Comparar mi opción con la clave",
        "Preguntar por fundamento documental",
        "Pedir ejemplo de transferencia",
        "Resumir el aprendizaje",
      ]
    : [
        "Identificar hechos y responsabilidades",
        "Definir criterios para decidir",
        "Comparar consecuencias sin elegir por mí",
        "Ayúdame a comparar opciones",
        "Dame una pista",
      ];
}

export function TutorInterface({
  sessionId,
  currentItemId,
  answered = false,
  mode = "guided",
  profile: externalProfile = "socratic",
  onProfileChange,
  fallbackMessage,
  onTurnExecuted,
}: TutorInterfaceProps) {
  const [draft, setDraft] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<TutorProfile>(externalProfile);
  const [messages, setMessages] = useState<TutorMessage[]>([{ role: "assistant", text: initialTutorMessage }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const draftStorageKey = `tutor-ai:draft:${sessionId}:${currentItemId}`;

  useEffect(() => {
    setSelectedProfile(externalProfile);
  }, [externalProfile]);

  useEffect(() => {
    setMessages([{ role: "assistant", text: initialTutorMessage }]);
    setError(null);

    if (typeof window === "undefined") {
      setDraft("");
      return;
    }

    setDraft(window.sessionStorage.getItem(draftStorageKey) ?? "");
  }, [draftStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (draft.trim()) {
      window.sessionStorage.setItem(draftStorageKey, draft);
      return;
    }

    window.sessionStorage.removeItem(draftStorageKey);
  }, [draft, draftStorageKey]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight });
  }, [messages]);

  function handleProfileSelect(newProfile: TutorProfile) {
    setSelectedProfile(newProfile);
    if (onProfileChange) {
      onProfileChange(newProfile);
    }
  }

  async function sendTutorMessage(rawMessage: string) {
    const message = rawMessage.trim();
    if (!message || loading) return;

    if (mode === "simulation" && !answered) {
      setError("El Tutor antes de responder está deshabilitado en modo Simulación.");
      return;
    }

    setLoading(true);
    setError(null);
    const history = buildClientTutorHistory(messages);
    setMessages((current: TutorMessage[]) => [...current, { role: "user", text: message }]);

    try {
      const response = await fetch("/api/tutor/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          itemId: currentItemId,
          message,
          history,
          mode,
          profile: selectedProfile,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al consultar al tutor");
      }

      setMessages((current: TutorMessage[]) => [...current, { role: "assistant", text: data.output.visibleMessage }]);
      setDraft("");
      if (onTurnExecuted && !answered) {
        onTurnExecuted();
      }
    } catch (err) {
      const text = fallbackMessage || (err instanceof Error ? err.message : "Error desconocido");
      setMessages((current: TutorMessage[]) => [...current, { role: "assistant", text }]);
      setError(fallbackMessage ? null : text);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendTutorMessage(draft);
  }

  const guidedActions = getTutorGuidedActions(answered, mode);

  return (
    <section className="card tutor-panel" data-testid="tutor-gcm-panel" aria-label="Tutor GCM vNext">
      <div className="tutor-header">
        <p className="eyebrow">TUTOR GCM 🤖</p>
        <span className={`tutor-mode-badge mode-${mode}`}>
          {mode === "guided" ? "Práctica Guiada" : mode === "simulation" ? "Simulación" : "Revisión"}
        </span>
      </div>

      <div className="tutor-profile-selector" style={{ margin: "0.5rem 0" }}>
        <label htmlFor="tutor-profile-select" className="small" style={{ marginRight: "0.5rem" }}>
          Perfil del Tutor:
        </label>
        <select
          id="tutor-profile-select"
          data-testid="tutor-profile-select"
          value={selectedProfile}
          onChange={(e) => handleProfileSelect(e.target.value as TutorProfile)}
          className="small-select"
          disabled={loading}
        >
          <option value="socratic">Socrático (Preguntas guiadas)</option>
          <option value="direct">Directo (Criterios neutros)</option>
          <option value="brief">Breve (Viñetas sintéticas)</option>
        </select>
      </div>

      {mode === "simulation" && !answered ? (
        <div className="card hint small warning-banner" style={{ background: "rgba(255,193,7,0.1)", margin: "0.5rem 0" }}>
          <strong>Modo Simulación:</strong> El Tutor previo está deshabilitado para evaluar tu desempeño independiente. Se activará tras responder.
        </div>
      ) : null}

      <div className="tutor-chat" ref={chatRef} aria-live="polite">
        {messages.map((message: TutorMessage, index: number) => (
          <div key={`${message.role}-${index}`} className={message.role === "assistant" ? "tutor-message" : "user-message"}>
            {message.text}
          </div>
        ))}
      </div>

      {guidedActions.length > 0 ? (
        <div className="tutor-guided-actions" aria-label="Disparadores pedagógicos del Tutor">
          {guidedActions.map((action) => (
            <button
              key={action}
              type="button"
              className="secondary tutor-action"
              onClick={() => sendTutorMessage(action)}
              disabled={loading || (mode === "simulation" && !answered)}
            >
              {action}
            </button>
          ))}
        </div>
      ) : null}

      <form className="tutor-input" onSubmit={handleSendMessage} data-testid="tutor-gcm-form">
        <textarea
          id="tutor-gcm-message"
          data-testid="tutor-gcm-message"
          placeholder={
            mode === "simulation" && !answered
              ? "Tutor deshabilitado en simulación previa..."
              : "Consulta al Tutor GCM (sin revelar la clave)..."
          }
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={loading || (mode === "simulation" && !answered)}
        />
        <button
          type="submit"
          className="primary"
          data-testid="tutor-gcm-submit"
          disabled={loading || !draft.trim() || (mode === "simulation" && !answered)}
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>
      {error ? <p className="small tutor-error-text" style={{ color: "#d9534f" }}>{error}</p> : null}
    </section>
  );
}

