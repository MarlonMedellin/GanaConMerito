#!/usr/bin/env bash
# Agent: ChatGPT Web | Model: GPT-5.6 Sol
set -u

status=PASS
command -v git >/dev/null 2>&1 || status=FAIL
command -v node >/dev/null 2>&1 || status=FAIL
command -v npm >/dev/null 2>&1 || status=FAIL

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "STATUS=FAIL"
  echo "BLOCKERS=NOT_A_GIT_WORKTREE"
  exit 1
fi

sha=$(git rev-parse HEAD)
branch=$(git branch --show-current)
if [[ -n "$(git status --porcelain)" ]]; then worktree=DIRTY; else worktree=CLEAN; fi

printf 'STATUS=%s\n' "$status"
printf 'HEAD_SHA=%s\n' "$sha"
printf 'BRANCH=%s\n' "${branch:-DETACHED}"
printf 'WORKTREE=%s\n' "$worktree"
printf 'NODE=%s\n' "$(node --version 2>/dev/null || echo MISSING)"
printf 'NPM=%s\n' "$(npm --version 2>/dev/null || echo MISSING)"
printf 'DOCKER=%s\n' "$(command -v docker >/dev/null 2>&1 && echo AVAILABLE || echo NOT_AVAILABLE)"
printf 'SUPABASE_CLI=%s\n' "$(command -v supabase >/dev/null 2>&1 && echo AVAILABLE || echo NOT_AVAILABLE)"
[[ "$status" == PASS ]]