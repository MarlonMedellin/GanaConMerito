#!/usr/bin/env bash
set -euo pipefail

# Read-only validation for the isolated Canary artifact. It never creates,
# starts, restarts, or removes a Docker resource.
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
compose_file="$repo_root/ops/canary/docker-compose.canary.yml"
env_file="${1:-$repo_root/ops/canary/gcm-canary.env.example}"

test -f "$compose_file"
test -f "$env_file"

set -a
. "$env_file"
set +a
export CANARY_ENV_FILE="$env_file"

test "$APP_COMMIT" = "963d9b899a78c9aaeeb3a74238ce904136ee00ac"
test "$NEXT_PUBLIC_APP_COMMIT" = "$APP_COMMIT"
test "$NEXT_PUBLIC_SUPABASE_URL" = "https://dhiytzbwodfvdrnwhkcw.supabase.co"
test "$GCM_TEST_AUTH_BYPASS" = "0"
test "$GCM_TUTOR_LLM_SHADOW" = "0"

docker compose -f "$compose_file" config -q

if rg -n --fixed-strings \
  -e "/home/ubuntu/.openclaw/product" \
  -e "/opt/gcm/app" \
  -e "/opt/gcm/env/gcm-app.env" \
  -e "/var/run/docker.sock" \
  "$compose_file"; then
  echo "Legacy runtime reference found in Canary compose." >&2
  exit 1
fi

if rg -n "SUPABASE_SERVICE_ROLE_KEY.*(build|args)|args.*SUPABASE_SERVICE_ROLE_KEY" "$compose_file"; then
  echo "Service-role key must never be a build argument." >&2
  exit 1
fi

echo "PRE_CANARY_PREFLIGHT_PASS"
