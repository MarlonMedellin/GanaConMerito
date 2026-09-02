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

## v0.12.0 / Tutor AI production closeout
- VERSION=0.12.0
- RELEASE_STATUS=CLOSED
- RELEASE_TAG=v0.12.0
- GITHUB_RELEASE=published
- FINAL_RELEASE_SHA=132f78113cf3b0917b459db39d79c710450bed52
- PRODUCTION_SHA=132f78113cf3b0917b459db39d79c710450bed52
- PRODUCTION_VERSION=v0.12.0
- PRODUCTION_UPSTREAM=127.0.0.1:3007
- PRODUCTION_HEALTH=PASS
- RELEASESTAMP=PASS
- PUBLIC_SMOKE=PASS
- AUTHENTICATED_SMOKE=PASS
- TUTOR_VISIBLE=PASS
- OPENROUTER_VISIBLE=PASS
- DETERMINISTIC_FALLBACK=PASS
- MULTITURN=PASS
- ROLLBACK_REMAINING=PASS
- MIGRATIONS=NO
- SUPABASE_REMOTE_CHANGE=NO
- CONTENT_SYNC=NO
- CONTENT_V4_CHANGE=NO
- DATABASE_CHANGED=false
- SECRETS_EXPOSED=false

### Alcance
- Release `v0.12.0` promovido y validado en produccion para Tutor AI visible.
- Cierre exclusivamente documental sobre evidencia previamente confirmada; no
  ejecuta deploy, Nginx, Canary, Supabase, base de datos, tag ni GitHub Release.
- No modifica codigo funcional, `VERSION.json`, contenido V4 ni infraestructura.

### Evidencia de cierre
- [x] Release `v0.12.0` cerrado sobre
  `132f78113cf3b0917b459db39d79c710450bed52`.
- [x] GitHub Release `v0.12.0` publicada.
- [x] Produccion validada en `v0.12.0` con upstream `127.0.0.1:3007`.
- [x] ReleaseStamp, smoke publico, smoke autenticado, Tutor visible,
  OpenRouter visible, fallback deterministico y multiturno registrados como PASS
  desde evidencia ya confirmada.
- [x] Sin migraciones, cambios remotos Supabase, Content Sync, cambios V4,
  cambios de base de datos ni secretos expuestos durante este cierre documental.
- [x] Rollback conservado: `gcm-canary-l2-e3e9b34`,
  `127.0.0.1:3006`, version `v0.11.0`.

## v0.11.0 / dashboard update production closeout
- VERSION=0.11.0
- RELEASE_DATE=2026-08-30
- RELEASE_STATUS=CLOSED
- RELEASE_CLASSIFICATION=MINOR
- FINAL_RELEASE_SHA=e3e9b3436f57a0354c7fed941140df468499d624
- CANARY=PASS
- PRODUCTION_PROMOTION=PASS
- PRODUCTION_RUNTIME=https://ganaconmerito.com
- PRODUCTION_RUNTIME_SHA=e3e9b3436f57a0354c7fed941140df468499d624
- RELEASE_STAMP=PASS
- PUBLIC_RUNTIME_SMOKE=PASS
- AUTHENTICATED_SMOKE=PASS
- V4_ACTIVE_COUNT=248
- RELEASE_TAG=v0.11.0
- RELEASE_TAG_TARGET_SHA=e3e9b3436f57a0354c7fed941140df468499d624
- GITHUB_RELEASE=published
- GITHUB_RELEASE_URL=https://github.com/MarlonMedellin/GanaConMerito/releases/tag/v0.11.0
- CLEANUP=NOT_PERFORMED
- Runtime verified: yes.
- Deploy performed: yes.
- User exposure: true.

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

## Candidata v0.12.0 - metadata preparada

- VERSION=`0.12.0`
- RELEASE_DATE=`2026-09-01`
- RELEASE_STATUS=`CANDIDATE_METADATA`
- SOURCE_PR=`#128`
- SOURCE_PR_MERGED=`true`
- CODE_BASELINE_SHA=`3f2b18a981328f3deaaea41fad869c8cd88a77a5`
- PRODUCTION_VERSION_REMAINS=`0.11.0`
- CI=`PENDING`
- CANARY=`PENDING`
- PRODUCTION_PROMOTION=`PENDING`
- RELEASE_TAG=`PENDING`
- GITHUB_RELEASE=`PENDING`
- MIGRATIONS=`NO`
- CONTENT_SYNC=`NO`
- G6=`NO`
- SUPABASE_REMOTE_CHANGE=`NO`

Esta seccion prepara metadata candidata. No declara v0.12.0 desplegada, publicada, cerrada ni promovida a produccion.
