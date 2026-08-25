"use client";

import { useEffect, useState } from "react";

interface TutorInterfaceProps {
  sessionId: string;
  currentItemId: string;
  answered?: boolean;
  fallbackMessage?: string;
}

interface TutorMessage {
  role: "assistant" | "user";
  text: string;
}

const INITIAL_TUTOR_MESSAGE =
  "Tutor AI GCM 🤖: Antes de responderte, te ayudaré a pensar. Pregúntame sobre el caso o sobre cómo analizar las alternativas; puedo explicarte por qué una alternativa es plausible o no plausible, sin revelarte la clave.";

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

export function TutorInterface({ sessionId, currentItemId, fallbackMessage }: TutorInterfaceProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<TutorMessage[]>([
    { role: "assistant", text: INITIAL_TUTOR_MESSAGE },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const draftStorageKey = `tutor-ai-gcm:draft:${sessionId}:${currentItemId}`;

  useEffect(() => {
    setMessages([{ role: "assistant", text: INITIAL_TUTOR_MESSAGE }]);
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

  async function handleSendMessage(event: React.FormEvent) {
    event.preventDefault();
    const nextMessage = message.trim();
    if (!nextMessage || loading) return;

    setLoading(true);
    setError(null);
    setMessages((current) => [...current, { role: "user", text: nextMessage }]);

    try {
      const response = await fetch("/api/tutor/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          itemId: currentItemId,
          message: nextMessage,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al consultar al Tutor AI GCM");
      }

      setMessages((current) => [...current, { role: "assistant", text: data.output.visibleMessage }]);
      setMessage("");
    } catch (err) {
      if (fallbackMessage) {
        setMessages((current) => [...current, { role: "assistant", text: fallbackMessage }]);
      } else {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="surface-card tutor-panel"
      data-testid="tutor-gcm-panel"
      aria-label="Tutor AI GCM"
    >
      <div className="tutor-head">
        <div className="tutor-head-main">
          <div className="avatar-chip avatar-mini">🤖</div>
          <div>
            <p className="eyebrow m-0">Tutor AI GCM 🤖</p>
            <h3 className="section-title tutor-headline">Ayuda pero no te revelamos la clave</h3>
          </div>
        </div>
      </div>

      <div className="tutor-chat" aria-live="polite">
        {messages.map((entry, index) => (
          <div
            key={`${entry.role}-${index}`}
            className={entry.role === "user" ? "user-message" : "tutor-message"}
          >
            {entry.text}
          </div>
        ))}
      </div>

      {error ? <p className="body-sm tutor-error-text">{error}</p> : null}

      <form onSubmit={handleSendMessage} className="tutor-input" data-testid="tutor-gcm-form">
        <label className="field-label" htmlFor="tutor-gcm-message">Escribe tu pregunta para el Tutor AI GCM 🤖</label>
        <textarea
          id="tutor-gcm-message"
          data-testid="tutor-gcm-message"
          className="text-area text-area-compact"
          placeholder="Escribe tu pregunta para el Tutor AI GCM 🤖"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="primary-button"
          data-testid="tutor-gcm-submit"
          disabled={loading || !message.trim()}
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </section>
  );
}
