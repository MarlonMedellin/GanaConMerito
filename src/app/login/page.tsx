import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { ReleaseStamp } from "@/components/release/release-stamp";
import { isTestAuthBypassEnabled } from "@/lib/auth/test-bypass";
import { getAuthenticatedLandingPath } from "@/lib/onboarding/routing";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function LoginPage() {
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
        <h1 className="display-title">GanaConMérito</h1>
        <h2 className="section-title" style={{ marginTop: 14 }}>Preparación académica con foco, claridad y progreso trazable.</h2>
        <p className="body-lg" style={{ marginTop: 12 }}>
          Entra con Google para retomar práctica, revisar tu avance y trabajar sobre una superficie móvil más limpia y directa.
        </p>
        <div style={{ marginTop: 24 }}>
          <GoogleSignInButton />
        </div>
      </section>
      <ReleaseStamp />
    </main>
  );
}
