import Link from "next/link";
import {
  getDashboardSummaryForCurrentUser,
  getDashboardTopicBreakdownForCurrentUser,
} from "@/lib/dashboard/summary";
import { requireAuthenticatedUser } from "@/lib/supabase/guards";
import { formatAreaCompetency, formatTechnicalLabel } from "@/lib/ui/format-label";
import { TutorTraceSummaryCard } from "@/components/tutor/tutor-trace-summary-card";

interface DashboardPageProps {
  searchParams?: Promise<{
    sessionId?: string | string[];
  }>;
}

function getAccuracy(totalCorrect: number, totalAttempts: number) {
  return totalAttempts > 0 ? Number(((totalCorrect / totalAttempts) * 100).toFixed(1)) : 0;
}

function getTrendLabel(recentTrend: "up" | "stable" | "down") {
  if (recentTrend === "up") return "al alza";
  if (recentTrend === "down") return "a la baja";
  return "estable";
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  await requireAuthenticatedUser();

  const resolvedSearchParams = await searchParams;
  const rawSessionId = resolvedSearchParams?.sessionId;
  const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId;
  const isSessionView = Boolean(sessionId);

  const summary = await getDashboardSummaryForCurrentUser(sessionId);
  const breakdown = await getDashboardTopicBreakdownForCurrentUser(sessionId);

  const historicalAccuracy = getAccuracy(summary.historical.totalCorrect, summary.historical.totalAttempts);
  const currentAccuracy = summary.currentSession
    ? getAccuracy(summary.currentSession.totalCorrect, summary.currentSession.totalAttempts)
    : 0;

  const currentBlock = summary.currentSession;
  const activeRows = isSessionView ? breakdown.currentSession : breakdown.historical;
  const activeSummary = isSessionView && currentBlock ? currentBlock : summary.historical;
  const activeAccuracy = isSessionView ? currentAccuracy : historicalAccuracy;
  const activePercentile = activeSummary.canShowPercentile ? activeSummary.percentileSegment ?? "—" : "Lectura no concluyente";
  const strongestLabel = activeSummary.canShowStrongConclusion ? "Fortaleza principal" : "Fortaleza aún no concluyente";
  const weakestLabel = activeSummary.canShowStrongConclusion ? "Refuerzo principal" : "Refuerzo sugerido inicial";
  const levelLabel = activeSummary.signalLevel === "usable_signal" ? "Nivel estimado" : "Señal de nivel";
  const attemptsCopy =
    activeSummary.signalLevel === "usable_signal"
      ? "Ya hay una base razonable para decidir el siguiente frente de práctica."
      : "Muestra útil para observar, pero todavía corta para cerrar conclusiones fuertes.";
  const trendCopy = activeSummary.canShowTrend
    ? `Tendencia ${getTrendLabel(activeSummary.recentTrend)}.`
    : "Aún no hay dos puntos comparables para hablar de tendencia.";
  const contextCopy = isSessionView
    ? `Session ID: ${sessionId}. ${activeSummary.signalDescription}`
    : activeSummary.signalDescription;
  const activeRowsByCompetency = new Map(activeRows.map((row) => [row.competency, row]));
  const topStrong = activeSummary.strongestCompetencies
    .map((competency) => activeRowsByCompetency.get(competency))
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .slice(0, 2);
  const topWeak = activeSummary.weakestCompetencies
    .map((competency) => activeRowsByCompetency.get(competency))
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .slice(0, 2);

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Dashboard</p>
        <h1 className="display-title">Insights útiles antes que tablas.</h1>
        <p className="body-lg">
          Vista móvil pensada para entender tendencia, fortalezas y focos de refuerzo sin convertir el progreso en ruido.
        </p>
        <div className="inline-cluster">
          <span className={`segment-pill ${!isSessionView ? "active" : ""}`}>Histórico</span>
          <span className={`segment-pill ${isSessionView ? "active" : ""}`}>Sesión actual</span>
          {isSessionView ? <Link href="/dashboard" className="subtle">Ver acumulado →</Link> : null}
        </div>
      </section>

      <section className="metric-grid">
        <article className="metric-card">
          <span className="metric-label">Precisión {isSessionView ? "sesión" : "global"}</span>
          <strong className="metric-value">{activeAccuracy}%</strong>
          <span className={`metric-delta ${activeSummary.canShowTrend && activeSummary.recentTrend === "up" ? "success" : activeSummary.canShowTrend && activeSummary.recentTrend === "down" ? "warning" : ""}`}>
            {trendCopy}
          </span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Intentos</span>
          <strong className="metric-value">{activeSummary.totalAttempts}</strong>
          <span className="subtle">{attemptsCopy}</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Razonamiento promedio</span>
          <strong className="metric-value">{activeSummary.avgReasoningScore}</strong>
          <span className="subtle">Ayuda a leer calidad, no solo acierto bruto.</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">{levelLabel}</span>
          <strong className="metric-value">{activeSummary.estimatedLevel}</strong>
          <span className="subtle">{activeSummary.signalLevel === "usable_signal" ? "Lectura resumida del momento actual." : "Lectura preliminar del nivel observada hasta ahora."}</span>
        </article>
      </section>

      <section className="two-column-grid">
        <article className="surface-card" style={{ padding: 22 }}>
          <div className="inline-cluster" style={{ justifyContent: "space-between" }}>
            <div>
              <p className="eyebrow">Tendencia</p>
              <h2 className="section-title">{isSessionView ? "Sesión en contexto" : "Progreso histórico acumulado"}</h2>
            </div>
            <span className="status-pill premium">{activeSummary.signalLevel === "usable_signal" ? "High signal" : activeSummary.signalLabel}</span>
          </div>
          <p className="body-sm">
            {contextCopy}
          </p>
          <div style={{ marginTop: 16 }}>
            <div className="inline-cluster" style={{ justifyContent: "space-between" }}>
              <span className="metric-label">Precisión</span>
              <span className="subtle">{activeAccuracy}%</span>
            </div>
            <div className="progress-rail" style={{ marginTop: 10 }}>
              <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(8, activeAccuracy))}%` }} />
            </div>
          </div>
          <div className="tutor-chip" style={{ marginTop: 18 }}>
            <div>
              <p className="metric-label" style={{ margin: 0 }}>Tutor GCM</p>
              <p className="body-sm" style={{ margin: "8px 0 0" }}>
                {activeSummary.weakestCompetencies.length > 0
                  ? `Siguiente foco sugerido: ${activeSummary.weakestCompetencies[0]}. ${activeSummary.recommendedAction}`
                  : activeSummary.recommendedAction}
              </p>
            </div>
            <span className="status-pill premium">Contextual</span>
          </div>
        </article>

        <article className="surface-card" style={{ padding: 22 }}>
          <p className="eyebrow">Lectura ejecutiva</p>
          <div className="list-row">
            <span>Percentil</span>
            <strong>{activePercentile}</strong>
          </div>
          <div className="list-row">
            <span>{strongestLabel}</span>
            <strong>{activeSummary.strongestCompetencies[0] ?? "Sin conclusión todavía"}</strong>
          </div>
          <div className="list-row">
            <span>{weakestLabel}</span>
            <strong>{activeSummary.weakestCompetencies[0] ?? "Sin prioridad concluyente"}</strong>
          </div>
        </article>
      </section>

      <section className="two-column-grid">
        <article className="list-card">
          <div className="inline-cluster" style={{ justifyContent: "space-between" }}>
            <h2 className="section-title" style={{ fontSize: "1.2rem" }}>Áreas con mejor señal</h2>
            <span className="status-pill success">{activeSummary.canShowStrongConclusion ? "Fuerte" : "Inicial"}</span>
          </div>
          {topStrong.length > 0 ? topStrong.map((row) => (
            <div key={`${row.area}-${row.competency}`} className="list-row">
              <span>{formatAreaCompetency(row.area, row.competency)}</span>
              <strong>{getAccuracy(row.correct_count, row.attempts)}%</strong>
            </div>
          )) : <p className="subtle">Aún no hay evidencia suficiente para hablar de fortalezas consolidadas.</p>}
        </article>
        <article className="list-card">
          <div className="inline-cluster" style={{ justifyContent: "space-between" }}>
            <h2 className="section-title" style={{ fontSize: "1.2rem" }}>Focos de refuerzo</h2>
            <span className="status-pill warning">{activeSummary.canShowStrongConclusion ? "Atención" : "Prudente"}</span>
          </div>
          {topWeak.length > 0 ? topWeak.map((row) => (
            <div key={`${row.area}-${row.competency}`} className="list-row">
              <span>{formatAreaCompetency(row.area, row.competency)}</span>
              <strong>{getAccuracy(row.correct_count, row.attempts)}%</strong>
            </div>
          )) : <p className="subtle">Todavía no hay señal suficiente para priorizar un refuerzo claro.</p>}
        </article>
      </section>

      <TutorTraceSummaryCard />

      <section className="surface-card" style={{ padding: 22 }}>
        <div className="inline-cluster" style={{ justifyContent: "space-between" }}>
          <div>
            <p className="eyebrow">Desglose</p>
            <h2 className="section-title">Detalle por tema</h2>
          </div>
          <Link href="/practice" className="subtle">Ir a práctica →</Link>
        </div>
        {activeRows.length === 0 ? (
          <p className="subtle">Aún no hay datos suficientes.</p>
        ) : (
          <div style={{ marginTop: 10 }}>
            {activeRows.map((row) => (
              <div key={`${row.area}-${row.competency}`} className="list-row">
                <div>
                  <strong>{formatTechnicalLabel(row.area)}</strong>
                  <div className="subtle">{formatTechnicalLabel(row.competency)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong>{getAccuracy(row.correct_count, row.attempts)}%</strong>
                  <div className="subtle">{row.attempts} intentos</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
