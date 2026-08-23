# Canary rollback runbook (independent of Legacy)

Status: approval-gated procedure. It applies only after a future Canary service
and its distinct route have been explicitly created.

## Scope lock

The only permitted target is the `gcm-canary` Compose project using:

- `/opt/gcm-canary/app/ops/canary/docker-compose.canary.yml`;
- `/opt/gcm-canary/env/gcm-canary.env`;
- container `gcm-canary-app`.

Never run a compose command against `/opt/gcm/docker-compose.yml`, `gcm-app`,
`/opt/gcm/app`, `/opt/gcm/env/gcm-app.env`, or the `ganaconmerito.com` route.

## Rollback sequence

1. Disable only the separately recorded Canary routing configuration. Do not
   reload a proxy until the exact Canary-only config path is reviewed.
2. Preserve Canary logs and record the active `APP_COMMIT`, container ID, and
   time for RCA.
3. Stop only the Canary service:

   ```bash
   docker compose \
     -f /opt/gcm-canary/app/ops/canary/docker-compose.canary.yml \
     --project-name gcm-canary stop gcm-canary-app
   ```

4. Keep the Canary Candidate Supabase project intact. Do not reset migrations,
   delete data, alter Auth, or point Legacy at the Candidate.
5. To recover a previously approved stable Canary, set `APP_COMMIT` and
   `NEXT_PUBLIC_APP_COMMIT` in the isolated Canary env file to the recorded
   `STABLE_CANARY_SHA`, rerun preflight, and obtain a fresh explicit start
   approval.

No Legacy service, master branch, production schema, or public route is part of
this procedure.
