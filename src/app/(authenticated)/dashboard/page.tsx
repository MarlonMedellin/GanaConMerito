import Link from "next/link";
import {
  getDashboardSummaryForCurrentUser,
  getDashboardTopicBreakdownForCurrentUser,
} from "@/lib/dashboard/summary";
import { requireAuthenticatedUser } from "@/lib/supabase/guards";
import { formatAreaCompetency, formatTechnicalLabel } from "@/lib/ui/format-label";

interface DashboardPageProps {
  searchParams?: Promise<{
    sessionId?: string | string[];
  }>;
}

function getAccuracy(totalCorrect: number, totalAttempts: number) {
  return totalAttempts > 0 ? Number(((totalCorrect / totalAttempts) * 100).toFixed(1)) : 0;
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
  const hasStrongestConclusion = activeSummary.strongestCompetencies.length > 0;
  const hasWeakestConclusion = activeSummary.weakestCompetencies.length > 0;
  const strongestLabel = hasStrongestConclusion ? "Fortaleza principal" : "Fortaleza aún no concluyente";
  const weakestLabel = hasWeakestConclusion ? "Refuerzo principal" : "Refuerzo sugerido inicial";
  const attemptsCopy = "Cuenta de práctica registrada para esta vista.";
  const trendCopy = "Aún no hay una serie temporal suficiente para mostrar tendencia.";
  const contextCopy = isSessionView
    ? "Vista de la sesión seleccionada."
    : "Vista acumulada de tu actividad registrada.";
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
      <section className="page-header metrics-header">
        <p className="eyebrow">Métricas</p>
        <h1 className="display-title">Actividad y señales útiles para orientar la práctica.</h1>
        <p className="body-lg">
          Esta vista prioriza intentos y precisión observada. Las conclusiones fuertes requieren más evidencia.
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
          <span className="metric-delta">{trendCopy}</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Intentos</span>
          <strong className="metric-value">{activeSummary.totalAttempts}</strong>
          <span className="subtle">{attemptsCopy}</span>
        </article>
      </section>

      <section className="two-column-grid">
        <article className="surface-card panel-compact">
          <div className="inline-cluster cluster-between">
            <div>
              <p className="eyebrow">Lectura de actividad</p>
              <h2 className="section-title">{isSessionView ? "Sesión en contexto" : "Actividad histórica acumulada"}</h2>
            </div>
          </div>
          <p className="body-sm">{contextCopy}</p>
          <p className="subtle">{trendCopy}</p>
          <div className="mt-16">
            <div className="inline-cluster cluster-between">
              <span className="metric-label">Precisión</span>
              <span className="subtle">{activeAccuracy}%</span>
            </div>
            <div className="progress-rail mt-10">
              <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(8, activeAccuracy))}%` }} />
            </div>
          </div>
          <div className="tutor-chip mt-18">
            <div>
              <p className="metric-label m-0">Tutor GCM</p>
              <p className="body-sm mt-8 m-0">
                {activeSummary.weakestCompetencies.length > 0
                  ? `Siguiente foco sugerido: ${formatTechnicalLabel(activeSummary.weakestCompetencies[0])}. ${activeSummary.recommendedAction}`
                  : activeSummary.recommendedAction}
              </p>
            </div>
            <span className="status-pill premium">Contextual</span>
          </div>
        </article>

        <article className="surface-card panel-compact">
          <p className="eyebrow">Lectura ejecutiva</p>
          {activeSummary.canShowPercentile ? (
            <div className="list-row">
              <span>Percentil</span>
              <strong>{activeSummary.percentileSegment ?? "—"}</strong>
            </div>
          ) : null}
          <div className="list-row">
            <span>{strongestLabel}</span>
            <strong>{activeSummary.strongestCompetencies[0] ? formatTechnicalLabel(activeSummary.strongestCompetencies[0]) : "Sin conclusión todavía"}</strong>
          </div>
          <div className="list-row">
            <span>{weakestLabel}</span>
            <strong>{activeSummary.weakestCompetencies[0] ? formatTechnicalLabel(activeSummary.weakestCompetencies[0]) : "Sin prioridad concluyente"}</strong>
          </div>
        </article>
      </section>

      <section className="two-column-grid">
        <article className="list-card">
          <div className="inline-cluster cluster-between">
            <h2 className="section-title panel-title-md">Áreas con mejores resultados observados</h2>
          </div>
          {topStrong.length > 0 ? topStrong.map((row) => (
            <div key={`${row.area}-${row.competency}`} className="list-row">
              <span>{formatAreaCompetency(row.area, row.competency)}</span>
              <strong>{getAccuracy(row.correct_count, row.attempts)}%</strong>
            </div>
          )) : <p className="subtle">Aún no hay evidencia suficiente para hablar de fortalezas consolidadas.</p>}
        </article>
        <article className="list-card">
          <div className="inline-cluster cluster-between">
            <h2 className="section-title panel-title-md">Focos de refuerzo</h2>
          </div>
          {topWeak.length > 0 ? topWeak.map((row) => (
            <div key={`${row.area}-${row.competency}`} className="list-row">
              <span>{formatAreaCompetency(row.area, row.competency)}</span>
              <strong>{getAccuracy(row.correct_count, row.attempts)}%</strong>
            </div>
          )) : <p className="subtle">Todavía no hay señal suficiente para priorizar un refuerzo claro.</p>}
        </article>
      </section>
      <section className="surface-card panel-compact">
        <div className="inline-cluster cluster-between">
          <div>
            <p className="eyebrow">Desglose</p>
            <h2 className="section-title">Detalle por área y competencia</h2>
          </div>
          <Link href="/practice" className="subtle">Ir a práctica →</Link>
        </div>
        {activeRows.length === 0 ? (
          <p className="subtle">Aún no hay datos suficientes.</p>
        ) : (
          <div className="mt-10">
            {activeRows.map((row) => (
              <div key={`${row.area}-${row.competency}`} className="list-row">
                <div>
                  <strong>{formatTechnicalLabel(row.area)}</strong>
                  <div className="subtle">{formatTechnicalLabel(row.competency)}</div>
                </div>
                <div className="text-right">
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
