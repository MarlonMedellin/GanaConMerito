# Canary deploy runbook (approval-gated)

Status: PRE-CANARY-INFRA-001 artifact. This runbook prepares an isolated target;
it does not authorize deployment, routing, DNS, TLS, Supabase changes, or exposure.

## Confirmed protected runtime

The 2026-08-23 VPS inspection found the published Legacy runtime as:

- Compose project `gcm`, service/container `gcm-app`;
- deploy tree `/opt/gcm/app` and environment file `/opt/gcm/env/gcm-app.env`;
- host binding `127.0.0.1:3000 -> 3000`;
- Nginx route for `ganaconmerito.com` to `127.0.0.1:3000`.

Those resources, their mounts, and their source tree are out of scope for every
Canary operation.

## Proposed isolated target

| Resource | Value | Status |
| --- | --- | --- |
| deploy tree | `/opt/gcm-canary/app` | PROPOSED |
| compose file | `/opt/gcm-canary/app/ops/canary/docker-compose.canary.yml` | PROPOSED |
| Compose project | `gcm-canary` | CONFIRMED by artifact |
| service/container | `gcm-canary-app` | CONFIRMED by artifact |
| host/internal port | `127.0.0.1:3002 -> 3000` | PROPOSED; 3002 was free at inspection time |
| env file | `/opt/gcm-canary/env/gcm-canary.env` | PROPOSED |
| hostname/routing | no allocation exists | UNRESOLVED; do not invent or publish one |
| logs | Docker local driver for `gcm-canary-app` | CONFIRMED by artifact |

The source checkout must be exactly
`963d9b899a78c9aaeeb3a74238ce904136ee00ac`. The env file must retain that exact
value in both `APP_COMMIT` and `NEXT_PUBLIC_APP_COMMIT`, and must use only
`https://dhiytzbwodfvdrnwhkcw.supabase.co`.

## Isolation contract

- The Compose file has no bind mount or named volume.
- It has no Docker socket, Legacy tree, Legacy environment file, or production
  mount.
- The service role key is loaded only through the runtime `env_file`; it is not a
  Docker build argument or `NEXT_PUBLIC_` value.
- It binds only loopback, so creating the container alone cannot expose the app.
- `restart: "no"` prevents an accidental persistent runtime after host reboot.

## Preflight only

After copying the repository to the proposed isolated tree and creating the
separate environment file with restrictive permissions, run only:

```bash
cd /opt/gcm-canary/app
./ops/canary/preflight.sh /opt/gcm-canary/env/gcm-canary.env
```

This calls `docker compose config -q` and static checks only. It must be rerun
immediately before any future deployment because port availability and the
hostname allocation are time-sensitive.

## Required approval gates before any runtime action

1. Supabase Auth admission is configured and verified for named stakeholders.
2. A distinct hostname, route file, TLS plan, and allowed callback origins are
   approved in writing.
3. The deploy path and host port are reconfirmed unused.
4. An operator is explicitly authorized to run `docker compose ... up` for this
   Compose project only.

Until all four gates are green, do not create the environment file, build an
image, start a container, or change a proxy/DNS/TLS configuration.

## Auth admission checkpoint (hosted Supabase; not executed)

The Candidate settings observed on 2026-08-23 are not safe for a closed Canary:

- Google is disabled;
- `disable_signup` is `false`;
- the Candidate has zero Auth users;
- the application callback bootstraps a profile for any authenticated user and
  has no stakeholder allowlist.

The minimum hosted configuration is therefore:

1. Enable the Google provider only after its Candidate-specific OAuth client,
   Site URL, and exact redirect URLs are approved.
2. Pre-provision or invite only the named stakeholder email addresses in the
   Candidate Auth project, then verify their Google identities link to those
   existing users.
3. Disable new-user signups in Supabase Auth. This is the native control that
   allows existing users to sign in while preventing a new Google account from
   becoming a Canary user.

The checkpoint must be performed manually in the Candidate Supabase Dashboard
with explicit authorization. The evidence required before exposure is: Google
enabled, signup disabled, only approved Auth users present, exact Canary
redirect URLs, and one approved-stakeholder login verification. Do not use an
arbitrary account to test the denial path and do not add an Auth Hook or a
migration unless the native control fails that approved verification.
