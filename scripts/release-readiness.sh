#!/usr/bin/env bash
set -euo pipefail

REQUIRED_ENV_VARS=(
  NEXT_PUBLIC_APP_COMMIT
  NEXT_PUBLIC_APP_BUILD_TIME
)

echo "[release-readiness] Starting release readiness checks"

if [[ ! -f package-lock.json ]]; then
  echo "[release-readiness] ERROR: package-lock.json missing"
  exit 1
fi

echo "[release-readiness] package-lock.json present"

for var in "${REQUIRED_ENV_VARS[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "[release-readiness] WARN: ${var} is not set in runtime env"
  else
    echo "[release-readiness] OK: ${var} is set"
  fi
done

echo "[release-readiness] Checking Dockerfile build arg enforcement"
if ! rg -q 'APP_COMMIT build arg is required' Dockerfile; then
  echo "[release-readiness] ERROR: APP_COMMIT enforcement missing in Dockerfile"
  exit 1
fi
if ! rg -q 'APP_BUILD_TIME build arg is required' Dockerfile; then
  echo "[release-readiness] ERROR: APP_BUILD_TIME enforcement missing in Dockerfile"
  exit 1
fi

echo "[release-readiness] Dockerfile arg enforcement validated"
echo "[release-readiness] Completed"
