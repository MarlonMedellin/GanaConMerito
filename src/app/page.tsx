import { redirect } from "next/navigation";
import { getAuthenticatedLandingPath } from "@/lib/onboarding/routing";
import { isTestAuthBypassEnabled } from "@/lib/auth/test-bypass";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function RootPage() {
  if (isTestAuthBypassEnabled()) {
    redirect("/home");
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  redirect(await getAuthenticatedLandingPath(supabase, user.id));
}
