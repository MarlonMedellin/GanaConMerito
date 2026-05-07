"use client";

import { useEffect, useRef, useState } from "react";
import { TutorOutput } from "@/types/tutor-turn";

interface TutorInterfaceProps {
  sessionId: string;
  currentItemId: string;
}

const guidedPrompts = [
  "Dame una pista sin decirme la respuesta correcta.",
  "Compárame dos opciones sin revelar la correcta.",
  "Explícame el feedback oficial después de responder.",
] as const;

export function TutorInterface({ sessionId, currentItemId }: TutorInterfaceProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [lastResponse, setLastResponse] = useState<TutorOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const draftStorageKey = `tutor-gcm:draft:${sessionId}:${currentItemId}`;

  useEffect(() => {
    setLastResponse(null);
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

  function applyGuidedPrompt(prompt: (typeof guidedPrompts)[number]) {
    if (loading) return;
    setMessage(prompt);
    setError(null);
    messageInputRef.current?.focus();
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tutor/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          itemId: currentItemId,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al consultar al tutor");
      }

      setLastResponse(data.output);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="tutor-chip"
        data-testid="tutor-gcm-open-button"
        style={{ width: "100%", cursor: "pointer", textAlign: "left" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="avatar-chip" style={{ width: "32px", height: "32px", fontSize: "14px" }}>T</div>
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>Tutor GCM</p>
            <p className="body-sm" style={{ margin: 0 }}>¿Tienes dudas sobre esta pregunta?</p>
          </div>
        </div>
        <span className="status-pill premium">Preguntar</span>
      </button>
    );
  }

  return (
    <section
      className="surface-card"
      data-testid="tutor-gcm-panel"
      aria-label="Tutor GCM"
      style={{ padding: "20px", display: "grid", gap: "16px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="avatar-chip" style={{ width: "32px", height: "32px", fontSize: "14px" }}>T</div>
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>Tutor GCM</p>
            <h3 className="section-title" style={{ fontSize: "1rem", margin: 0 }}>Acompañamiento de esta pregunta</h3>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="subtle"
          style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
        >
          Minimizar
        </button>
      </div>

      <p className="body-sm" style={{ margin: 0 }}>
        Puedes pedir una pista, comparar opciones sin revelar la clave o solicitar explicación del feedback después de responder.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {guidedPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="subtle"
            onClick={() => applyGuidedPrompt(prompt)}
            disabled={loading}
            style={{ border: "1px solid var(--border-subtle)", borderRadius: "999px", padding: "6px 10px" }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {lastResponse ? (
        <div className="feedback-card" style={{ margin: 0, background: "var(--surface-secondary)" }}>
          <p className="body-sm" style={{ whiteSpace: "pre-wrap" }}>{lastResponse.visibleMessage}</p>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
            <span className="subtle" style={{ fontSize: "10px" }}>
              {lastResponse.degraded ? "Modo limitado" : "Tutoría orientativa"}
            </span>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="body-sm" style={{ color: "var(--error)", margin: 0 }}>{error}</p>
      ) : null}

      <form onSubmit={handleSendMessage} style={{ display: "grid", gap: "10px" }} data-testid="tutor-gcm-form">
        <div className="form-field">
          <label className="field-label" htmlFor="tutor-gcm-message">Pregunta al Tutor GCM</label>
          <textarea
            ref={messageInputRef}
            id="tutor-gcm-message"
            data-testid="tutor-gcm-message"
            className="text-area"
            style={{ minHeight: "80px", fontSize: "14px" }}
            placeholder="Ejemplo: Dame una pista sin decirme la respuesta correcta."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="primary-button"
          data-testid="tutor-gcm-submit"
          style={{ minHeight: "44px" }}
          disabled={loading || !message.trim()}
        >
          {loading ? "Pensando..." : "Consultar Tutor"}
        </button>
      </form>

      <p className="subtle" style={{ fontSize: "11px", textAlign: "center" }}>
        El tutor no tiene autoridad sobre tu puntaje, avance de sesión ni cierre de sesión.
      </p>
    </section>
  );
}
