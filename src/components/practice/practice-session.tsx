"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { TutorInterface } from "@/components/tutor/tutor-interface";
import { formatAreaCompetency } from "@/lib/ui/format-label";
import type { PracticeQuestionViewModel } from "@/types/session";

type OptionKey = "A" | "B" | "C" | "D";

interface SessionStartResult {
  sessionId: string;
  currentState: string;
  currentItemId?: string;
}

interface AdvanceResult {
  currentState: string;
  feedbackText: string;
  hintLevel: number;
  nextItemId?: string;
  evaluation: {
    isCorrect: boolean;
    reasoningScore: number;
    competencyScore: number;
    qualitativeFeedback?: string;
  };
}

export function PracticeSession() {
  const [session, setSession] = useState<SessionStartResult | null>(null);
  const [item, setItem] = useState<PracticeQuestionViewModel | null>(null);
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [userRationale, setUserRationale] = useState("");
  const [feedback, setFeedback] = useState<AdvanceResult | null>(null);
  const [pendingNextItemId, setPendingNextItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  const sessionEnded = useMemo(() => {
    const currentState = feedback?.currentState ?? session?.currentState;
    return currentState === "session_close";
  }, [feedback?.currentState, session?.currentState]);

  const sessionDashboardHref = session ? `/dashboard?sessionId=${encodeURIComponent(session.sessionId)}` : null;
  const canStartAnother = sessionEnded || (!item && Boolean(sessionMessage));
  const hasFeedback = Boolean(feedback);

  function resetItemState() {
    setItem(null);
    setSelectedOption(null);
    setUserRationale("");
    setFeedback(null);
    setPendingNextItemId(null);
  }

  async function loadItem(sessionId: string, itemId: string) {
    const response = await fetch(
      `/api/session/item?sessionId=${encodeURIComponent(sessionId)}&itemId=${encodeURIComponent(itemId)}`,
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "No se pudo cargar el ítem.");
    }

    setItem(data);
    setSelectedOption(null);
    setUserRationale("");
    setFeedback(null);
    setPendingNextItemId(null);
  }

  async function handleStart() {
    setLoading(true);
    setError(null);
    setSessionMessage(null);
    resetItemState();

    try {
      const response = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "practice" }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "No se pudo iniciar la sesión.");
        return;
      }

      setSession(data);

      if (data.currentState === "onboarding") {
        setSessionMessage("Debes completar el onboarding antes de iniciar una práctica real.");
        return;
      }

      if (!data.currentItemId) {
        setSessionMessage("La sesión fue creada, pero no hay un ítem disponible todavía para continuar.");
        return;
      }

      await loadItem(data.sessionId, data.currentItemId);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el ítem inicial.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!session || !item || !selectedOption) return;

    setLoading(true);
    setError(null);
    setSessionMessage(null);

    try {
      const response = await fetch("/api/session/advance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.sessionId,
          itemId: item.id,
          selectedOption,
          userRationale: userRationale.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "No se pudo avanzar la sesión.");
        return;
      }

      setFeedback(data);

      if (data.currentState === "session_close") {
        setPendingNextItemId(null);
        setSessionMessage("La sesión terminó correctamente. Ya puedes revisar esta corrida en el dashboard de la sesión.");
        return;
      }

      if (data.nextItemId) {
        setPendingNextItemId(data.nextItemId);
      } else {
        setSessionMessage("No hay un siguiente ítem disponible en este momento.");
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo avanzar la sesión.");
    } finally {
      setLoading(false);
    }
  }

  async function handleContinue() {
    if (!session || !pendingNextItemId) return;

    setLoading(true);
    setError(null);

    try {
      await loadItem(session.sessionId, pendingNextItemId);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el siguiente ítem.");
    }

    setLoading(false);
  }

  function resetPractice() {
    setSession(null);
    resetItemState();
    setError(null);
    setSessionMessage(null);
    setLoading(false);
  }

  return (
    <section className="content-stack" style={{ paddingTop: 0 }}>
      {!session ? (
        <div className="hero-card">
          <p className="eyebrow">Sesión real</p>
          <h2 className="section-title">Pregunta, responde y recibe feedback trazable.</h2>
          <div className="page-actions" style={{ marginTop: 18 }}>
            {loading ? (
              <LoadingState message="Iniciando sesión..." />
            ) : (
              <button onClick={handleStart} className="primary-button">
                Iniciar práctica
              </button>
            )}
          </div>
        </div>
      ) : null}

      {error ? <ErrorState message={error} onRetry={!session ? handleStart : undefined} /> : null}
      {sessionMessage && !error ? (
        <EmptyState
          title={sessionMessage}
          description={canStartAnother ? "Puedes iniciar una nueva sesión cuando quieras." : undefined}
        />
      ) : null}

      {session ? (
        <div className="inline-cluster" style={{ justifyContent: "space-between" }}>
          <div className="inline-cluster">
            <span className="pill">Sesión {session.sessionId.slice(0, 8)}</span>
            <span className="pill">Estado: {feedback?.currentState ?? session.currentState}</span>
            {item ? <span className="pill">{formatAreaCompetency(item.area, item.competency)}</span> : null}
          </div>
          {sessionDashboardHref ? <Link href={sessionDashboardHref} className="subtle">Ver sesión →</Link> : null}
        </div>
      ) : null}

      {item ? (
        <article className="surface-card" style={{ padding: 24 }}>
          <div className="inline-cluster" style={{ justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <p className="eyebrow">Práctica</p>
              <h2 className="section-title" style={{ fontSize: "1.15rem" }}>{item.title}</h2>
            </div>
            <span className="status-pill premium">Foco activo</span>
          </div>

          <p className="section-title" style={{ fontSize: "1.45rem", lineHeight: 1.35, marginBottom: 22 }}>{item.stem}</p>

          <div className="option-list">
            {item.options.map((option) => {
              const isSelected = selectedOption === option.key;
              const className = [
                "option-card",
                isSelected ? "selected" : "",
                feedback?.evaluation.isCorrect && isSelected ? "correct" : "",
                feedback && !isSelected ? "dimmed" : "",
              ].filter(Boolean).join(" ");

              return (
                <button
                  key={option.key}
                  type="button"
                  className={className}
                  onClick={() => !hasFeedback && setSelectedOption(option.key)}
                  disabled={loading || hasFeedback}
                >
                  <span className="option-key">{option.key}</span>
                  <span>{option.text}</span>
                </button>
              );
            })}
          </div>

          <div className="form-field" style={{ marginTop: 22 }}>
            <label className="field-label" htmlFor="practice-rationale">Justificación opcional</label>
            <textarea
              id="practice-rationale"
              className="text-area"
              value={userRationale}
              onChange={(event) => setUserRationale(event.target.value)}
              placeholder="Explica brevemente por qué elegiste esa respuesta"
              rows={5}
              disabled={loading || hasFeedback}
            />
          </div>

          {feedback ? (
            <div className={`feedback-card ${feedback.evaluation.isCorrect ? "success" : "error"}`} style={{ marginTop: 22 }}>
              <div className="inline-cluster" style={{ justifyContent: "space-between" }}>
                <h3 style={{ margin: 0 }}>{feedback.evaluation.isCorrect ? "Respuesta correcta" : "Respuesta enviada"}</h3>
                <span className={`status-pill ${feedback.evaluation.isCorrect ? "success" : "warning"}`}>
                  Nivel de ayuda {feedback.hintLevel}
                </span>
              </div>
              <p className="body-sm" style={{ margin: 0 }}>{feedback.feedbackText}</p>
              <div className="metric-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", marginTop: 6 }}>
                <div className="metric-card" style={{ padding: 14 }}>
                  <span className="metric-label">Razonamiento</span>
                  <strong className="metric-value" style={{ fontSize: "1.35rem" }}>{feedback.evaluation.reasoningScore}</strong>
                </div>
                <div className="metric-card" style={{ padding: 14 }}>
                  <span className="metric-label">Competencia</span>
                  <strong className="metric-value" style={{ fontSize: "1.35rem" }}>{feedback.evaluation.competencyScore}</strong>
                </div>
              </div>
              {feedback.evaluation.qualitativeFeedback ? <p className="subtle" style={{ margin: 0 }}>{feedback.evaluation.qualitativeFeedback}</p> : null}
            </div>
          ) : null}

          <div style={{ marginTop: 24, marginBottom: 24 }}>
            <TutorInterface sessionId={session?.sessionId ?? ""} currentItemId={item.id} />
          </div>

          <div className="practice-sticky">
            {feedback && pendingNextItemId ? (
              <button onClick={handleContinue} className="primary-button" disabled={loading}>
                {loading ? "Cargando..." : "Siguiente pregunta"}
              </button>
            ) : !feedback ? (
              <button onClick={handleSubmitAnswer} className="primary-button" disabled={loading || !selectedOption}>
                {loading ? "Enviando..." : "Responder"}
              </button>
            ) : null}
          </div>
        </article>
      ) : null}

      {sessionEnded && sessionDashboardHref ? (
        <div className="page-actions">
          <Link href={sessionDashboardHref} className="secondary-button" style={{ flex: 1 }}>
            Ver dashboard de esta sesión
          </Link>
          <Link href="/home" className="subtle">Volver a inicio</Link>
        </div>
      ) : null}

      {session && !item ? (
        <div className="page-actions">
          <button onClick={resetPractice} className="primary-button" disabled={loading || !canStartAnother}>
            Iniciar una nueva sesión
          </button>
          <Link href="/dashboard" className="subtle">Ir al dashboard histórico</Link>
        </div>
      ) : null}
    </section>
  );
}
