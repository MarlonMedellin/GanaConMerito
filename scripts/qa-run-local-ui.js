const { execFileSync } = require("node:child_process");

const output = execFileSync("npx", ["supabase", "status", "-o", "env"], { encoding: "utf8" });
const env = { ...process.env };

for (const line of output.split(/\r?\n/)) {
  const index = line.indexOf("=");
  if (index <= 0) continue;

  const key = line.slice(0, index);
  const value = line.slice(index + 1).replace(/^"|"$/g, "");

  if (key === "API_URL") env.NEXT_PUBLIC_SUPABASE_URL = value;
  if (key === "ANON_KEY") env.NEXT_PUBLIC_SUPABASE_ANON_KEY = value;
  if (key === "SERVICE_ROLE_KEY") env.SUPABASE_SERVICE_ROLE_KEY = value;
}

env.QA_BASE_URL ||= "http://localhost:3100";
execFileSync("node", ["scripts/qa-ui-e2e-chromium.js"], { env, stdio: "inherit" });
