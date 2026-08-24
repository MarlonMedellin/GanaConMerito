"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { TutorInterface } from "@/components/tutor/tutor-interface";
import type { PracticeQuestionViewModel } from "@/types/session";

type OptionKey = "A" | "B" | "C" | "D";

interface SessionStartResult {
  sessionId: string;
  currentState: string;
  currentItemId?: string;
  resumed?: boolean;
  inventory?: {
    status: "empty";
    reason: "no_active_v4_items";
    alternatives: string[];
  };
}

interface ResumeResult {
  session: SessionStartResult | null;
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
  answerReview: {
    selectedOption: OptionKey;
    correctOption: OptionKey;
    selectedExplanation?: string;
    correctExplanation?: string;
    learningNote?: string;
    sourceReference?: string;
  };
}

function getNoItemMessage(session: SessionStartResult) {
  if (session.currentState === "onboarding") {
    return "Debes completar el onboarding antes de iniciar una práctica real.";
  }

  const alternatives = session.inventory?.alternatives?.join(". ");
  return alternatives
    ? `No hay preguntas V4 activas para esta práctica. Alternativas: ${alternatives}.`
    : "La sesión está activa, pero no hay una pregunta V4 disponible todavía para continuar.";
}

export function PracticeSession() {
  const [session, setSession] = useState<SessionStartResult | null>(null);
  const [item, setItem] = useState<PracticeQuestionViewModel | null>(null);
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [userRationale, setUserRationale] = useState("");
  const [feedback, setFeedback] = useState<AdvanceResult | null>(null);
  const [pendingNextItemId, setPendingNextItemId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
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
      { cache: "no-store" },
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

  async function resumeActiveSession() {
    setInitializing(true);
    setError(null);
    setSessionMessage(null);

    try {
      const response = await fetch("/api/session/resume", { cache: "no-store" });
      const data = (await response.json()) as ResumeResult & { error?: string };

      if (!response.ok) {
        setError(data.error ?? "No se pudo recuperar la sesión activa.");
        return;
      }

      if (!data.session) {
        setSession(null);
        return;
      }

      setSession(data.session);
      if (data.session.currentItemId) {
        await loadItem(data.session.sessionId, data.session.currentItemId);
      } else {
        resetItemState();
        setSessionMessage(getNoItemMessage(data.session));
      }
    } catch (resumeError) {
      setError(resumeError instanceof Error ? resumeError.message : "No se pudo recuperar la sesión activa.");
    } finally {
      setInitializing(false);
    }
  }

  useEffect(() => {
    void resumeActiveSession();
  }, []);

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

      if (!data.currentItemId) {
        setSessionMessage(getNoItemMessage(data));
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
    <section className="content-stack">
      {initializing ? <LoadingState message="Recuperando sesión activa..." /> : null}

      {!initializing && !session && !error ? (
        <div className="hero-card">
          <p className="eyebrow">Sesión real</p>
          <h2 className="section-title">Pregunta, responde y recibe feedback trazable.</h2>
          <div className="page-actions mt-18">
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

      {error ? <ErrorState message={error} onRetry={!session && !initializing ? resumeActiveSession : undefined} /> : null}
      {sessionMessage && !error ? (
        <EmptyState
          title={sessionMessage}
          description={canStartAnother ? "Puedes iniciar una nueva sesión cuando quieras." : undefined}
        />
      ) : null}

      {session ? (
        <div className="inline-cluster cluster-between">
          <p className="subtle m-0">{session.resumed ? "Retomaste una práctica en curso." : "Práctica en curso."}</p>
        </div>
      ) : null}

      {item ? (
        <article className="surface-card practice-workspace">
          <div className="practice-panel-header practice-panel-header-strong mb-24">
            <div>
              <p className="eyebrow">Práctica</p>
              <h2 className="section-title panel-title-sm">Responde la pregunta</h2>
            </div>
          </div>

          {item.context ? <p className="body-sm practice-context">{item.context}</p> : null}
          <p className="practice-stem">{item.stem}</p>

          <div className="option-list option-list-strong">
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

          <div className="form-field mt-24">
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

          {feedback ? (
            <div className={`feedback-card ${feedback.evaluation.isCorrect ? "success" : "error"} mt-24`}>
              <div className="inline-cluster cluster-between">
                <h3 className="m-0">{feedback.evaluation.isCorrect ? "Respuesta correcta" : "Respuesta enviada"}</h3>
              </div>
              <p className="body-sm m-0">{feedback.feedbackText}</p>
              <p className="body-sm m-0">
                Tu respuesta: {feedback.answerReview.selectedOption} · Clave: {feedback.answerReview.correctOption}
              </p>
              {feedback.answerReview.selectedExplanation ? (
                <p className="subtle m-0">Sobre tu elección: {feedback.answerReview.selectedExplanation}</p>
              ) : null}
              {feedback.answerReview.correctExplanation ? (
                <p className="subtle m-0">Fundamento de la clave: {feedback.answerReview.correctExplanation}</p>
              ) : null}
              {feedback.answerReview.learningNote ? (
                <p className="subtle m-0">Para aprender: {feedback.answerReview.learningNote}</p>
              ) : null}
              {feedback.answerReview.sourceReference ? (
                <p className="subtle m-0">Fuente: {feedback.answerReview.sourceReference}</p>
              ) : null}
              {feedback.evaluation.qualitativeFeedback ? <p className="subtle m-0">{feedback.evaluation.qualitativeFeedback}</p> : null}
            </div>
          ) : null}

          <div className="mt-24 mb-24 tutor-zone">
            <TutorInterface
              sessionId={session?.sessionId ?? ""}
              currentItemId={item.id}
              fallbackMessage={feedback?.feedbackText}
            />
          </div>
        </article>
      ) : null}

      {sessionEnded && sessionDashboardHref ? (
        <div className="page-actions">
          <Link href={sessionDashboardHref} className="secondary-button button-grow">
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
