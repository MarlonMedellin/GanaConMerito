import { redirect } from "next/navigation";
import { isTestAuthBypassEnabled, getTestBypassEmail, getTestBypassProfileId, getTestBypassUser } from "@/lib/auth/test-bypass";
import { getSupabaseAdminClient } from "./admin";
import { getSupabaseServerClient } from "./server";

async function resolveTestBypassAuth() {
  const supabase = getSupabaseAdminClient();
  const configuredProfileId = getTestBypassProfileId();

  if (configuredProfileId) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, auth_user_id, is_admin")
      .eq("id", configuredProfileId)
      .single();

    if (profileError || !profile) {
      return { ok: false as const, error: "Test bypass profile not found" as const, status: 404 };
    }

    return { ok: true as const, supabase, user: getTestBypassUser(), profile };
  }

  const email = getTestBypassEmail();
  const users = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (users.error) {
    return { ok: false as const, error: "Could not list QA users" as const, status: 500 };
  }

  let user = users.data.users.find((candidate) => candidate.email === email);
  if (!user) {
    const created = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: "QA Bypass", qa_namespace: "gcm-test-bypass" },
    });
    if (created.error || !created.data.user) {
      return { ok: false as const, error: "Could not create QA bypass user" as const, status: 500 };
    }
    user = created.data.user;
  }

  const profileResult = await supabase
    .from("profiles")
    .upsert(
      {
        auth_user_id: user.id,
        full_name: user.user_metadata?.full_name ?? "QA Bypass",
        email,
        avatar_url: null,
      },
      { onConflict: "auth_user_id" },
    )
    .select("id, auth_user_id, is_admin")
    .single();

  if (profileResult.error || !profileResult.data) {
    return { ok: false as const, error: "Could not upsert QA bypass profile" as const, status: 500 };
  }

  const { data: targetProfile } = await supabase
    .from("target_profiles")
    .select("code")
    .eq("is_active", true)
    .order("name", { ascending: true })
    .limit(1)
    .maybeSingle();

  const learningPayload = {
    profile_id: profileResult.data.id,
    country_context: "colombia",
    preferred_feedback_style: "socratic",
    active_goal: "QA beta sin login",
    active_areas: ["matematicas", "pedagogia", "normatividad"],
    onboarding_completed: true,
    target_profile_code: targetProfile?.code ?? null,
  };

  const learningResult = await supabase
    .from("learning_profiles")
    .upsert(learningPayload, { onConflict: "profile_id" });

  if (learningResult.error) {
    return { ok: false as const, error: "Could not upsert QA bypass learning profile" as const, status: 500 };
  }

  return { ok: true as const, supabase, user, profile: profileResult.data };
}

export async function requireAuthenticatedUser(redirectTo = "/login") {
  if (isTestAuthBypassEnabled()) {
    const auth = await resolveTestBypassAuth();
    if (auth.ok) return { supabase: auth.supabase, user: auth.user };
    redirect(redirectTo);
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(redirectTo);
  }

  return { supabase, user };
}

export async function requireAuthenticatedProfile() {
  if (isTestAuthBypassEnabled()) {
    return resolveTestBypassAuth();
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, error: "Unauthorized" as const, status: 401 };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, auth_user_id, is_admin")
    .eq("auth_user_id", user.id)
    .single();

  if (profileError || !profile) {
    return { ok: false as const, error: "Profile not found" as const, status: 404 };
  }

  return { ok: true as const, supabase, user, profile };
}

export async function requireOwnedSession(params: { sessionId: string }) {
  const auth = await requireAuthenticatedProfile();

  if (!auth.ok) {
    return auth;
  }

  const { supabase, profile } = auth;
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, profile_id, mode, current_state, status, ended_at")
    .eq("id", params.sessionId)
    .eq("profile_id", profile.id)
    .single();

  if (sessionError || !session) {
    return { ok: false as const, error: "Session not found" as const, status: 404 };
  }

  return { ok: true as const, supabase, user: auth.user, profile, session };
}

export async function requireAdminProfile() {
  const auth = await requireAuthenticatedProfile();
  if (!auth.ok) return auth;
  if (!auth.profile.is_admin) {
    return { ok: false as const, error: "Forbidden" as const, status: 403 };
  }
  return auth;
}
