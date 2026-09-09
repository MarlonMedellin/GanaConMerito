# Checklist de Release - GanaConMerito

Status: canonical
Owner: Release Owner
Last reviewed: 2026-09-01
Related files:
- `VERSION.json`
- `docs/02-delivery/versioning-and-releases.md`
- `docs/05-ops/runtime-and-release.md`

Este archivo contiene el baseline vigente y el procedimiento reutilizable para la siguiente release. La evidencia historica permanece en Git, tags, GitHub Releases y closeouts versionados.

## Baseline vigente

<!-- Agent: Google_Antigravity | Model: gemini-3.6-flash -->
- VERSION=`0.13.1`
- RELEASE_DATE=`2026-09-07`
- CLOSEOUT_DATE=`2026-09-08`
- RELEASE_STATUS=`CLOSED`
- DEPLOYED_APPLICATION_SHA=`e4b34561debdca3439e76ed826c7ddfbf5f1ff85`
- DOCUMENTATION_BASELINE_SHA=`0d64a5f3b3756ff527e372f966eecfe68b4fe8da`
- PRODUCTION_URL=`https://ganaconmerito.com`
- PRODUCTION_RUNTIME=`gcm-production-e4b3456`
- PRODUCTION_PORT=`3008`
- PRODUCTION_RUNTIME_SHA=`e4b34561debdca3439e76ed826c7ddfbf5f1ff85`
- RELEASE_STAMP=`PASS`
- PUBLIC_RUNTIME_SMOKE=`PASS`
- AUTHENTICATED_SMOKE=`PASS`
- RELEASE_TAG=`v0.13.1`
- GITHUB_RELEASE=`published`
- ROLLBACK_AVAILABLE=`true` (`9bea4d4959f11231c4c2e61f7f1eda5fe5caf87e`)

## Cierre v0.13.1

- [x] Release SHA exacto desplegado y verificado (`e4b34561debdca3439e76ed826c7ddfbf5f1ff85`).
- [x] Production promotion PASS.
- [x] ReleaseStamp PASS.
- [x] Public smoke PASS.
- [x] Authenticated smoke PASS (verificado en gate `V0_13_1_PRODUCTION_RELEASE` / `docs/05-ops/V0.13.1-PRODUCTION-CLOSEOUT-20260908.md`).
- [x] Dashboard desktop/mobile PASS (verificado en gate `V0_13_1_PRODUCTION_RELEASE` / `docs/05-ops/V0.13.1-PRODUCTION-CLOSEOUT-20260908.md`).
- [x] Tutor visible PASS (verificado en gate `V0_13_1_PRODUCTION_RELEASE` / `docs/05-ops/V0.13.1-PRODUCTION-CLOSEOUT-20260908.md`).
- [x] Tag `v0.13.1` publicado sobre el release SHA (`e4b34561debdca3439e76ed826c7ddfbf5f1ff85`).
- [x] GitHub Release publicada (`https://github.com/MarlonMedellin/GanaConMerito/releases/tag/v0.13.1`).
- [x] Sin migraciones, Content Sync ni cambios Supabase remoto.
- [x] Rollback a v0.13.0 preservado (`9bea4d4959f11231c4c2e61f7f1eda5fe5caf87e`).

Evidencia de cierre: `docs/05-ops/V0.13.1-PRODUCTION-CLOSEOUT-20260908.md`.

## Procedimiento para la siguiente release

1. Determinar bump SemVer por alcance real.
2. Actualizar `VERSION.json`.
3. Definir `CANDIDATE_SHA`.
4. Ejecutar solo validaciones proporcionales al cambio y CI requerido.
5. Fusionar por PR y registrar `FINAL_RELEASE_SHA`.
6. Desplegar exactamente ese SHA en Canary / Producción.
7. Promover el mismo artefacto validado cuando sea posible.
8. Verificar ReleaseStamp, public smoke y gates afectados.
9. Hacer smoke autenticado cuando cambien superficies autenticadas o sea requerido para retirar rollback.
10. Publicar tag y GitHub Release sobre el release SHA, no sobre commits documentales posteriores.
11. Retirar rollback en gate separado cuando la nueva produccion este suficientemente validada.

No repetir tests, sync, G6, migraciones o deploys si el cambio no los afecta.

## Historial de la candidata v0.13.1 (CERRADA)

- VERSION=`0.13.1`
- RELEASE_DATE=`2026-09-07`
- RELEASE_STATUS=`CLOSED`
- PR_RANGE=`9bea4d4959f11231c4c2e61f7f1eda5fe5caf87e -> 63b8b52262fa2119c56e624759ce38540db3b2bd`
- FUNCTIONAL_PRS=`#137, #138, #139, #140, #141, #142`
- CANDIDATE_METADATA_PRS=`#143 (metadata-only)`
- POST_BASELINE_CLOSEOUT_PRS=`#144, #145, #147, #148`
- SAVED_RESPONSE_CASE=`CLOSED`
- CODE_BASELINE_SHA=`63b8b52262fa2119c56e624759ce38540db3b2bd`
- PRODUCTION_VERSION=`0.13.1`
- VALIDATIONS=`PASS`
- CI=`PASS`
- CANARY=`NOT_APPLICABLE (Despliegue directo a produccion v0.13.1)`
- PRODUCTION_PROMOTION=`PASS (Desplegado en produccion v0.13.1)`
- RELEASE_TAG=`v0.13.1` (publicado)
- GITHUB_RELEASE=`published`
- MIGRATIONS=`NO`
- CONTENT_SYNC=`NO`
- G6=`NO`
- SUPABASE_REMOTE_CHANGE=`NO`

Esta seccion documenta el historial de la release v0.13.1, la cual ha sido desplegada, publicada y cerrada en produccion.
