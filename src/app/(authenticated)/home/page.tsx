import Link from "next/link";
import {
  getDashboardSummaryForCurrentUser,
  getDashboardTopicBreakdownForCurrentUser,
} from "@/lib/dashboard/summary";
import {
  getPriorityFocus,
  getStrongestSignal,
} from "@/lib/dashboard/product-insights";
import { isLearningProfileOnboardingComplete } from "@/lib/onboarding/status";
import { requireAuthenticatedProfile } from "@/lib/supabase/guards";
import { formatTechnicalLabel } from "@/lib/ui/format-label";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const auth = await requireAuthenticatedProfile();
  if (!auth.ok) {
    return null;
  }

  const { supabase, profile } = auth;

  const { data: learningProfile } = profile
    ? await supabase
        .from("learning_profiles")
        .select("onboarding_completed, active_goal, target_profile_code")
        .eq("profile_id", profile.id)
        .single()
    : { data: null };

  const onboardingComplete = isLearningProfileOnboardingComplete(learningProfile);
  const primaryHref = onboardingComplete ? "/practice" : "/onboarding";
  const primaryLabel = onboardingComplete ? "Continuar mi preparación →" : "Completar configuración →";
  const [summary, breakdown] = await Promise.all([
    getDashboardSummaryForCurrentUser(),
    getDashboardTopicBreakdownForCurrentUser(),
  ]);
  const historical = summary.historical;
  const accuracy = historical.totalAttempts > 0
    ? Number(((historical.totalCorrect / historical.totalAttempts) * 100).toFixed(0))
    : null;
  const priorityFocus = getPriorityFocus(breakdown.historical);
  const strongestSignal = getStrongestSignal(breakdown.historical);

  return (
    <>
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">PREPARACIÓN INTELIGENTE PARA CONCURSOS DE MÉRITO CNSC</p>
          <h1 className="display-title">No practiques más.<br />Practica mejor.</h1>
          <p className="body-lg">
            GanaConMérito convierte cada respuesta en una señal para decidir qué reforzar después. Banco de preguntas verificadas con criterios técnicos, feedback explicativo y un Tutor AI GCM 🤖 que acompaña sin regalarte la respuesta.
          </p>
          <div className="page-actions mt-24">
            <Link href={primaryHref} className="primary-button primary-button-fit">
              {primaryLabel}
            </Link>
            {onboardingComplete ? (
              <Link href="/dashboard" className="secondary-button secondary-button-fit">
                Ver mi diagnóstico
              </Link>
            ) : null}
          </div>
        </div>

        <article className="hero-card hero-card-premium next-action-card">
          <p className="eyebrow">TU PRÓXIMA MEJOR ACCIÓN</p>
          {priorityFocus ? (
            <>
              <h2 className="section-title">Refuerza {formatTechnicalLabel(priorityFocus.row.competency)}</h2>
              <p className="body-sm mt-8">Prioridad basada en desempeño observado; no es una medición psicométrica calibrada.</p>
              <strong className="hero-metric">{priorityFocus.percent}%</strong>
              <span className="body-sm">{priorityFocus.row.attempts} intentos</span>
              <div className="progress-rail mt-20">
                <div className="progress-fill lime" style={{ width: `${Math.max(8, priorityFocus.percent)}%` }} />
              </div>
            </>
          ) : (
            <>
              <h2 className="section-title">Empieza tu diagnóstico</h2>
              <p className="body-sm mt-8">Aún no hay intentos suficientes para priorizar una competencia.</p>
              <Link href={primaryHref} className="primary-button primary-button-fit mt-20">Continuar práctica</Link>
            </>
          )}
        </article>
      </section>

      <section className="metric-grid metric-grid-3">
        <article className="metric-card">
          <span className="metric-label">PRÁCTICA ÚTIL</span>
          <strong className="metric-value">{historical.totalAttempts}</strong>
          <span className="subtle">reactivos respondidos</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">PRECISIÓN</span>
          <strong className="metric-value">{accuracy === null ? "No disponible aún" : `${accuracy}%`}</strong>
          <span className="subtle">correctas sobre intentos guardados</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">FORTALEZA</span>
          <strong className="metric-value">{strongestSignal ? `${strongestSignal.percent}%` : "No disponible aún"}</strong>
          <span className="subtle">{strongestSignal ? formatTechnicalLabel(strongestSignal.row.competency) : "sin evidencia suficiente"}</span>
        </article>
      </section>

      <section className="surface-card product-session-card">
        <div>
          <p className="eyebrow">SIGUIENTE SESIÓN</p>
          <h2 className="section-title">Continúa práctica con feedback del Tutor AI GCM 🤖</h2>
          <p className="body-sm">
            {priorityFocus
              ? `Foco observado: ${formatTechnicalLabel(priorityFocus.row.competency)}. La sesión todavía no consume explícitamente este foco como filtro adaptativo.`
              : "La práctica general sumará evidencia para orientar la siguiente acción."}
          </p>
        </div>
        <div className="page-actions">
          <Link href={primaryHref} className="primary-button primary-button-fit">
            Continuar práctica
          </Link>
        </div>
      </section>
    </>
  );
}
