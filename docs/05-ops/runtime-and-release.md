# Runtime and Release Baseline

Status: canonical
Owner: PM-Governance
Last reviewed: 2026-08-30
Related files:
- `AGENTS.md`
- `VERSION.json`
- `docs/project/status.md`
- `docs/02-delivery/versioning-and-releases.md`
- `docs/02-delivery/release-checklist.md`

## Objetivo

Mantener una sola referencia breve del runtime vigente y evitar que evidencia historica compita con produccion actual.

## Fuente de verdad operacional

1. repositorio remoto principal;
2. `VERSION.json`;
3. runtime visible;
4. evidencia de release/closeout.

Repositorio: `https://github.com/MarlonMedellin/GanaConMerito`

Runtime publico: `https://ganaconmerito.com`

## Produccion vigente

- Version: `0.11.0`.
- Release date: `2026-08-30`.
- Final release SHA: `e3e9b3436f57a0354c7fed941140df468499d624`.
- Container: `gcm-canary-l2-e3e9b34`.
- Puerto: `3006`.
- Imagen: `sha256:01eefe55cb6b024ac5a7adce5ca4fe0b724583ce9db4b3521ef442f5ecb8b76f`.
- Build time: `2026-08-31T02:28:58Z`.
- nginx upstream: `127.0.0.1:3006`.
- ReleaseStamp: `PASS`.
- Public smoke: `PASS`.
- Authenticated smoke: `PASS`.
- Dashboard desktop/mobile: `PASS`.
- Tutor visible: `PASS`.
- OpenRouter visible LLM: `false`.
- V4 active count: `248`.
- Tag: `v0.11.0` -> `e3e9b3436f57a0354c7fed941140df468499d624`.
- GitHub Release: `published`.

## Cleanup ejecutado

- `:3002` / `gcm-canary-app`: retirado.
- `:3005` / `gcm-canary-l2-0e710b7`: retirado.
- Imagenes antiguas asociadas sin uso: retiradas.
- Backup nginx `cnsc.profemarlon.com.rollback-v0.11.0-promotion-20260831T024215Z`: retirado.
- `:3002`: libre.
- `:3005`: libre.
- `:3006`: activo.
- `nginx -t`: `PASS`.
- Public smoke posterior al cleanup: `PASS`.
- Deploy durante cleanup: `false`.
- Rebuild durante cleanup: `false`.
- Supabase cambiado: `false`.
- Migrations: `false`.
- Content Sync: `false`.
- G6: `false`.

## Residual del host

El ultimo inventario reporto contenedores historicos en `:3003` y `:3004`. No fueron modificados porque no estaban clasificados/autorizados en el gate de cleanup. No forman parte del upstream productivo. Deben inspeccionarse por nombre, imagen, SHA y dependencias antes de eliminarlos.

## Reglas operativas

- No declarar un runtime verificado sin SHA visible y smoke correspondiente.
- No usar reportes historicos como fuente del estado actual.
- No mover un tag publicado a commits documentales posteriores.
- Reutilizar evidencia valida del mismo SHA; no repetir gates sin cambio material.
- No ejecutar migraciones, Content Sync o G6 como parte de un cleanup de containers.
- No usar `docker system prune` como sustituto de una limpieza selectiva.

## Evidencia de cierre

`docs/05-ops/V0.11.0-PRODUCTION-CLOSEOUT-20260830.md`
