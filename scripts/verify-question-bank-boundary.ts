import { execFileSync } from "node:child_process";
import { createHmac, randomUUID } from "node:crypto";

type ProbeTarget = {
  url: string;
  publishableKey: string;
  authenticatedToken?: string;
  source: "environment" | "local-supabase";
};

type ClientRole = "anon" | "authenticated";

const requireAuthenticated = process.argv.includes("--require-authenticated");
const useLocal = process.argv.includes("--local");

function parseSupabaseEnv(output: string) {
  const values = new Map<string, string>();
  for (const rawLine of output.split(/\r?\n/)) {
    const line = rawLine.trim();
    const separator = line.indexOf("=");
    if (separator <= 0) continue;
    const key = line.slice(0, separator);
    let value = line.slice(separator + 1);
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    values.set(key, value);
  }
  return values;
}

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function createLocalAuthenticatedToken(secret: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(JSON.stringify({
    aud: "authenticated",
    exp: now + 300,
    iat: now,
    iss: "supabase",
    role: "authenticated",
    sub: randomUUID(),
  }));
  const signature = createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function resolveLocalTarget(): ProbeTarget {
  const output = execFileSync("npx", ["supabase", "status", "-o", "env"], {
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const values = parseSupabaseEnv(output);
  const url = values.get("API_URL");
  const publishableKey = values.get("PUBLISHABLE_KEY") ?? values.get("ANON_KEY");
  const jwtSecret = values.get("JWT_SECRET");
  if (!url || !publishableKey || !jwtSecret) {
    throw new Error("Local Supabase status did not expose API_URL, publishable key, and JWT_SECRET.");
  }
  return {
    url,
    publishableKey,
    authenticatedToken: createLocalAuthenticatedToken(jwtSecret),
    source: "local-supabase",
  };
}

function resolveTarget(): ProbeTarget {
  if (useLocal) return resolveLocalTarget();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const authenticatedToken = process.env.QA_AUTH_ACCESS_TOKEN;
  if (!url || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY; use --local for isolated Supabase.",
    );
  }
  if (requireAuthenticated && !authenticatedToken) {
    throw new Error("QA_AUTH_ACCESS_TOKEN is required for the authenticated boundary check.");
  }
  return { url, publishableKey, authenticatedToken, source: "environment" };
}

const sensitiveReads = [
  { object: "item_bank", columns: "correct_option,explanation" },
  { object: "item_options", columns: "item_id,option_key,option_text" },
  { object: "v_item_bank_active", columns: "correct_option,explanation" },
  { object: "v_question_bank_v3_pilot", columns: "correct_option,explanation" },
  { object: "v_question_bank_v4_active", columns: "id,content_id" },
  { object: "v_question_bank_v4_practice", columns: "id,content_id" },
  { object: "v_question_bank_v4_answered", columns: "correct_option,explanation" },
] as const;

async function assertSensitiveReadsDenied(
  target: ProbeTarget,
  role: ClientRole,
  accessToken: string,
) {
  for (const check of sensitiveReads) {
    const endpoint = new URL(`/rest/v1/${check.object}`, target.url);
    endpoint.searchParams.set("select", check.columns);
    endpoint.searchParams.set("limit", "1");
    const response = await fetch(endpoint, {
      method: "HEAD",
      headers: {
        apikey: target.publishableKey,
        Authorization: `Bearer ${accessToken}`,
        Prefer: "count=exact",
      },
    });
    if (response.status !== 401 && response.status !== 403) {
      throw new Error(
        `${role} boundary failed for ${check.object}: expected 401/403, received ${response.status}`,
      );
    }
  }
  return sensitiveReads.length;
}

async function main() {
  const target = resolveTarget();
  const anonChecks = await assertSensitiveReadsDenied(
    target,
    "anon",
    target.publishableKey,
  );
  let authenticatedChecks = 0;
  if (target.authenticatedToken) {
    authenticatedChecks = await assertSensitiveReadsDenied(
      target,
      "authenticated",
      target.authenticatedToken,
    );
  } else if (requireAuthenticated) {
    throw new Error("Authenticated boundary verification was required but no token was available.");
  }

  console.log(JSON.stringify({
    ok: true,
    target: target.source,
    bodyRead: false,
    anonChecks,
    authenticatedChecks,
    authenticatedVerified: authenticatedChecks > 0,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
