import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { isTestAuthBypassEnabled } from "@/lib/auth/test-bypass";
import { getBuildInfo } from "@/lib/build-info";
import { getAuthenticatedLandingPath } from "@/lib/onboarding/routing";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const { commit, buildTime } = getBuildInfo();

  if (isTestAuthBypassEnabled()) {
    redirect("/home");
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(await getAuthenticatedLandingPath(supabase, user.id));
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="brand-mark" aria-hidden="true">
          <div className="brand-dot" />
        </div>
        <p className="eyebrow">Acceso seguro</p>
        <h1 className="display-title">GanaConMerito</h1>
        <h2 className="section-title" style={{ marginTop: 14 }}>Preparación académica con foco, claridad y progreso trazable.</h2>
        <p className="body-lg" style={{ marginTop: 12 }}>
          Entra con Google para retomar práctica, revisar tu avance y trabajar sobre una superficie móvil más limpia y directa.
        </p>
        <div style={{ marginTop: 24 }}>
          <GoogleSignInButton />
        </div>
        <div className="trust-note">
          <p className="subtle" style={{ margin: 0 }}>
            Entorno académico autenticado. El acceso conserva build y commit visibles para mantener trazabilidad operativa.
          </p>
          <p className="subtle" style={{ marginBottom: 0, marginTop: 10 }}>
            Commit desplegado: <code>{commit}</code> · Build time: <code>{buildTime}</code>
          </p>
        </div>
      </section>
    </main>
  );
}
