import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const authenticatedToken = process.env.QA_AUTH_ACCESS_TOKEN;
const requireAuthenticated = process.argv.includes("--require-authenticated");

if (!url || !anonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

if (requireAuthenticated && !authenticatedToken) {
  throw new Error("QA_AUTH_ACCESS_TOKEN is required for the authenticated boundary check.");
}

type ClientRole = "anon" | "authenticated";

async function assertSensitiveReadsDenied(role: ClientRole, accessToken?: string) {
  const client = createClient(url!, anonKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
  });

  const checks = [
    { name: "item_bank answers", run: () => client.from("item_bank").select("correct_option, explanation").limit(1) },
    { name: "item_options direct", run: () => client.from("item_options").select("item_id, option_key, option_text").limit(1) },
    { name: "legacy active view", run: () => client.from("v_item_bank_active").select("correct_option, explanation").limit(1) },
    { name: "V4 active view", run: () => client.from("v_question_bank_v4_active").select("editorial_metadata").limit(1) },
  ];

  for (const check of checks) {
    const result = await check.run();
    if (!result.error) {
      throw new Error(`${role} can still read ${check.name}`);
    }
  }

  return checks.length;
}

const anonChecks = await assertSensitiveReadsDenied("anon");
let authenticatedChecks = 0;

if (authenticatedToken) {
  authenticatedChecks = await assertSensitiveReadsDenied("authenticated", authenticatedToken);
}

console.log(JSON.stringify({
  ok: true,
  anonChecks,
  authenticatedChecks,
  authenticatedVerified: Boolean(authenticatedToken),
}, null, 2));
