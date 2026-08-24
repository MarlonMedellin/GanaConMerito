import Link from "next/link";
import { getDashboardSummaryForCurrentUser } from "@/lib/dashboard/summary";
import { isLearningProfileOnboardingComplete } from "@/lib/onboarding/status";
import { requireAuthenticatedProfile } from "@/lib/supabase/guards";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const auth = await requireAuthenticatedProfile();
  if (!auth.ok) {
    return null;
  }

  const { supabase, user, profile } = auth;

  const { data: learningProfile } = profile
    ? await supabase
        .from("learning_profiles")
        .select("onboarding_completed, active_areas, active_goal")
        .eq("profile_id", profile.id)
        .single()
    : { data: null };

  const onboardingComplete = isLearningProfileOnboardingComplete(learningProfile);
  const primaryHref = onboardingComplete ? "/practice" : "/onboarding";
  const primaryLabel = onboardingComplete ? "Continuar práctica" : "Completar onboarding";
  const summary = await getDashboardSummaryForCurrentUser();
  const historical = summary.historical;
  const accuracy = historical.totalAttempts > 0
    ? Number(((historical.totalCorrect / historical.totalAttempts) * 100).toFixed(0))
    : 0;
  const progress = historical.totalAttempts > 0 ? Math.min(100, Math.max(8, accuracy)) : 18;
  const activeGoal = learningProfile?.active_goal?.trim() || "Configura tu meta activa para priorizar la práctica correcta.";
  const activeAreas = learningProfile?.active_areas?.length ? learningProfile.active_areas : [];

  return (
    <>
      <section className="page-header home-header">
        <p className="eyebrow">Panel de control</p>
        <h1 className="display-title">Bienvenido, {user.email?.split("@")[0]}</h1>
      </section>

      <section className="hero-card hero-card-premium">
        <div className="inline-cluster cluster-between cluster-start">
          <div className="hero-content">
            <p className="eyebrow">{onboardingComplete ? "Tu enfoque actual" : "Acción inmediata"}</p>
            <h2 className="section-title">
              {onboardingComplete 
                ? activeGoal 
                : "Completa tu configuración para empezar."}
            </h2>
            <p className="body-sm mt-8">
              {onboardingComplete
                ? `Practicando en: ${activeAreas.length > 0 ? activeAreas.join(", ") : "áreas por definir"}.`
                : "El sistema necesita saber tu perfil y metas para seleccionar las mejores preguntas para ti."}
            </p>
          </div>
          {!onboardingComplete && <span className="status-pill warning">Pendiente</span>}
        </div>
        
        <div className="page-actions mt-24">
          <Link href={primaryHref} className="primary-button button-grow">
            {primaryLabel} →
          </Link>
          {onboardingComplete && (
            <Link href="/dashboard" className="secondary-button button-grow">
              Revisar progreso
            </Link>
          )}
        </div>
      </section>

      <section className="metric-grid">
        <article className="metric-card">
          <span className="metric-label">Precisión</span>
          <strong className="metric-value">{accuracy}%</strong>
          <div className="progress-rail progress-compact">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </article>
        <article className="metric-card">
          <span className="metric-label">Intentos</span>
          <strong className="metric-value">{historical.totalAttempts}</strong>
        </article>
      </section>

      <section className="two-column-grid">
        <article className="surface-card panel-compact">
          <p className="eyebrow">Tu rendimiento</p>
          <h2 className="section-title panel-title-sm">{historical.estimatedLevel}</h2>
          <p className="subtle mt-4">Nivel estimado actual</p>
          
          <div className="tutor-chip mt-20">
            <p className="body-sm m-0">
              {onboardingComplete 
                ? "Listo para una nueva sesión de práctica." 
                : "Configura tu perfil para activar el Tutor GCM."}
            </p>
          </div>
        </article>

        <article className="surface-card panel-compact">
          <p className="eyebrow">Próximo paso</p>
          <h2 className="section-title panel-title-sm">{onboardingComplete ? "Sesión de práctica" : "Formulario inicial"}</h2>
          <Link href={primaryHref} className="subtle mt-12 inline-link">
            {primaryLabel} →
          </Link>
        </article>
      </section>
    </>
  );
}
