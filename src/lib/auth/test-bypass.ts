import type { User } from "@supabase/supabase-js";

export function isTestAuthBypassEnabled() {
  return process.env.GCM_TEST_AUTH_BYPASS === "1";
}

export function getTestBypassProfileId() {
  return process.env.GCM_TEST_PROFILE_ID?.trim() || null;
}

export function getTestBypassUser(): User {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    aud: "authenticated",
    role: "authenticated",
    email: "qa-bypass@ganaconmerito.test",
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
