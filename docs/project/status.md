---
id: PROJECT-STATUS
name: status
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: project
last_reviewed: 2026-08-30
---

# Estado actual - GanaConMerito

Este archivo contiene solo el estado operativo vigente. La historia permanece en Git, tags, GitHub Releases y documentos archivados.

## Produccion

<!-- Agent: Google_Antigravity | Model: gemini-3.6-flash -->
- Estado de disponibilidad de runtime: `GREEN` (v0.13.1 HTTP OK).
- Estado de frontera de datos / Supabase: `GREEN` (Verificado seguro: sin exposición de answer-bank/respuestas/explicaciones a anon/authenticated vía REST o API).
- Version: `0.13.1`.
- Release date: `2026-09-07`.
- Deployment / Closeout date: `2026-09-08`.
- Deployed Application SHA (`DEPLOYED_APPLICATION_SHA` / `RUNTIME_SHA`): `e4b34561debdca3439e76ed826c7ddfbf5f1ff85`.
- Repository governance HEAD: `e203b006c2bbc7bc50f35cbc6014da65ec2ab61e`.
- URL: `https://ganaconmerito.com`.
- Runtime: `gcm-production-e4b3456`.
- Puerto canónico interno: `3008`.
- Imagen: `gcm-canary-app:e4b3456`.
- ReleaseStamp: `PASS`.
- Public smoke: `PASS`.
- Authenticated smoke: `PASS`.
- Rollback disponible: `9bea4d4959f11231c4c2e61f7f1eda5fe5caf87e` (v0.13.0).

## Publicacion

- Tag: `v0.13.1`.
- Tag target: `e4b34561debdca3439e76ed826c7ddfbf5f1ff85`.
- GitHub Release: `published` (`https://github.com/MarlonMedellin/GanaConMerito/releases/tag/v0.13.1`).
- Release closeout: `docs/05-ops/V0.13.1-PRODUCTION-CLOSEOUT-20260908.md`.


## Residual por clasificar

El inventario del servidor reporto contenedores historicos en `:3003` y `:3004` que no fueron autorizados para borrado en el gate anterior. No forman parte de la ruta productiva verificada. Deben identificarse antes de declararlos eliminables.

## Compatibilidad de contratos historicos

Este bloque existe unicamente para conservar contratos automatizados legacy mientras la historia completa vive fuera del snapshot operativo. No representa el estado vigente.

- Sprint 43 - Learning Paths + Misconception Signals: cerrado; sus senales pedagogicas forman parte de la historia del producto.
- Sprint 42 - Rich Ingestion Normalization: cerrado.
- Sprint 22: evidencia `synthesized_governed_unverified`; no cuenta con anexos oficiales suficientes para considerarse source-verified.

## Fuente de verdad

1. `VERSION.json` para version y fecha de release.
2. Tag/GitHub Release para identidad publicada.
3. `docs/05-ops/runtime-and-release.md` para runtime vigente.
4. Este archivo para snapshot ejecutivo.

No usar documentos historicos para inferir el estado actual de produccion.
\n## Updates\n- Unified Cargo/OPEC selector implemented in Profile. Technical debt and Visual Homogenization plan documented in `docs/project/homogenization-and-opec-debt.md`.
