import type { User } from "@supabase/supabase-js";

export function isTestAuthBypassEnabled() {
  if (process.env.NEXT_PHASE === "phase-production-build") return false;
  if (process.env.NODE_ENV === "production" || process.env.APP_ENV === "production") return false;
  return process.env.GCM_TEST_AUTH_BYPASS === "1";
}

export function getTestBypassProfileId() {
  const profileId = process.env.GCM_TEST_PROFILE_ID?.trim();
  if (!profileId || /^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(profileId)) return null;
  return profileId;
}

export function getTestBypassEmail() {
  return process.env.GCM_TEST_EMAIL?.trim() || "qa-bypass@ganaconmerito.test";
}

export function getTestBypassUser(): User {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    aud: "authenticated",
    role: "authenticated",
    email: getTestBypassEmail(),
    email_confirmed_at: new Date(0).toISOString(),
    phone: "",
    confirmed_at: new Date(0).toISOString(),
    last_sign_in_at: new Date(0).toISOString(),
    app_metadata: { provider: "test-bypass", providers: ["test-bypass"] },
    user_metadata: { full_name: "QA Bypass" },
    identities: [],
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
    is_anonymous: false,
  };
}
