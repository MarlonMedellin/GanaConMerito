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
  onTurnExecuted?: (assistanceUsed: boolean) => void;
  attemptId?: string;
  cancelSignal?: AbortSignal;
}

interface TutorMessage {
  role: "assistant" | "user";
  text: string;
}

const initialTutorMessage =
  "Tutor AI GCM🤖: Antes de responderte, te ayudaré a pensar. Pregúntame sobre el caso o sobre cómo analizar las alternativas; puedo explicarte por qué una alternativa es plausible o no plausible, sin revelarte la clave.";

const PROFILES = [
  { key: "socratic", initial: "S", label: "Socrático", desc: "Preguntas guiadas antes de revelar la clave." },
  { key: "direct", initial: "D", label: "Directo", desc: "Criterios claros y explicación estructurada." },
  { key: "brief", initial: "B", label: "Breve", desc: "Orientación en viñetas sintéticas." },
] as const;

export function getTutorGuidedActions(answered: boolean, mode: PracticeMode = "guided") {
  if (mode === "simulation" || answered) {
    return [];
  }
  return [
    "¿Cuál es mi rol y competencia aquí?",
    "¿Cuál es la tarea evaluativa real?",
    "¿Qué debo vigilar al comparar las opciones?",
  ];
}

function isInitialTutorGreeting(text: string) {
  return /Antes de responderte, te ayudar[eé] a pensar/i.test(text);
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
  attemptId,
  cancelSignal,
}: TutorInterfaceProps) {
  const [draft, setDraft] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<TutorProfile>(externalProfile);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [messages, setMessages] = useState<TutorMessage[]>([{ role: "assistant", text: initialTutorMessage }]);
  const [consumedChips, setConsumedChips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatRef = useRef<HTMLDivElement | null>(null);
  const activeFetchController = useRef<AbortController | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const lastAttemptRef = useRef<string | undefined>(attemptId);
  const lastItemRef = useRef<string>(currentItemId);
  const draftStorageKey = `tutor-ai:draft:${sessionId}:${currentItemId}`;

  useEffect(() => {
    return () => {
      activeFetchController.current?.abort();
    };
  }, [currentItemId, attemptId]);

  useEffect(() => {
    setSelectedProfile(externalProfile);
  }, [externalProfile]);

  useEffect(() => {
    if (lastAttemptRef.current !== attemptId || lastItemRef.current !== currentItemId) {
      lastAttemptRef.current = attemptId;
      lastItemRef.current = currentItemId;
      setConsumedChips([]);
    }
  }, [attemptId, currentItemId]);

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
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  function handleProfileSelect(newProfile: TutorProfile) {
    setSelectedProfile(newProfile);
    setIsDropdownOpen(false);
    if (onProfileChange) {
      onProfileChange(newProfile);
    }
  }

  async function sendTutorMessage(rawMessage: string): Promise<boolean> {
    const message = rawMessage.trim();
    if (!message || loading || !attemptId || activeFetchController.current) return false;
    const clientTurnId = crypto.randomUUID();

    if (mode === "simulation" && !answered) {
      setError("El Tutor antes de responder está deshabilitado en modo Simulación.");
      return false;
    }

    setLoading(true);
    setError(null);
    const history = buildClientTutorHistory(messages);
    setMessages((current: TutorMessage[]) => [...current, { role: "user", text: message }]);

    const controller = new AbortController();
    activeFetchController.current = controller;

    if (cancelSignal) {
      cancelSignal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    try {
      const response = await fetch("/api/tutor/turn", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          itemId: currentItemId,
          attemptId,
          clientTurnId,
          message,
          history,
          profile: selectedProfile,
        }),
      });
      const data = await response.json();

      if (controller.signal.aborted || activeFetchController.current !== controller) return false;
      if (!response.ok) {
        throw new Error(data.error || "Error al consultar al tutor");
      }

      if (data.attemptId !== attemptId || data.clientTurnId !== clientTurnId) return false;
      setMessages((current: TutorMessage[]) => [...current, { role: "assistant", text: data.output.visibleMessage }]);
      setDraft("");
      if (onTurnExecuted && !answered) {
        onTurnExecuted(data.assistanceUsed === true);
      }
      return true;
    } catch (err) {
      if (controller.signal.aborted || activeFetchController.current !== controller) return false;
      if (err instanceof DOMException && err.name === "AbortError") {
        return false;
      }
      const text = fallbackMessage || (err instanceof Error ? err.message : "Error desconocido");
      setMessages((current: TutorMessage[]) => [...current, { role: "assistant", text }]);
      setError(fallbackMessage ? null : text);
      return false;
    } finally {
      if (activeFetchController.current === controller) {
        activeFetchController.current = null;
        setLoading(false);
      }
    }
  }

  async function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendTutorMessage(draft);
  }

  async function handleChipClick(action: string) {
    if (loading || (mode === "simulation" && !answered)) return;
    setConsumedChips((current) => (current.includes(action) ? current : [...current, action]));
    const success = await sendTutorMessage(action);
    if (!success) {
      setConsumedChips((current) => current.filter((c) => c !== action));
    }
  }

  const allGuidedActions = getTutorGuidedActions(answered, mode);
  const activeChips = allGuidedActions.filter((chip) => !consumedChips.includes(chip));
  const conversationMessages = messages.filter((m) => !isInitialTutorGreeting(m.text));
  const currentProfile = PROFILES.find((p) => p.key === selectedProfile) ?? PROFILES[0];

  return (
    <section className="card tutor-panel" data-testid="tutor-gcm-panel" aria-label="Tutor GCM vNext">
      {/* 1. Cabecera compacta con identidad y estado del Tutor */}
      <div className="tutor-header">
        <div className="tutor-header-title-box">
          <span className="tutor-header-icon" aria-hidden="true">🤖</span>
          <div>
            <p className="eyebrow tutor-header-title" data-testid="tutor-header-title">
              TUTOR GCM
            </p>
            <span className="tutor-header-subtitle">
              {mode === "guided" ? "Práctica Guiada" : mode === "simulation" ? "Simulación" : "Revisión"}
            </span>
          </div>
        </div>
        <span className={`tutor-mode-badge mode-${mode}`}>
          {mode === "guided" ? "Práctica Guiada" : mode === "simulation" ? "Simulación" : "Revisión"}
        </span>
      </div>

      {/* 2. Selector compacto desplegable del estilo actual */}
      <div className="tutor-profile-selector" ref={dropdownRef}>
        <div
          role="radiogroup"
          aria-labelledby="tutor-profile-label"
          className="tutor-profile-dropdown-container"
          data-testid="tutor-profile-radiogroup"
        >
          <button
            type="button"
            id="tutor-profile-trigger"
            className="tutor-profile-trigger-card"
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            disabled={loading}
          >
            <div className="tutor-profile-trigger-left">
              <span className="tutor-profile-initial">{currentProfile.initial}</span>
              <div className="tutor-profile-trigger-text">
                <span id="tutor-profile-label" className="tutor-profile-label">PERFIL DEL TUTOR</span>
                <span className="tutor-profile-name-text">
                  {currentProfile.label} ({currentProfile.initial})
                </span>
              </div>
            </div>
            <span className="tutor-profile-cambiar-btn">
              {isDropdownOpen ? "Cerrar ▴" : "Cambiar ▾"}
            </span>
          </button>

          <div
            className={`tutor-profile-dropdown-menu ${isDropdownOpen ? "open" : ""}`}
            role="listbox"
            aria-label="Perfiles del Tutor"
          >
            {PROFILES.map((p) => {
              const isSelected = selectedProfile === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${p.initial} · ${p.label}: ${p.desc}`}
                  tabIndex={isSelected ? 0 : -1}
                  title={`${p.label}: ${p.desc}`}
                  data-testid={`tutor-profile-option-${p.key}`}
                  disabled={loading}
                  className={`tutor-profile-card ${isSelected ? "active" : ""}`}
                  onClick={() => handleProfileSelect(p.key)}
                  onKeyDown={(e) => {
                    if (["ArrowRight", "ArrowDown"].includes(e.key)) {
                      e.preventDefault();
                      const profiles: TutorProfile[] = ["socratic", "direct", "brief"];
                      const idx = profiles.indexOf(p.key);
                      const next = profiles[(idx + 1) % profiles.length];
                      handleProfileSelect(next);
                      (e.currentTarget.parentElement?.children[(idx + 1) % profiles.length] as HTMLElement)?.focus();
                    } else if (["ArrowLeft", "ArrowUp"].includes(e.key)) {
                      e.preventDefault();
                      const profiles: TutorProfile[] = ["socratic", "direct", "brief"];
                      const idx = profiles.indexOf(p.key);
                      const next = profiles[(idx + 2) % profiles.length];
                      handleProfileSelect(next);
                      (e.currentTarget.parentElement?.children[(idx + 2) % profiles.length] as HTMLElement)?.focus();
                    } else if (e.key === "Escape") {
                      setIsDropdownOpen(false);
                    }
                  }}
                >
                  <span className="tutor-profile-initial">{p.initial}</span>
                  <div className="tutor-profile-option-details">
                    <span className="tutor-profile-option-title">{p.label}</span>
                    <span className="tutor-profile-option-desc">{p.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <select
          id="tutor-profile-select"
          data-testid="tutor-profile-select"
          value={selectedProfile}
          onChange={(e) => handleProfileSelect(e.target.value as TutorProfile)}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)", border: 0 }}
        >
          <option value="socratic">Socrático (Preguntas guiadas)</option>
          <option value="direct">Directo (Criterios neutros)</option>
          <option value="brief">Breve (Viñetas sintéticas)</option>
        </select>
      </div>

      {/* 3. Descripción breve del estilo */}
      <div className="active-profile-banner" data-testid="tutor-active-profile-info">
        <strong data-testid="tutor-active-profile-name">
          {selectedProfile === "socratic"
            ? "S · Socrático"
            : selectedProfile === "direct"
            ? "D · Directo"
            : "B · Breve"}
        </strong>
        <span data-testid="tutor-active-profile-desc">
          {selectedProfile === "socratic"
            ? "Preguntas guiadas antes de revelar la clave."
            : selectedProfile === "direct"
            ? "Criterios claros y explicación estructurada."
            : "Orientación en viñetas sintéticas."}
        </span>
      </div>

      {/* 4. Mensaje inicial existente */}
      <div className="tutor-initial-card" aria-label="Mensaje de bienvenida del Tutor">
        <div className="tutor-initial-card-header">
          <span className="tutor-initial-sender">Tutor AI GCM 🤖</span>
          <span className="tutor-initial-time">Ahora</span>
        </div>
        <p className="tutor-initial-body">
          Antes de responderte, te ayudaré a pensar. Pregúntame sobre el caso o sobre cómo analizar las alternativas; puedo explicarte por qué una alternativa es plausible o no plausible, sin revelarte la clave.
        </p>
      </div>

      {mode === "simulation" && !answered ? (
        <div className="card hint small warning-banner" style={{ background: "rgba(255,193,7,0.1)", margin: "0.5rem 0" }}>
          <strong>Modo Simulación:</strong> El Tutor previo está deshabilitado para evaluar tu desempeño independiente. Se activará tras responder.
        </div>
      ) : null}

      {/* 5. Campo de consulta y botón de envío integrados */}
      <form className="tutor-input-form" onSubmit={handleSendMessage} data-testid="tutor-gcm-form">
        <div className="tutor-input-container">
          <input
            type="text"
            id="tutor-gcm-message"
            data-testid="tutor-gcm-message"
            placeholder={
              mode === "simulation" && !answered
                ? "Tutor deshabilitado en simulación previa..."
                : answered
                ? "¿Tienes una objeción o duda sobre la norma? Escribe aquí..."
                : "Consulta al Tutor GCM (sin revelar la clave)..."
            }
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={loading || (mode === "simulation" && !answered)}
            className="tutor-unified-input"
            autoComplete="off"
          />
          <button
            type="submit"
            className="tutor-integrated-submit-btn"
            data-testid="tutor-gcm-submit"
            aria-label="Enviar consulta"
            title="Enviar consulta"
            disabled={loading || !draft.trim() || (mode === "simulation" && !answered)}
          >
            {loading ? (
              <span className="tutor-btn-spinner" aria-hidden="true" />
            ) : (
              <span className="tutor-submit-arrow" aria-hidden="true">→</span>
            )}
          </button>
        </div>
      </form>

      {error ? <p className="small tutor-error-text" style={{ color: "#d9534f", margin: "6px 0" }}>{error}</p> : null}

      {/* 6. Chips de preguntas sugeridas disponibles */}
      {activeChips.length > 0 ? (
        <div className="tutor-guided-suggestions" aria-label="Sugerencias de razonamiento">
          <div className="tutor-suggestions-heading">
            <span className="tutor-suggestions-icon" aria-hidden="true">💡</span>
            <span>SUGERENCIAS DE RAZONAMIENTO</span>
          </div>
          <div className="tutor-suggestions-list" role="list">
            {activeChips.map((action) => (
              <button
                key={action}
                type="button"
                className="tutor-suggestion-chip"
                onClick={() => handleChipClick(action)}
                disabled={loading || (mode === "simulation" && !answered)}
                title={`Consultar: ${action}`}
              >
                <span className="tutor-chip-label">{action}</span>
                <span className="tutor-chip-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* 7. Conversación: consultas y respuestas creciendo debajo */}
      <div className="tutor-conversation-container" ref={chatRef} aria-live="polite">
        {conversationMessages.map((message: TutorMessage, index: number) => (
          <div
            key={`${message.role}-${index}`}
            className={`tutor-chat-row ${message.role === "assistant" ? "assistant" : "user"}`}
          >
            {message.role === "assistant" ? (
              <div className="tutor-assistant-card">
                <div className="tutor-card-head">
                  <span className="tutor-assistant-name">Tutor AI GCM 🤖</span>
                  <span className="tutor-assistant-time">Ahora</span>
                </div>
                <div className="tutor-assistant-text">{message.text}</div>
              </div>
            ) : (
              <div className="tutor-user-bubble">
                <div className="tutor-user-text">{message.text}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pie del panel con protección anticopia */}
      <div className="tutor-panel-footer">
        <span className="tutor-footer-label">Protección anticopia de clave activada</span>
        <span className="tutor-footer-badge">Tutor GCM vNext</span>
      </div>
    </section>
  );
}
