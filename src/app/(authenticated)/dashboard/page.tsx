import Link from "next/link";
import {
  getDashboardSummaryForCurrentUser,
  getDashboardTopicBreakdownForCurrentUser,
} from "@/lib/dashboard/summary";
import {
  getPreparationMapRows,
  getPriorityFocus,
  getReadinessLabel,
  getStrongestSignal,
} from "@/lib/dashboard/product-insights";
import { requireAuthenticatedUser } from "@/lib/supabase/guards";
import { formatTechnicalLabel } from "@/lib/ui/format-label";

function getAccuracy(totalCorrect: number, totalAttempts: number) {
  return totalAttempts > 0 ? Number(((totalCorrect / totalAttempts) * 100).toFixed(1)) : 0;
}

export default async function DashboardPage() {
  await requireAuthenticatedUser();

  const [summary, breakdown] = await Promise.all([
    getDashboardSummaryForCurrentUser(),
    getDashboardTopicBreakdownForCurrentUser(),
  ]);
  const historicalAccuracy = getAccuracy(summary.historical.totalCorrect, summary.historical.totalAttempts);
  const rows = breakdown.historical;
  const strongestSignal = getStrongestSignal(rows);
  const priorityFocus = getPriorityFocus(rows);
  const mapRows = getPreparationMapRows(rows);

  return (
    <>
      <section className="page">
        <p className="eyebrow">DIAGNÓSTICO ACCIONABLE</p>
        <h1>Tu progreso debe decirte qué hacer después.</h1>
        <p className="lead">
          No basta con mostrar precisión. La información del banco de preguntas te permite convertir el desempeño en una ruta de preparación.
        </p>
      </section>

      <section className="grid">
        <article className="card metric">
          <span className="eyebrow">PRECISIÓN GLOBAL</span>
          <strong>{historicalAccuracy}%</strong>
          <span className="muted">{summary.historical.totalAttempts} intentos</span>
        </article>
        <article className="card metric">
          <span className="eyebrow">MEJOR SEÑAL</span>
          <strong>{strongestSignal ? `${strongestSignal.percent}%` : "No disponible aún"}</strong>
          <span className="muted">{strongestSignal ? formatTechnicalLabel(strongestSignal.row.competency) : "sin evidencia suficiente"}</span>
        </article>
        <article className="card metric">
          <span className="eyebrow">FOCO PRIORITARIO</span>
          <strong>{priorityFocus ? `${priorityFocus.percent}%` : "Completa más práctica"}</strong>
          <span className="muted">{priorityFocus ? formatTechnicalLabel(priorityFocus.row.competency) : "sin evidencia suficiente"}</span>
        </article>
      </section>

      <section className="hero progress-lower">
        <article className="card">
          <p className="eyebrow">MAPA DE PREPARACIÓN</p>
          <div className="list">
            {mapRows.length > 0 ? mapRows.map((insight) => (
              <div className="row" key={`${insight.row.area}-${insight.row.competency}`}>
                <span>{formatTechnicalLabel(insight.row.competency)}</span>
                <strong>{insight.percent}% · {getReadinessLabel(insight.accuracy)}</strong>
              </div>
            )) : (
              <div className="row">
                <span>Completa más práctica</span>
                <strong>sin datos</strong>
              </div>
            )}
          </div>
        </article>
        <article className="card opportunity">
          <p className="eyebrow">RECOMENDACIÓN</p>
          <h2>Haz ahora una micro-sesión de práctica</h2>
          <p>
            Prioriza <strong>{priorityFocus ? formatTechnicalLabel(priorityFocus.row.competency) : "tu siguiente foco"}</strong> con feedback del Tutor AI 🤖.
          </p>
          <Link href="/practice" className="primary compact-link">Entrenar este foco →</Link>
        </article>
      </section>
    </>
  );
}
