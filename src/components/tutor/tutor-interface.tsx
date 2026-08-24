"use client";

import { useEffect, useRef, useState } from "react";
import { TutorOutput } from "@/types/tutor-turn";

interface TutorInterfaceProps {
  sessionId: string;
  currentItemId: string;
  answered?: boolean;
  fallbackMessage?: string;
}

export function getTutorGuidedActions(answered: boolean) {
  return answered
    ? ["¿Por qué mi opción no funciona?", "Explícame la respuesta correcta", "¿Qué debo aprender?"]
    : ["Dame una pista", "Ayúdame a entender qué me preguntan", "Ayúdame a comparar opciones"];
}

export function TutorInterface({ sessionId, currentItemId, answered = false, fallbackMessage }: TutorInterfaceProps) {
  const guidedActions = getTutorGuidedActions(answered);
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [lastResponse, setLastResponse] = useState<TutorOutput | null>(null);
  const [fallbackVisible, setFallbackVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const draftStorageKey = `tutor-gcm:draft:${sessionId}:${currentItemId}`;

  useEffect(() => {
    setLastResponse(null);
    setFallbackVisible(false);
    setError(null);
    if (typeof window === "undefined") {
      setMessage("");
      return;
    }
    setMessage(window.sessionStorage.getItem(draftStorageKey) ?? "");
  }, [draftStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (message.trim()) {
      window.sessionStorage.setItem(draftStorageKey, message);
      return;
    }
    window.sessionStorage.removeItem(draftStorageKey);
  }, [draftStorageKey, message]);

  async function sendMessage(nextMessage: string, options?: { clearMessage?: boolean }) {
    if (!nextMessage.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tutor/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, itemId: currentItemId, message: nextMessage.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al consultar al Tutor AI");
      setLastResponse(data.output);
      setFallbackVisible(false);
      if (options?.clearMessage ?? true) setMessage("");
    } catch (err) {
      if (fallbackMessage) {
        setFallbackVisible(true);
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    await sendMessage(message);
  }

  if (!isOpen) {
    return (
      <button type="button" onClick={() => setIsOpen(true)} className="tutor-chip" data-testid="tutor-gcm-open-button">
        <div>
          <p className="eyebrow m-0">Tutor AI 🤖</p>
          <p className="body-sm m-0">Ayuda para razonar sin revelar la clave.</p>
        </div>
        <span className="status-pill premium">Abrir</span>
      </button>
    );
  }

  return (
    <section className="surface-card tutor-panel tutor-ai-panel" data-testid="tutor-gcm-panel" aria-label="Tutor AI">
      <div className="tutor-head">
        <div>
          <p className="eyebrow m-0">Tutor AI 🤖</p>
          <h3 className="section-title tutor-headline">Ayuda, pero no te revelamos la clave</h3>
        </div>
        <button type="button" onClick={() => setIsOpen(false)} className="subtle tutor-minimize">Minimizar</button>
      </div>

      <div className="tutor-conversation" aria-live="polite">
        <div className="tutor-message tutor-message-intro">
          Antes de responderte, el Tutor AI 🤖 debe hacerte pensar. Después puede explicarte por qué cada alternativa es plausible o no plausible.
        </div>
        {lastResponse ? <div className="tutor-message tutor-message-response">{lastResponse.visibleMessage}</div> : null}
        {fallbackVisible && fallbackMessage ? <div className="tutor-message tutor-message-response" data-testid="tutor-gcm-fallback">{fallbackMessage}</div> : null}
        {error ? <div className="tutor-message tutor-error-text">{error}</div> : null}
      </div>

      <div className="tutor-guided-list tutor-guided-list-compact">
        {guidedActions.map((action) => (
          <button key={action} type="button" className="guided-chip" disabled={loading} onClick={() => sendMessage(action, { clearMessage: false })}>
            {action}
          </button>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="form-grid-sm tutor-compose" data-testid="tutor-gcm-form">
        <div className="form-field">
          <label className="field-label" htmlFor="tutor-gcm-message">Pregunta al Tutor AI 🤖</label>
          <textarea
            ref={messageInputRef}
            id="tutor-gcm-message"
            data-testid="tutor-gcm-message"
            className="text-area text-area-compact"
            placeholder="Escribe tu pregunta sobre el caso o sobre cómo analizar las alternativas."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={loading}
          />
        </div>
        <button type="submit" className="primary-button" data-testid="tutor-gcm-submit" disabled={loading || !message.trim()}>
          {loading ? "Pensando..." : "Enviar"}
        </button>
      </form>
    </section>
  );
}
