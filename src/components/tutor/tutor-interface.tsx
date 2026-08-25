"use client";

import { useEffect, useRef, useState } from "react";

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

const initialTutorMessage =
  "Tutor AI 🤖: Antes de responderte, te ayudaré a pensar. Pregúntame sobre el caso o sobre cómo analizar las alternativas; puedo explicarte por qué una alternativa es plausible o no plausible, sin revelarte la clave.";

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
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<TutorMessage[]>([{ role: "assistant", text: initialTutorMessage }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const draftStorageKey = `tutor-ai:draft:${sessionId}:${currentItemId}`;

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

  async function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || loading) return;

    setLoading(true);
    setError(null);
    setMessages((current) => [...current, { role: "user", text: message }]);

    try {
      const response = await fetch("/api/tutor/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, itemId: currentItemId, message }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al consultar al tutor");
      }

      setMessages((current) => [...current, { role: "assistant", text: data.output.visibleMessage }]);
      setDraft("");
    } catch (err) {
      const text = fallbackMessage || (err instanceof Error ? err.message : "Error desconocido");
      setMessages((current) => [...current, { role: "assistant", text }]);
      setError(fallbackMessage ? null : text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card tutor-panel" data-testid="tutor-gcm-panel" aria-label="Tutor AI">
      <p className="eyebrow">TUTOR AI 🤖</p>
      <h3>Ayuda pero no te revelamos la clave</h3>
      <div className="tutor-chat" ref={chatRef}>
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={message.role === "assistant" ? "tutor-message" : "user-message"}>
            {message.text}
          </div>
        ))}
      </div>
      <form className="tutor-input" onSubmit={handleSendMessage} data-testid="tutor-gcm-form">
        <textarea
          id="tutor-gcm-message"
          data-testid="tutor-gcm-message"
          placeholder="Escribe tu pregunta para el Tutor AI 🤖"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={loading}
        />
        <button type="submit" className="primary" data-testid="tutor-gcm-submit" disabled={loading || !draft.trim()}>
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>
      {error ? <p className="small tutor-error-text">{error}</p> : null}
    </section>
  );
}
