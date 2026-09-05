"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { TutorInterface } from "@/components/tutor/tutor-interface";
import { formatTechnicalLabel } from "@/lib/ui/format-label";
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
  const [hintVisible, setHintVisible] = useState(false);
  const [tutorMobileOpen, setTutorMobileOpen] = useState(false);
  const [turnNumber, setTurnNumber] = useState(1);
  const [feedback, setFeedback] = useState<AdvanceResult | null>(null);
  const [pendingNextItemId, setPendingNextItemId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const [practiceMode, setPracticeMode] = useState<"guided" | "simulation" | "review">("guided");
  const [tutorProfile, setTutorProfile] = useState<"socratic" | "direct" | "brief">("socratic");
  const [assistanceUsed, setAssistanceUsed] = useState(false);

  const submissionRef = useRef<{id:string; option:OptionKey} | null>(null);
  const submittingRef = useRef(false);
  const feedbackHeaderRef = useRef<HTMLDivElement | null>(null);
  const mobileSheetRef = useRef<HTMLElement | null>(null);
  const sheetCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (feedback && feedbackHeaderRef.current) {
      feedbackHeaderRef.current.focus();
      feedbackHeaderRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [feedback]);

  useEffect(() => {
    if (!tutorMobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Tab") {
        const nodes = Array.from(mobileSheetRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]') ?? []).filter(el => el.getClientRects().length);
        const first = nodes[0], last = nodes[nodes.length-1];
        if (event.shiftKey && document.activeElement === first) {event.preventDefault();last?.focus();}
        else if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first?.focus();}
      }
      if (event.key === "Escape") {
        closeMobileSheet();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    sheetCloseButtonRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [tutorMobileOpen]);

  function openMobileSheet() {
    setTutorMobileOpen(true);
  }

  function closeMobileSheet() {
    setTutorMobileOpen(false);
    mobileTriggerRef.current?.focus();
  }

  const [currentAttempt, setCurrentAttempt] = useState<{ id: string; phase: string; mode: string } | null>(null);

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
    setHintVisible(false);
    setTutorMobileOpen(false);
    setFeedback(null);
    setPendingNextItemId(null);
    setAssistanceUsed(false);
    setCurrentAttempt(null);
    submissionRef.current = null;
  }

  async function loadItem(sessionId: string, itemId: string) {
    const response = await fetch(
      `/api/session/item?sessionId=${encodeURIComponent(sessionId)}&itemId=${encodeURIComponent(itemId)}&profile=${tutorProfile}`,
      { cache: "no-store" },
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "No se pudo cargar el ítem.");
    }

    setItem(data);
    submissionRef.current = null;
    if (data.attempt) {
      setCurrentAttempt(data.attempt);
      if (data.attempt.mode) {
        setPracticeMode(data.attempt.mode);
      }
    }
    setSelectedOption(null);
    setHintVisible(false);
    setFeedback(null);
    setPendingNextItemId(null);
    setAssistanceUsed(data.attempt?.assistanceUsed === true);
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
      setTurnNumber(1);
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

  async function handleReview() {
    setLoading(true);
    try {
      const response = await fetch("/api/session/review", {cache:"no-store"});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const itemResponse = await fetch(`/api/session/item?sessionId=${data.sessionId}&attemptId=${data.attemptId}`,{cache:"no-store"});
      const reviewed = await itemResponse.json();
      if (!itemResponse.ok) throw new Error(reviewed.error);
      setSession({sessionId:data.sessionId,currentState:"review",currentItemId:data.itemId});
      setItem(reviewed);setCurrentAttempt(reviewed.attempt);setPracticeMode("review");
      setFeedback(data.result);setSelectedOption(data.result.answerReview.selectedOption);
      setAssistanceUsed(reviewed.attempt.assistanceUsed);setPendingNextItemId(null);
    } catch (error) {setError(error instanceof Error ? error.message : "Review unavailable");}
    finally {setLoading(false);}
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
        body: JSON.stringify({ mode: practiceMode === "simulation" ? "exam" : practiceMode === "review" ? "review" : "practice" }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "No se pudo iniciar la sesión.");
        return;
      }

      setSession(data);
      setTurnNumber(1);

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
    if (!session || !item || !selectedOption || !currentAttempt || submittingRef.current) return;
    submittingRef.current = true;

    setLoading(true);
    setError(null);
    setSessionMessage(null);

    submissionRef.current ??= {id:crypto.randomUUID(),option:selectedOption};
    const clientRequestId = submissionRef.current.id;

    try {
      const response = await fetch("/api/session/advance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.sessionId,
          itemId: item.id,
          attemptId: currentAttempt?.id,
          selectedOption:submissionRef.current.option,
          clientRequestId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "No se pudo avanzar la sesión.");
        return;
      }

      if (data.attemptResult?.attemptId !== currentAttempt.id) return;
      setAssistanceUsed(data.attemptResult.assistanceUsed === true);
      setFeedback(data);

      if (data.currentState === "session_close") {
        setPendingNextItemId(null);
        setSessionMessage("La sesión terminó correctamente.");
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
      submittingRef.current = false;
      setLoading(false);
    }
  }

  async function handleContinue() {
    if (!session || !pendingNextItemId) return;

    setLoading(true);
    setError(null);

    try {
      await loadItem(session.sessionId, pendingNextItemId);
      setTurnNumber((current) => current + 1);
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
    <section className="practice-page">
      {!initializing ? (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
          <button type="button" className="ghost" onClick={handleReview} disabled={loading} style={{ fontSize: "14px", fontWeight: 700 }}>
            Revisar respuesta guardada
          </button>
        </div>
      ) : null}
      {initializing ? <LoadingState message="Recuperando sesión activa..." /> : null}

      {!initializing && !session && !error ? (
        <div className="card">
          <div className="session-heading">
            <p className="eyebrow">SESIÓN DE PRÁCTICA</p>
            <span className="session-count">lista para empezar</span>
          </div>
          <h1>Piensa como te van a evaluar.</h1>

          <div className="mode-selection" style={{ margin: "1rem 0" }}>
            <p className="small"><strong>Elige la modalidad de práctica:</strong></p>
            <div className="actions" style={{ marginTop: "0.5rem" }}>
              <button
                type="button"
                className={practiceMode === "guided" ? "primary" : "secondary"}
                onClick={() => setPracticeMode("guided")}
              >
                💡 Práctica Guiada (Tutor previo)
              </button>
              <button
                type="button"
                className={practiceMode === "simulation" ? "primary" : "secondary"}
                onClick={() => setPracticeMode("simulation")}
              >
                ⏱️ Simulación (Desempeño independiente)
              </button>
            </div>
          </div>

          <div className="actions">
            {loading ? (
              <LoadingState message="Iniciando sesión..." />
            ) : (
              <button onClick={handleStart} className="primary">
                Iniciar práctica en modo {practiceMode === "guided" ? "Guiado" : "Simulación"}
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

      {item ? (
        <section className="page">
          <div className="session-heading">
            <p className="eyebrow">SESIÓN</p>
            <span className="session-count">{turnNumber} de práctica</span>
          </div>
          <h1>Piensa como te van a evaluar.</h1>

          <div className="practice">
            <article className="card question-card">
              <div className="practice-meta">
                <span>Foco actual <strong>{formatTechnicalLabel(item.competency)}</strong></span>
                <span>Meta de sesión <strong>práctica activa</strong></span>
                <span>Dominio <strong>{formatTechnicalLabel(item.area)}</strong></span>
              </div>
              <h2 className="question-type">Tipo de Pregunta {item.questionType ? formatTechnicalLabel(item.questionType) : "no especificado"}</h2>
              {item.context ? <p className="practice-context">{item.context}</p> : null}
              <div className="stem">{item.stem}</div>

              <div role="radiogroup" aria-label="Opciones de respuesta" className="options-group">
                {item.options.map((option) => {
                  const isSelected = selectedOption === option.key;
                  const isCorrectOption = feedback?.answerReview.correctOption === option.key;
                  const isSelectedOption = feedback?.answerReview.selectedOption === option.key;
                  const className = [
                    "option",
                    isSelected ? "selected" : "",
                    feedback && isCorrectOption ? "correct" : "",
                    feedback && isSelectedOption && !feedback.evaluation.isCorrect ? "incorrect" : "",
                    feedback && !isSelected && !isCorrectOption ? "dimmed" : "",
                  ].filter(Boolean).join(" ");

                  return (
                    <button
                      key={option.key}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={isSelected || (!selectedOption && option.key === "A") ? 0 : -1}
                      onKeyDown={(event) => {
                        if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(event.key)) {
                          event.preventDefault();
                          const keys:OptionKey[] = ["A","B","C","D"];
                          const next = (keys.indexOf(option.key) + (["ArrowUp","ArrowLeft"].includes(event.key) ? 3 : 1)) % 4;
                          setSelectedOption(keys[next]);
                          (event.currentTarget.parentElement?.children[next] as HTMLElement)?.focus();
                        }
                        if (event.key === " " || event.key === "Spacebar") {
                          event.preventDefault();
                          setSelectedOption(option.key);
                        }
                      }}
                      className={className}
                      onClick={() => !hasFeedback && setSelectedOption(option.key)}
                      disabled={loading || hasFeedback}
                    >
                      <span className="key">{option.key}</span>
                      <span>{option.text}</span>
                    </button>
                  );
                })}
              </div>

              {hintVisible && !hasFeedback && practiceMode === "guided" ? (
                <div className="card hint small" role="status" aria-live="polite">
                  <strong>Pista</strong><br />
                  {item.hint ?? "Revisa qué decisión se sostiene mejor con la evidencia del caso."}
                </div>
              ) : null}

              {feedback ? (
                <div
                  className={`card feedback ${feedback.evaluation.isCorrect ? "success" : "error"}`}
                  role="region"
                  aria-live="assertive"
                  tabIndex={-1}
                  ref={feedbackHeaderRef}
                >
                  <p className="eyebrow">Feedback después de responder</p>
                  <h3>{feedback.evaluation.isCorrect ? "Bien razonado" : "Revisa el criterio central"}</h3>
                  <p>{feedback.feedbackText}</p>
                  <p className="small">
                    Tu respuesta: {feedback.answerReview.selectedOption} · Clave: {feedback.answerReview.correctOption}
                  </p>
                  {(() => {
                    const selectedExp = feedback.answerReview.selectedExplanation?.trim();
                    const correctExp = feedback.answerReview.correctExplanation?.trim();
                    const sameExp = Boolean(selectedExp && correctExp && selectedExp === correctExp);
                    if (sameExp) {
                      return <p className="small">Fundamento de la clave: {correctExp}</p>;
                    }
                    return (
                      <>
                        {selectedExp ? <p className="small">Sobre tu elección: {selectedExp}</p> : null}
                        {correctExp ? <p className="small">Fundamento de la clave: {correctExp}</p> : null}
                      </>
                    );
                  })()}
                  {feedback.answerReview.learningNote ? <p className="small"><strong>Regla de decisión:</strong> {feedback.answerReview.learningNote}</p> : null}
                </div>
              ) : null}

              <div className="actions practice-actions">
                {!hasFeedback ? (
                  <>

                    <button type="button" className="primary" onClick={handleSubmitAnswer} disabled={loading || !selectedOption}>
                      {loading ? "Enviando..." : "Responder"}
                    </button>
                  </>
                ) : pendingNextItemId ? (
                  <button type="button" className="primary" onClick={handleContinue} disabled={loading}>
                    {loading ? "Cargando..." : "Siguiente pregunta →"}
                  </button>
                ) : null}
              </div>
            </article>

            {practiceMode !== "simulation" || hasFeedback ? <aside
              className={`tutor-zone${tutorMobileOpen ? " open" : ""}`}
              role={tutorMobileOpen ? "dialog" : undefined}
              aria-modal={tutorMobileOpen ? true : undefined}
              aria-label={tutorMobileOpen ? "Panel Tutor GCM" : undefined}
              ref={mobileSheetRef}
            >
              {tutorMobileOpen ? (
                <button
                  type="button"
                  className="ghost mobile-sheet-close"
                  onClick={closeMobileSheet}
                  ref={sheetCloseButtonRef}
                >
                  Cerrar
                </button>
              ) : null}
              <TutorInterface
                key={currentAttempt?.id}
                attemptId={currentAttempt?.id}
                sessionId={session?.sessionId ?? ""}
                currentItemId={item.id}
                answered={hasFeedback}
                mode={practiceMode}
                profile={tutorProfile}
                onProfileChange={setTutorProfile}
                onTurnExecuted={setAssistanceUsed}
                fallbackMessage={feedback?.feedbackText}
              />
            </aside> : null}
          </div>

          <div className="mobile-practice-actions">
            <button
              type="button"
              className="secondary"
              onClick={openMobileSheet}
              disabled={practiceMode === "simulation" && !hasFeedback}
              ref={mobileTriggerRef}
            >
              🤖 Tutor AI
            </button>
            {!hasFeedback ? (
              <button type="button" className="primary" onClick={handleSubmitAnswer} disabled={loading || !selectedOption}>Responder</button>
            ) : pendingNextItemId ? (
              <button type="button" className="primary" onClick={handleContinue} disabled={loading}>Siguiente</button>
            ) : null}
          </div>
        </section>
      ) : null}

      {sessionEnded && sessionDashboardHref ? (
        <div className="actions">
          <Link href={sessionDashboardHref} className="secondary">
            Ver progreso
          </Link>
          <Link href="/home" className="subtle">Volver a inicio</Link>
        </div>
      ) : null}

      {session && !item ? (
        <div className="actions">
          <button onClick={resetPractice} className="primary" disabled={loading || !canStartAnother}>
            Iniciar una nueva sesión
          </button>
          <Link href="/dashboard" className="subtle">Ir a progreso</Link>
        </div>
      ) : null}
    </section>
  );
}
