# Runtime and Release Baseline

Status: canonical
Owner: PM-Governance
Last reviewed: 2026-09-08 (v0.13.1 Production Release Closeout)
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


## Producción vigente

<!-- Agent: Google_Antigravity | Model: gemini-3.6-flash -->
- Version: `0.13.1`.
- Release date: `2026-09-07`.
- Deployment / Closeout date: `2026-09-08`.
- Application release SHA (`DEPLOYED_APPLICATION_SHA` / `RUNTIME_SHA`): `e4b34561debdca3439e76ed826c7ddfbf5f1ff85`.
- Documentation baseline SHA: `0d64a5f3b3756ff527e372f966eecfe68b4fe8da` (HEAD autoritativo gestionado monotónicamente vía Git).
- Container: `gcm-production-e4b3456`.
- Puerto canónico interno: `3008`.
- Imagen inmutable: `gcm-canary-app:e4b3456`.
- Build time: `2026-09-08`.
- nginx upstream: `127.0.0.1:3008`.
- Rollback SHA disponible: `9bea4d4959f11231c4c2e61f7f1eda5fe5caf87e` (`v0.13.0`).
- ReleaseStamp: `PASS`.
- Public smoke: `PASS`.
- Authenticated smoke: `PASS`.
- Tag: `v0.13.1` -> `e4b34561debdca3439e76ed826c7ddfbf5f1ff85`.
- GitHub Release: `published` (`https://github.com/MarlonMedellin/GanaConMerito/releases/tag/v0.13.1`).

## Evidencia de cierre

`docs/05-ops/V0.13.1-PRODUCTION-CLOSEOUT-20260908.md`
