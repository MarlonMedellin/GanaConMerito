# Checklist de Release - GanaConMerito

Status: canonical
Owner: Release Owner
Last reviewed: 2026-08-30
Related files:
- `VERSION.json`
- `docs/02-delivery/versioning-and-releases.md`
- `docs/05-ops/runtime-and-release.md`

Este archivo contiene el baseline vigente y el procedimiento reutilizable para la siguiente release. La evidencia historica permanece en Git, tags, GitHub Releases y closeouts versionados.

## Baseline vigente

- VERSION=`0.11.0`
- RELEASE_DATE=`2026-08-30`
- RELEASE_STATUS=`CLOSED`
- FINAL_RELEASE_SHA=`e3e9b3436f57a0354c7fed941140df468499d624`
- PRODUCTION_URL=`https://ganaconmerito.com`
- PRODUCTION_RUNTIME=`gcm-canary-l2-e3e9b34`
- PRODUCTION_PORT=`3006`
- PRODUCTION_RUNTIME_SHA=`e3e9b3436f57a0354c7fed941140df468499d624`
- RELEASE_STAMP=`PASS`
- PUBLIC_RUNTIME_SMOKE=`PASS`
- AUTHENTICATED_SMOKE=`PASS`
- V4_ACTIVE_COUNT=`248`
- RELEASE_TAG=`v0.11.0`
- GITHUB_RELEASE=`published`
- CLEANUP_3002=`COMPLETE`
- CLEANUP_3005=`COMPLETE`

## Cierre v0.11.0

- [x] Release SHA exacto desplegado y verificado.
- [x] Canary PASS.
- [x] Production promotion PASS.
- [x] ReleaseStamp PASS.
- [x] Public smoke PASS.
- [x] Authenticated smoke PASS.
- [x] Dashboard desktop/mobile PASS.
- [x] Tutor visible PASS.
- [x] V4 active count 248.
- [x] Tag `v0.11.0` publicado sobre el release SHA.
- [x] GitHub Release publicada.
- [x] Runtime antiguo `:3002` retirado.
- [x] Runtime antiguo `:3005` retirado.
- [x] Imagenes antiguas asociadas sin uso retiradas.
- [x] Backup nginx de promocion retirado.
- [x] Sin migraciones, Content Sync, G6 ni cambios Supabase durante cleanup.

Residual operativo: contenedores historicos en `:3003` y `:3004` fueron preservados porque no estaban clasificados/autorizados. No forman parte de la ruta productiva `:3006`.

## Procedimiento para la siguiente release

1. Determinar bump SemVer por alcance real.
2. Actualizar `VERSION.json`.
3. Definir `CANDIDATE_SHA`.
4. Ejecutar solo validaciones proporcionales al cambio y CI requerido.
5. Fusionar por PR y registrar `FINAL_RELEASE_SHA`.
6. Desplegar exactamente ese SHA en Canary.
7. Promover el mismo artefacto validado cuando sea posible.
8. Verificar ReleaseStamp, public smoke y gates afectados.
9. Hacer smoke autenticado cuando cambien superficies autenticadas o sea requerido para retirar rollback.
10. Publicar tag y GitHub Release sobre el release SHA, no sobre commits documentales posteriores.
11. Retirar rollback en gate separado cuando la nueva produccion este suficientemente validada.

No repetir tests, sync, G6, migraciones o deploys si el cambio no los afecta.
