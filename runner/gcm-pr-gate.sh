#!/usr/bin/env bash
# Agent: ChatGPT Web | Model: GPT-5.6 Sol
set -u
base_ref=${1:-origin/master}
head_sha=$(git rev-parse HEAD 2>/dev/null || echo UNKNOWN)

if ! bash runner/gcm-preflight.sh; then
  echo "STATUS=FAIL"
  echo "PR_READY=false"
  exit 1
fi

if ! bash runner/gcm-check-changes.sh "$base_ref"; then
  echo "STATUS=FAIL"
  echo "HEAD_SHA=$head_sha"
  echo "TARGETED_TESTS=FAIL"
  echo "PR_READY=false"
  exit 1
fi

if ! git diff --check "$base_ref"...HEAD; then
  echo "STATUS=FAIL"
  echo "HEAD_SHA=$head_sha"
  echo "INVARIANTS=FAIL"
  echo "PR_READY=false"
  exit 1
fi

echo "STATUS=PASS"
echo "HEAD_SHA=$head_sha"
echo "BASE_REF=$base_ref"
echo "TARGETED_TESTS=PASS"
echo "INVARIANTS=PASS"
echo "PR_READY=true"