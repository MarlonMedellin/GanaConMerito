#!/usr/bin/env bash
# Agent: ChatGPT Web | Model: GPT-5.6 Sol
set -u
base_ref=${1:-origin/master}
dry_run=${GCM_DRY_RUN:-0}

if ! git rev-parse --verify "$base_ref" >/dev/null 2>&1; then
  echo "STATUS=BLOCKED"
  echo "BLOCKERS=BASE_REF_NOT_FOUND:$base_ref"
  exit 2
fi

files=$(git diff --name-only "$base_ref"...HEAD)
if [[ -z "$files" ]]; then
  echo "STATUS=PASS"
  echo "CHANGE_CLASS=NONE"
  echo "TARGETED_TESTS=NOT_REQUIRED"
  exit 0
fi

plan=()
class=DOCUMENTATION
add() { local cmd=$1; for x in "${plan[@]}"; do [[ "$x" == "$cmd" ]] && return; done; plan+=("$cmd"); }

while IFS= read -r file; do
  case "$file" in
    docs/*|*.md) add "npm run check:doc-triggers" ;;
    src/lib/tutor/*|src/app/api/tutor/*|scripts/*tutor*|scripts/*g6*) class=AI_PROVIDER; add "npm run test:tutor"; add "npm run typecheck" ;;
    content/*|scripts/*content*|scripts/*v4*|src/lib/*question*) class=CONTENT_V4; add "npm run content:validate"; add "npm run content:validate:knowledge-targeting"; add "npm run test:v4-import" ;;
    supabase/*|src/lib/session/*|scripts/*security*) class=AUTH_SECURITY_DB; add "npm run test:security"; add "npm run typecheck" ;;
    src/app/*|src/components/*) class=UI_API; add "npm run test:canary:vertical-contract"; add "npm run typecheck" ;;
    package.json|package-lock.json|next.config.*|tsconfig.json|Dockerfile|.github/workflows/*) class=CROSS_CUTTING; add "npm run test:unit"; add "npm run typecheck"; add "npm run build" ;;
    *) [[ "$class" == DOCUMENTATION ]] && class=GENERAL; add "npm run typecheck" ;;
  esac
done <<< "$files"

printf 'CHANGE_CLASS=%s\n' "$class"
printf 'FILES_CHANGED=%s\n' "$(echo "$files" | tr '\n' ';' | sed 's/;$//')"
printf 'TEST_PLAN=%s\n' "$(IFS=';'; echo "${plan[*]}")"

if [[ "$dry_run" == 1 ]]; then
  echo "STATUS=PASS"
  echo "TARGETED_TESTS=DRY_RUN"
  exit 0
fi

for cmd in "${plan[@]}"; do
  echo "RUN=$cmd"
  if ! bash -lc "$cmd"; then
    echo "STATUS=FAIL"
    echo "TARGETED_TESTS=FAIL"
    exit 1
  fi
done

echo "STATUS=PASS"
echo "TARGETED_TESTS=PASS"