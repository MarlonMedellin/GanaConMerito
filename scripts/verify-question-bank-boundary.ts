import { execFileSync } from "node:child_process";
import { createHmac, randomUUID } from "node:crypto";

const useLocal = process.argv.includes("--local");
const requireAuthenticated = process.argv.includes("--require-authenticated");

function parseEnv(output: string) {
  return new Map(output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const index = line.indexOf("=");
    return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, "")];
  }));
}

function token(secret: string) {
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({ aud: "authenticated", exp: now + 300, iat: now, iss: "supabase", role: "authenticated", sub: randomUUID() });
  const signature = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function target() {
  if (useLocal) {
    const env = parseEnv(execFileSync("npx", ["supabase", "status", "-o", "env"], { encoding: "utf8", shell: process.platform === "win32" }));
    const url = env.get("API_URL");
    const key = env.get("PUBLISHABLE_KEY") ?? env.get("ANON_KEY");
    const secret = env.get("JWT_SECRET");
    if (!url || !key || !secret) throw new Error("Local Supabase status is incomplete");
    return { url, key, authenticatedToken: token(secret), source: "local" };
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing public Supabase target");
  return { url, key, authenticatedToken: process.env.QA_AUTH_ACCESS_TOKEN, source: "environment" };
}

const checks = [
  ["questions", "correct_option,explanations"],
  ["question_options", "question_id,option_key,option_text"],
  ["v_question_bank_v4_active", "id,stem"],
  ["v_question_bank_v4_practice", "id,stem"],
  ["v_question_bank_v4_answered", "correct_option,explanations"],
  ["content_sync_runs", "plan_hash,status"],
] as const;

async function denied(url: string, key: string, accessToken: string) {
  for (const [object, columns] of checks) {
    const endpoint = new URL(`/rest/v1/${object}`, url);
    endpoint.searchParams.set("select", columns);
    endpoint.searchParams.set("limit", "1");
    const response = await fetch(endpoint, { method: "HEAD", headers: { apikey: key, Authorization: `Bearer ${accessToken}` } });
    if (![401, 403].includes(response.status)) throw new Error(`${object} returned ${response.status}`);
  }
}

async function main() {
  const resolved = target();
  await denied(resolved.url, resolved.key, resolved.key);
  if (resolved.authenticatedToken) await denied(resolved.url, resolved.key, resolved.authenticatedToken);
  else if (requireAuthenticated) throw new Error("Authenticated boundary token is required");
  console.log(JSON.stringify({ ok: true, target: resolved.source, bodyRead: false, checks: checks.length, authenticatedVerified: Boolean(resolved.authenticatedToken) }, null, 2));
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exit(1); });
