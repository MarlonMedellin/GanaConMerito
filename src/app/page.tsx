import { redirect } from "next/navigation";
import { getAuthenticatedLandingPath } from "@/lib/onboarding/routing";
import { isTestAuthBypassEnabled } from "@/lib/auth/test-bypass";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PublicLanding } from "@/components/public-landing/public-landing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GanaConMérito - Preparación para Concursos Docentes",
  description: "Practica con foco, comprende el razonamiento y decide qué reforzar después. Plataforma de apoyo al estudio para concursos docentes.",
};

export default async function RootPage() {
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

  return <PublicLanding />;
}
