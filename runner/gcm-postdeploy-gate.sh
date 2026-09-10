#!/usr/bin/env bash
# Agent: ChatGPT Web | Model: GPT-5.6 Sol
set -u

if [[ -z "${QA_BASE_URL:-}" ]]; then
  echo "STATUS=BLOCKED"
  echo "BLOCKERS=QA_BASE_URL_REQUIRED"
  exit 2
fi

echo "TARGET=$QA_BASE_URL"
if npm run qa:smoke:postdeploy; then
  echo "STATUS=PASS"
  echo "POSTDEPLOY_SMOKE=PASS"
  echo "DEPLOY_PERFORMED=false"
else
  echo "STATUS=FAIL"
  echo "POSTDEPLOY_SMOKE=FAIL"
  exit 1
fi