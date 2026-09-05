#!/usr/bin/env bash
# Agent: CODEX_LOCAL | Model: GPT-6
set -Eeuo pipefail
cd "$(dirname "$0")/.."
exec node scripts/run-practice-tutor-local.mjs "${1:---quick}"
