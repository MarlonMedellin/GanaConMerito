"use client";

import { useState } from "react";
import { TutorOutput } from "@/types/tutor-turn";

interface TutorInterfaceProps {
  sessionId: string;
  currentItemId: string;
}

export function TutorInterface({ sessionId, currentItemId }: TutorInterfaceProps) {
  const guidedActions = [
    "Dame una pista",
    "Explícame esta pregunta",
    "Compara las opciones sin decir cuál es la correcta",
    "Analiza mi justificación",
    "Explícame el feedback",
    "Qué tema debo reforzar",
  ];
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [lastResponse, setLastResponse] = useState<TutorOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(nextMessage: string, options?: { clearMessage?: boolean }) {
    if (!nextMessage.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tutor/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          itemId: currentItemId,
          message: nextMessage.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al consultar al tutor");
      }

      setLastResponse(data.output);
      if (options?.clearMessage ?? true) {
        setMessage("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    await sendMessage(message);
  }

  async function handleGuidedAction(action: string) {
    await sendMessage(action, { clearMessage: false });
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
            <p className="body-sm" style={{ margin: 0 }}>¿Quieres orientación para resolver esta pregunta?</p>
          </div>
        </div>
        <span className="status-pill premium">Abrir tutor</span>
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
            <h3 className="section-title" style={{ fontSize: "1rem", margin: 0 }}>Guía paso a paso para esta pregunta</h3>
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
        Usa una acción guiada si necesitas apoyo puntual. También puedes escribir tu duda en texto libre; el tutor orienta sin revelar la clave antes de que respondas.
      </p>

      <div style={{ display: "grid", gap: "8px" }}>
        <p className="eyebrow" style={{ margin: 0 }}>
          Acciones guiadas recomendadas
        </p>
        <p className="subtle" style={{ fontSize: "11px", margin: 0 }}>
          Elige la acción que mejor describa tu necesidad actual para recibir una ayuda más precisa.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {guidedActions.map((action) => (
            <button
              key={action}
              type="button"
              className="subtle"
              style={{
                border: "1px solid var(--line)",
                borderRadius: "999px",
                padding: "6px 10px",
                background: "var(--surface)",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
              onClick={() => handleGuidedAction(action)}
            >
              {action}
            </button>
          ))}
        </div>
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
          <label className="field-label" htmlFor="tutor-gcm-message">Escribe tu consulta al Tutor GCM</label>
          <textarea
            id="tutor-gcm-message"
            data-testid="tutor-gcm-message"
            className="text-area"
            style={{ minHeight: "80px", fontSize: "14px" }}
            placeholder="Ejemplo: Estoy entre dos opciones. ¿Qué criterio puedo usar para compararlas sin ver la respuesta?"
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
          {loading ? "Pensando..." : "Pedir orientación"}
        </button>
      </form>

      <p className="subtle" style={{ fontSize: "11px", textAlign: "center" }}>
        El tutor no modifica tu puntaje ni el avance de tu sesión; solo te guía para razonar mejor.
      </p>
    </section>
  );
}
