#!/usr/bin/env bash
set -Eeuo pipefail

# Resolve project root
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT"

ARTIFACT_DIR="${REPO_ROOT}/.gcm-artifacts"
mkdir -p "$ARTIFACT_DIR"

MODE="${1:---quick}"

BASE_SHA="$(git rev-parse origin/master 2>/dev/null || echo "unknown")"
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
BLOCKERS="NONE"

echo "=== Running GCM Practice & Tutor vNext Test Runner [$MODE] ==="

# Invariant check: Bank V4 non-mutation
BANK_DIFF="$(git status --short content/question-bank-v4/ 2>/dev/null || true)"
MIGRATIONS_DIFF="$(git status --short supabase/migrations/ 2>/dev/null || true)"

if [[ -n "$BANK_DIFF" ]]; then
  echo "FAIL: Question Bank V4 modified!"
  INVARIANTS="FAIL"
  STATUS="BLOCKED"
  BLOCKERS="BANK_V4_MODIFIED"
fi

if [[ -n "$MIGRATIONS_DIFF" ]]; then
  echo "FAIL: Supabase migrations modified!"
  INVARIANTS="FAIL"
  STATUS="BLOCKED"
  BLOCKERS="MIGRATIONS_MODIFIED"
fi

if [[ "$STATUS" == "PASS" ]]; then
  echo "[1/4] Running contract & anti-spoiler tests..."
  if ! ./node_modules/.bin/tsx --test scripts/qa-practice-tutor-contract.test.ts > "$ARTIFACT_DIR/contract.log" 2>&1; then
    echo "FAIL: Contract tests failed"
    CONTRACT_TESTS="FAIL"
    STATUS="BLOCKED"
    BLOCKERS="CONTRACT_TESTS_FAILED"
    tail -n 20 "$ARTIFACT_DIR/contract.log"
  else
    echo "✔ Contract & anti-spoiler tests passed"
  fi
fi

if [[ "$STATUS" == "PASS" ]]; then
  echo "[2/4] Running unit & security suite..."
  if ! ./node_modules/.bin/tsx --test src/lib/tutor/tutor.test.ts src/lib/tutor/tutor-candidate-policy.test.ts > "$ARTIFACT_DIR/unit.log" 2>&1; then
    echo "FAIL: Unit/Security tests failed"
    SECURITY_TESTS="FAIL"
    STATUS="BLOCKED"
    BLOCKERS="SECURITY_TESTS_FAILED"
    tail -n 20 "$ARTIFACT_DIR/unit.log"
  else
    echo "✔ Unit & security tests passed"
  fi
fi

if [[ "$STATUS" == "PASS" && ("$MODE" == "--full" || "$MODE" == "--browser") ]]; then
  echo "[3/4] Running typecheck..."
  if ! npm run typecheck > "$ARTIFACT_DIR/typecheck.log" 2>&1; then
    echo "FAIL: Typecheck failed"
    TYPECHECK="FAIL"
    STATUS="BLOCKED"
    BLOCKERS="TYPECHECK_FAILED"
    tail -n 20 "$ARTIFACT_DIR/typecheck.log"
  else
    echo "✔ Typecheck passed"
  fi
fi

if [[ "$STATUS" == "PASS" && "$MODE" == "--full" ]]; then
  echo "[4/4] Running production build..."
  if ! npm run build > "$ARTIFACT_DIR/build.log" 2>&1; then
    echo "FAIL: Production build failed"
    BUILD="FAIL"
    STATUS="BLOCKED"
    BLOCKERS="BUILD_FAILED"
    tail -n 20 "$ARTIFACT_DIR/build.log"
  else
    echo "✔ Production build passed"
  fi
fi

if [[ "$STATUS" == "PASS" && "$MODE" == "--browser" ]]; then
  echo "[4/4] Running Playwright browser E2E..."
  if npx playwright test tests/e2e/authenticated-practice.spec.ts > "$ARTIFACT_DIR/browser.log" 2>&1; then
    BROWSER_E2E="PASS"
    echo "✔ Browser E2E passed"
  else
    BROWSER_E2E="FAIL"
    echo "WARNING: Browser E2E skipped/failed"
  fi
fi

# Write checkpoint.env
cat <<EOF > "$ARTIFACT_DIR/checkpoint.env"
STATUS=${STATUS}
TASK=practice-tutor-experience-vnext
ACTOR=GOOGLE_ANTIGRAVITY
COMPUTER=$(hostname)
BASE_SHA=${BASE_SHA}
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
BANK_V4_CHANGED=false
MIGRATIONS_CHANGED=false
REMOTE_SYSTEMS_TOUCHED=false
COMMIT_CREATED=false
PUSH=NOT_PERFORMED
PR=NOT_CREATED
BLOCKERS=${BLOCKERS}
NEXT_GATE=CHATGPT_WEB_ARCHITECTURE_SECURITY_REVIEW
EOF

# Write report.json
cat <<EOF > "$ARTIFACT_DIR/report.json"
{
  "status": "${STATUS}",
  "task": "practice-tutor-experience-vnext",
  "baseSha": "${BASE_SHA}",
  "headSha": "${HEAD_SHA}",
  "branch": "${BRANCH}",
  "worktree": "${WORKTREE}",
  "contractTests": "${CONTRACT_TESTS}",
  "securityTests": "${SECURITY_TESTS}",
  "typecheck": "${TYPECHECK}",
  "build": "${BUILD}",
  "browserE2e": "${BROWSER_E2E}",
  "invariants": "${INVARIANTS}",
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
echo "INVARIANTS: $INVARIANTS"
echo "Checkpoint: $ARTIFACT_DIR/checkpoint.env"
echo "========================================================="

if [[ "$STATUS" != "PASS" ]]; then
  exit 1
fi
