import Link from "next/link";
import { getDashboardSummaryForCurrentUser } from "@/lib/dashboard/summary";
import { isLearningProfileOnboardingComplete } from "@/lib/onboarding/status";
import { requireAuthenticatedProfile } from "@/lib/supabase/guards";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const auth = await requireAuthenticatedProfile();
  if (!auth.ok) return null;

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
  const primaryLabel = onboardingComplete ? "Continuar mi preparación" : "Completar configuración";
  const summary = await getDashboardSummaryForCurrentUser();
  const historical = summary.historical;
  const accuracy = historical.totalAttempts > 0
    ? Number(((historical.totalCorrect / historical.totalAttempts) * 100).toFixed(0))
    : 0;
  const progress = historical.totalAttempts > 0 ? Math.min(100, Math.max(8, accuracy)) : 18;
  const activeGoal = learningProfile?.active_goal?.trim() || "Práctica lista para empezar.";

  return (
    <>
      <section className="page-header home-header">
        <p className="eyebrow">Preparación inteligente para concursos de mérito CNSC</p>
        <h1 className="display-title">No practiques más.<br />Practica mejor.</h1>
        <p className="body-lg">
          GanaConMérito convierte cada respuesta en una señal para decidir qué reforzar después. Banco de preguntas verificadas con criterios técnicos, feedback explicativo y un Tutor AI 🤖 que acompaña sin regalarte la respuesta.
        </p>
      </section>

      <section className="hero-card hero-card-premium">
        <div className="inline-cluster cluster-between cluster-start">
          <div className="hero-content">
            <p className="eyebrow">{onboardingComplete ? "Tu próxima mejor acción" : "Acción inmediata"}</p>
            <h2 className="section-title">{onboardingComplete ? activeGoal : "Completa tu configuración inicial."}</h2>
            <p className="body-sm mt-8">
              {onboardingComplete
                ? "Entra a Práctica, responde preguntas y usa el Tutor AI 🤖 para razonar sin revelar la clave."
                : "Define un perfil y una meta breve para orientar la experiencia de práctica."}
            </p>
          </div>
          {!onboardingComplete && <span className="status-pill warning">Pendiente</span>}
        </div>
        <div className="page-actions mt-24">
          <Link href={primaryHref} className="primary-button button-grow">{primaryLabel} →</Link>
          {onboardingComplete && <Link href="/dashboard" className="secondary-button button-grow">Ver mi diagnóstico</Link>}
        </div>
      </section>

      <section className="metric-grid">
        <article className="metric-card">
          <span className="metric-label">Precisión observada</span>
          <strong className="metric-value">{accuracy}%</strong>
          <div className="progress-rail progress-compact"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        </article>
        <article className="metric-card">
          <span className="metric-label">Práctica útil</span>
          <strong className="metric-value">{historical.totalAttempts}</strong>
          <span className="subtle">reactivos respondidos</span>
        </article>
      </section>

      <section className="surface-card panel-compact">
        <p className="eyebrow">Tutor AI 🤖</p>
        <h2 className="section-title panel-title-sm">Ayuda, pero no te revelamos la clave.</h2>
        <p className="body-sm mt-8">Antes de responderte, el Tutor AI 🤖 debe hacerte pensar. Después puede explicarte por qué cada alternativa es plausible o no plausible.</p>
      </section>
    </>
  );
}
