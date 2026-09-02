#!/usr/bin/env bash
# Agent: ChatGPT Web | Model: GPT-5.6 Sol
set -u

if [[ -z "${QA_BASE_URL:-}" ]]; then
  echo "STATUS=BLOCKED"
  echo "BLOCKERS=QA_BASE_URL_REQUIRED"
  exit 2
fi

echo "TARGET=$QA_BASE_URL"
npm run test:canary:resume-contract || { echo "STATUS=FAIL"; exit 1; }
npm run test:canary:vertical-contract || { echo "STATUS=FAIL"; exit 1; }

if [[ "${GCM_CANARY_LIVE:-0}" == 1 ]]; then
  npm run qa:canary:resume || { echo "STATUS=FAIL"; exit 1; }
  npm run qa:canary:vertical || { echo "STATUS=FAIL"; exit 1; }
  live=PASS
else
  live=NOT_REQUESTED
fi

echo "STATUS=PASS"
echo "CONTRACTS=PASS"
echo "LIVE_CANARY=$live"
echo "DEPLOY_PERFORMED=false"