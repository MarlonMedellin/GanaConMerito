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
  return answered ? [
    "¿Por qué mi opción no funciona?",
    "Explícame la respuesta correcta",
    "¿Qué debo aprender?",
    "Dame otra forma de entenderlo",
    "¿Qué debería practicar ahora?",
  ] : [
    "Dame una pista",
    "Ayúdame a entender qué me preguntan",
    "Ayúdame a comparar opciones",
    "¿Qué concepto debo recordar?",
  ];
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
      setFallbackVisible(false);
      if (options?.clearMessage ?? true) {
        setMessage("");
      }
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
        
      >
        <div className="tutor-head-main tutor-head-main-open">
          <div className="avatar-chip avatar-mini">T</div>
          <div>
            <p className="eyebrow m-0">Tutor GCM</p>
            <p className="body-sm m-0">
              {answered ? "Revisa el feedback con apoyo pedagógico." : "Pide orientación sin recibir la respuesta."}
            </p>
          </div>
        </div>
        <span className="status-pill premium">Abrir tutor</span>
      </button>
    );
  }

  return (
    <section
      className="surface-card tutor-panel"
      data-testid="tutor-gcm-panel"
      aria-label="Tutor GCM"
    >
      <div className="tutor-head">
        <div className="tutor-head-main">
          <div className="avatar-chip avatar-mini">T</div>
          <div>
            <p className="eyebrow m-0">Tutor GCM</p>
            <h3 className="section-title tutor-headline">
              {answered ? "Entiende el resultado" : "Guía para decidir mejor"}
            </h3>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="subtle tutor-minimize"
        >
          Minimizar
        </button>
      </div>

      <p className="body-sm m-0">
        {answered
          ? "Usa una acción guiada para entender el feedback. También puedes escribir tu duda en texto libre."
          : "Usa una acción guiada si necesitas apoyo puntual. También puedes escribir tu duda; el tutor orienta sin revelar la clave."}
      </p>

      <div className="tutor-guided-wrap">
        <p className="eyebrow m-0">
          Acciones guiadas recomendadas
        </p>
        <p className="subtle subtle-xxs m-0">
          Elige la acción que mejor describa tu necesidad actual para recibir una ayuda más precisa.
        </p>
        <div className="tutor-guided-list">
          {guidedActions.map((action) => (
            <button
              key={action}
              type="button"
              className="guided-chip"
              aria-busy={loading ? "true" : "false"}
              disabled={loading}
              onClick={() => handleGuidedAction(action)}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {lastResponse ? (
        <div className="feedback-card tutor-feedback-card">
          <p className="body-sm tutor-feedback-text">{lastResponse.visibleMessage}</p>
          <div className="tutor-response-meta">
            <span className="subtle subtle-xs">
              {lastResponse.degraded ? "Respuesta disponible" : "Tutoría orientativa"}
            </span>
          </div>
        </div>
      ) : null}

      {fallbackVisible && fallbackMessage ? (
        <div className="feedback-card tutor-feedback-card" data-testid="tutor-gcm-fallback">
          <p className="body-sm tutor-feedback-text">{fallbackMessage}</p>
          <div className="tutor-response-meta">
            <span className="subtle subtle-xs">Feedback editorial disponible; el Tutor está temporalmente limitado.</span>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="body-sm tutor-error-text">{error}</p>
      ) : null}

      <form onSubmit={handleSendMessage} className="form-grid-sm" data-testid="tutor-gcm-form">
        <div className="form-field">
          <label className="field-label" htmlFor="tutor-gcm-message">Escribe tu consulta al Tutor GCM</label>
          <textarea
            ref={messageInputRef}
            id="tutor-gcm-message"
            data-testid="tutor-gcm-message"
            className="text-area text-area-compact"
            placeholder={answered
              ? "Ejemplo: ¿Por qué mi opción no responde bien al enunciado?"
              : "Ejemplo: Estoy entre dos opciones. ¿Qué criterio puedo usar para compararlas sin ver la respuesta?"}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="primary-button"
          data-testid="tutor-gcm-submit"
          disabled={loading || !message.trim()}
        >
          {loading ? "Pensando..." : "Pedir orientación"}
        </button>
      </form>

      <p className="subtle subtle-xxs tutor-footnote">
        El tutor no modifica tu puntaje ni el avance de tu sesión; solo te guía para razonar mejor.
      </p>
    </section>
  );
}
