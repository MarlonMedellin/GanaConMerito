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
  const primaryLabel = onboardingComplete ? "Continuar mi preparación →" : "Continuar mi preparación →";
  const [summary, breakdown] = await Promise.all([
    getDashboardSummaryForCurrentUser(),
    getDashboardTopicBreakdownForCurrentUser(),
  ]);
  const historical = summary.historical;
  const priorityFocus = getPriorityFocus(breakdown.historical);
  const strongestSignal = getStrongestSignal(breakdown.historical);

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">PREPARACIÓN INTELIGENTE PARA CONCURSOS DE MÉRITO CNSC</p>
          <h1>No practiques más.<br />Practica mejor.</h1>
          <p className="lead">
            GanaConMérito convierte cada respuesta en una señal para decidir qué reforzar después. Banco de preguntas verificadas con criterios técnicos, feedback explicativo y un Tutor AI 🤖 que acompaña sin regalarte la respuesta.
          </p>
          <div className="actions">
            <Link href={primaryHref} className="primary">
              {primaryLabel}
            </Link>
            <Link href="/dashboard" className="secondary">
              Ver mi progreso
            </Link>
          </div>
        </div>

        <article className="card hero-card">
          <p className="eyebrow">TU PRÓXIMA MEJOR ACCIÓN</p>
          <h2>
            {priorityFocus ? (
              <>Debo mejorar en <strong>{formatTechnicalLabel(priorityFocus.row.competency)}</strong></>
            ) : (
              "Empieza tu progreso"
            )}
          </h2>
          <p className="muted">
            {priorityFocus
              ? "Es el foco donde hoy puedes ganar más precisión."
              : "Responde algunas preguntas para identificar tu primer foco de preparación."}
          </p>
          {priorityFocus ? (
            <>
              <strong className="big">{priorityFocus.percent}%</strong>
              <span className="muted">precisión observada · {priorityFocus.row.attempts} intentos</span>
              <div className="progress mt-20">
                <span style={{ width: `${Math.max(8, priorityFocus.percent)}%`, background: "var(--lime)" }} />
              </div>
            </>
          ) : (
            <div className="actions">
              <Link href="/practice" className="primary">Continuar mi preparación</Link>
            </div>
          )}
        </article>
      </section>

      <section className="grid">
        <article className="card metric">
          <span className="eyebrow">PRÁCTICA ÚTIL</span>
          <strong>{historical.totalAttempts}</strong>
          <span className="muted">reactivos respondidos</span>
        </article>
        <article className="card metric">
          <span className="eyebrow">FORTALEZA</span>
          <strong>{strongestSignal ? `${strongestSignal.percent}%` : "No disponible aún"}</strong>
          <span className="muted">
            {strongestSignal ? formatTechnicalLabel(strongestSignal.row.competency) : "sin evidencia suficiente"}
          </span>
        </article>
        <article className="card opportunity">
          <span className="eyebrow">SIGUIENTE SESIÓN</span>
          <h3>Continúa tu preparación</h3>
          <p className="small">Practica para seguir identificando tus fortalezas y focos de mejora.</p>
          <Link href="/practice" className="primary compact-link">
            Continuar mi preparación →
          </Link>
        </article>
      </section>
    </>
  );
}
