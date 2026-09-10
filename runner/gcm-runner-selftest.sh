#!/usr/bin/env bash
# Agent: ChatGPT Web | Model: GPT-5.6 Sol
set -u
status=PASS
count=0
for script in runner/*.sh; do
  count=$((count + 1))
  if ! bash -n "$script"; then status=FAIL; fi
done
printf 'STATUS=%s\n' "$status"
printf 'RUNNERS_CHECKED=%s\n' "$count"
[[ "$status" == PASS ]]