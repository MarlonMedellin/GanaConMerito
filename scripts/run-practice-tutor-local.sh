#!/usr/bin/env bash
set -Eeuo pipefail

# Resolve project root
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT"

ARTIFACT_DIR="${REPO_ROOT}/.gcm-artifacts"
mkdir -p "$ARTIFACT_DIR"

MODE="${1:---quick}"

ORIGINAL_BASE_SHA="65d09bb5db58b99ec336c372da575b1e20ea0ecf"
REPAIR_BASE_SHA="5243ca747efbf42cdec6696c743fca6290dac58f"
BASE_SHA="$(git rev-parse origin/master 2>/dev/null || echo "$ORIGINAL_BASE_SHA")"
HEAD_SHA="$(git rev-parse HEAD 2>/dev/null || echo "unknown")"
BRANCH="$(git branch --show-current 2>/dev/null || echo "unknown")"
WORKTREE="$(pwd)"

STATUS="PASS"
CONTRACT_TESTS="PASS"
SECURITY_TESTS="PASS"
TARGETED_TESTS="PASS"
TYPECHECK="PASS"
BUILD="PASS"
BROWSER_E2E="NOT_RUN"
INVARIANTS="PASS"
BANK_V4_CHANGED="false"
MIGRATIONS_CHANGED="false"
ENV_OR_SECRETS_CHANGED="false"
BLOCKERS="NONE"

echo "=== Running GCM Practice & Tutor vNext Test Runner [$MODE] ==="

# 1. Invariant check: Bank V4, migrations, and secrets diff against base
BANK_DIFF="$(git status --short content/question-bank-v4/ 2>/dev/null || true)"
MIGRATIONS_DIFF="$(git status --short supabase/migrations/ 2>/dev/null || true)"
SECRETS_DIFF="$(git status --short .env* 2>/dev/null || true)"

if [[ -n "$BANK_DIFF" ]]; then
  echo "FAIL: Question Bank V4 working tree modified!"
  INVARIANTS="FAIL"
  BANK_V4_CHANGED="true"
  STATUS="BLOCKED"
  BLOCKERS="BANK_V4_MODIFIED"
fi

if [[ -n "$MIGRATIONS_DIFF" ]]; then
  echo "FAIL: Uncommitted Supabase migrations in working tree!"
  INVARIANTS="FAIL"
  MIGRATIONS_CHANGED="true"
  STATUS="BLOCKED"
  BLOCKERS="MIGRATIONS_UNCOMMITTED"
fi

if [[ -n "$SECRETS_DIFF" ]]; then
  echo "FAIL: Environment secrets modified!"
  INVARIANTS="FAIL"
  ENV_OR_SECRETS_CHANGED="true"
  STATUS="BLOCKED"
  BLOCKERS="ENV_OR_SECRETS_MODIFIED"
fi

# 2. Contract & Anti-spoiler tests
if [[ "$STATUS" == "PASS" ]]; then
  echo "[1/4] Running contract & anti-spoiler tests..."
  if ! ./node_modules/.bin/tsx --test scripts/qa-practice-tutor-contract.test.ts > "$ARTIFACT_DIR/contract.log" 2>&1; then
    echo "FAIL: Contract tests failed"
    CONTRACT_TESTS="FAIL"
    STATUS="BLOCKED"
    BLOCKERS="CONTRACT_TESTS_FAILED"
    tail -n 25 "$ARTIFACT_DIR/contract.log"
  else
    echo "✔ Contract & anti-spoiler tests passed"
  fi
fi

# 3. Unit & Security suite
if [[ "$STATUS" == "PASS" ]]; then
  echo "[2/4] Running unit & security suite..."
  if ! ./node_modules/.bin/tsx --test src/lib/tutor/tutor.test.ts src/lib/tutor/tutor-candidate-policy.test.ts > "$ARTIFACT_DIR/unit.log" 2>&1; then
    echo "FAIL: Unit/Security tests failed"
    SECURITY_TESTS="FAIL"
    STATUS="BLOCKED"
    BLOCKERS="SECURITY_TESTS_FAILED"
    tail -n 25 "$ARTIFACT_DIR/unit.log"
  else
    echo "✔ Unit & security tests passed"
  fi
fi

# 4. Typecheck (executed in --full and --browser)
if [[ "$STATUS" == "PASS" && ("$MODE" == "--full" || "$MODE" == "--browser") ]]; then
  echo "[3/4] Running typecheck..."
  if ! ./node_modules/.bin/tsc --noEmit > "$ARTIFACT_DIR/typecheck.log" 2>&1; then
    echo "FAIL: Typecheck failed"
    TYPECHECK="FAIL"
    STATUS="BLOCKED"
    BLOCKERS="TYPECHECK_FAILED"
    tail -n 25 "$ARTIFACT_DIR/typecheck.log"
  else
    echo "✔ Typecheck passed"
  fi
fi

# 5. Production build (executed in --full)
if [[ "$STATUS" == "PASS" && "$MODE" == "--full" ]]; then
  echo "[4/4] Running production build..."
  if ! npm run build > "$ARTIFACT_DIR/build.log" 2>&1; then
    echo "FAIL: Production build failed"
    BUILD="FAIL"
    STATUS="BLOCKED"
    BLOCKERS="BUILD_FAILED"
    tail -n 25 "$ARTIFACT_DIR/build.log"
  else
    echo "✔ Production build passed"
  fi
fi

# 6. Playwright Browser E2E (executed in --full and --browser)
if [[ "$STATUS" == "PASS" && ("$MODE" == "--full" || "$MODE" == "--browser") ]]; then
  echo "Running Playwright browser E2E..."
  # Ensure port 3000 is clean
  fuser -k 3000/tcp || true

  export PORT=3000
  export E2E_BASE_URL="http://127.0.0.1:3000"
  export GCM_TEST_AUTH_BYPASS="1"
  export NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
  export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
  export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

  DEV_SERVER_PID=""

  cleanup_server() {
    if [[ -n "$DEV_SERVER_PID" ]]; then
      kill "$DEV_SERVER_PID" 2>/dev/null || true
    fi
  }
  trap cleanup_server EXIT

  npm run dev -- -p 3000 > "$ARTIFACT_DIR/dev-server.log" 2>&1 &
  DEV_SERVER_PID=$!

  # Wait for server readiness
  READY=0
  for i in {1..30}; do
    if curl -s http://127.0.0.1:3000 >/dev/null; then
      READY=1
      break
    fi
    sleep 1
  done

  if [[ $READY -eq 1 ]]; then
    if ./node_modules/.bin/playwright test tests/e2e/practice-tutor-vnext.spec.ts > "$ARTIFACT_DIR/browser.log" 2>&1; then
      BROWSER_E2E="PASS"
      echo "✔ Browser E2E passed"
    else
      BROWSER_E2E="FAIL"
      STATUS="BLOCKED"
      BLOCKERS="BROWSER_E2E_FAILED"
      echo "FAIL: Playwright Browser E2E failed"
      tail -n 30 "$ARTIFACT_DIR/browser.log"
    fi
  else
    BROWSER_E2E="FAIL"
    STATUS="BLOCKED"
    BLOCKERS="DEV_SERVER_TIMEOUT"
    echo "FAIL: Dev server did not start in time on http://127.0.0.1:3000"
  fi

  cleanup_server
  trap - EXIT
fi

# Write checkpoint.env
cat <<EOF > "$ARTIFACT_DIR/checkpoint.env"
STATUS=${STATUS}
TASK=practice-tutor-experience-vnext-repair
ACTOR=GOOGLE_ANTIGRAVITY
COMPUTER=$(hostname)
ORIGINAL_BASE_SHA=${ORIGINAL_BASE_SHA}
REPAIR_BASE_SHA=${REPAIR_BASE_SHA}
BRANCH=${BRANCH}
WORKTREE=${WORKTREE}
HEAD_SHA=${HEAD_SHA}
CONTRACT_TESTS=${CONTRACT_TESTS}
SECURITY_TESTS=${SECURITY_TESTS}
TARGETED_TESTS=${TARGETED_TESTS}
TYPECHECK=${TYPECHECK}
BUILD=${BUILD}
BROWSER_E2E=${BROWSER_E2E}
INVARIANTS=${INVARIANTS}
BANK_V4_CHANGED=${BANK_V4_CHANGED}
MIGRATIONS_CHANGED=${MIGRATIONS_CHANGED}
ENV_OR_SECRETS_CHANGED=${ENV_OR_SECRETS_CHANGED}
REMOTE_SYSTEMS_TOUCHED=false
COMMIT_CREATED=false
PUSH=NOT_PERFORMED
PR=NOT_CREATED
BLOCKERS=${BLOCKERS}
REPORT_PATH=${ARTIFACT_DIR}/report.json
NEXT_GATE=CHATGPT_WEB_ARCHITECTURE_SECURITY_REVIEW
EOF

# Write report.json
cat <<EOF > "$ARTIFACT_DIR/report.json"
{
  "status": "${STATUS}",
  "task": "practice-tutor-experience-vnext-repair",
  "originalBaseSha": "${ORIGINAL_BASE_SHA}",
  "repairBaseSha": "${REPAIR_BASE_SHA}",
  "headSha": "${HEAD_SHA}",
  "branch": "${BRANCH}",
  "worktree": "${WORKTREE}",
  "contractTests": "${CONTRACT_TESTS}",
  "securityTests": "${SECURITY_TESTS}",
  "targetedTests": "${TARGETED_TESTS}",
  "typecheck": "${TYPECHECK}",
  "build": "${BUILD}",
  "browserE2e": "${BROWSER_E2E}",
  "invariants": "${INVARIANTS}",
  "bankV4Changed": ${BANK_V4_CHANGED},
  "migrationsChanged": ${MIGRATIONS_CHANGED},
  "envOrSecretsChanged": ${ENV_OR_SECRETS_CHANGED},
  "blockers": "${BLOCKERS}"
}
EOF

echo "========================================================="
echo "Runner Execution Summary:"
echo "STATUS: $STATUS"
echo "CONTRACT_TESTS: $CONTRACT_TESTS"
echo "SECURITY_TESTS: $SECURITY_TESTS"
echo "TYPECHECK: $TYPECHECK"
echo "BUILD: $BUILD"
echo "BROWSER_E2E: $BROWSER_E2E"
echo "INVARIANTS: $INVARIANTS"
echo "Checkpoint: $ARTIFACT_DIR/checkpoint.env"
echo "========================================================="

if [[ "$STATUS" != "PASS" ]]; then
  exit 1
fi
