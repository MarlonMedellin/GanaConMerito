# Checklist de Release — GanaConMerito

Este documento define los pasos obligatorios para considerar un release como exitoso, trazable y operativamente verificable.

Política canónica de versionado visible:
`docs/02-delivery/versioning-and-releases.md`.

Antes de release, Canary, producción o hotfix, registrar `CURRENT_APP_VERSION`,
`CURRENT_RELEASE_DATE` y `CANDIDATE_SHA`. Después de merge, registrar
`FINAL_RELEASE_SHA`. Después de deploy, verificar visualmente `ReleaseStamp`.

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

### Alcance
- Release MINOR compatible `v0.11.0` para los cambios de dashboard ya integrados
  y validados por PR #123.
- Incluye UX/copy visible y cambio compatible de comportamiento de producto en el
  alcance temporal de la métrica de fortaleza cuando existe `sessionId`.
- No existen breaking changes.
- No Supabase product/schema/content changes, no migrations, no V4.1 changes, no
  Knowledge Base changes, no targeting changes, no Tutor contract changes.
- `VISIBLE_TUTOR_EXPECTED=true`.
- `VISIBLE_OPENROUTER_LLM=false`.

### Evidencia de Canary y producción
- [x] PR #124 fusionado y `FINAL_RELEASE_SHA` registrado.
- [x] Canary desplegado sobre el SHA exacto.
- [x] ReleaseStamp Canary PASS.
- [x] Public smoke Canary PASS.
- [x] Postdeploy smoke Canary PASS.
- [x] V4 active count `248`.
- [x] Mutación del postdeploy clasificada como `EXPECTED_QA_ONLY` bajo namespace
  `gcm-e2e`; sin mutación Supabase de producto, schema o contenido.
- [x] Producción promovida reutilizando el runtime Canary validado, sin rebuild.
- [x] `nginx -t` PASS antes del reload.
- [x] ReleaseStamp producción PASS.
- [x] Public runtime smoke producción PASS.
- [x] Smoke autenticado manual con Google real PASS.
- [x] Dashboard producción PASS en desktop y mobile.
- [x] Tutor visible PASS.
- [x] OpenRouter visible LLM permanece false.
- [x] Runtime productivo anterior `v0.10.0` preservado en `:3002`.
- [x] Runtime previo adicional preservado en `:3005`.
- [x] No migrations, no Content Sync, no G6 durante promoción.
- [x] Tag `v0.11.0` publicado sobre `FINAL_RELEASE_SHA`.
- [x] GitHub Release `v0.11.0` publicada.
- [ ] Cleanup de runtimes antiguos reservado a gate separado.

### Cierre documental
- [x] Cierre operacional registrado en
  `docs/05-ops/V0.11.0-PRODUCTION-CLOSEOUT-20260830.md`.
- [x] Política de versionado alineada con runtime productivo `v0.11.0`.
- [x] No se afirma que el commit documental posterior sea el release SHA; el tag
  debe apuntar al runtime desplegado `e3e9b3436f57a0354c7fed941140df468499d624`.
- [x] Tag y GitHub Release verificados sobre
  `e3e9b3436f57a0354c7fed941140df468499d624`.

## v0.10.0 / V4.1 production closeout
- VERSION=0.10.0
- RELEASE_DATE=2026-08-30
- FINAL_RELEASE_SHA=fc0f9e62ca798a25f84d2c4dd8cfe76ca4040a01
- PUBLIC_RUNTIME=https://ganaconmerito.com
- PUBLIC_RUNTIME_SHA=fc0f9e62ca798a25f84d2c4dd8cfe76ca4040a01
- Release tag: `v0.10.0`
- GitHub Release: published

### Evidencia de cierre
- Content Sync: APPLIED_AND_VERIFIED.
- G6: GREEN_CANDIDATE.
- CAN-004: GREEN.
- Canary deploy: GREEN.
- Production promotion: GREEN.
- ReleaseStamp: PASS.
- Public smoke: PASS.
- Authenticated smoke: NOT_AVAILABLE.
- V4 active count: 248.
- User exposure: true.
- Supabase mutation during promotion: false.
- Previous runtime preserved: true; rollback available at promotion close.
- Candidate Supabase: `dhiytzbwodfvdrnwhkcw`.

### Cierre operacional
- [x] Release merge registrado en `fc0f9e62ca798a25f84d2c4dd8cfe76ca4040a01`.
- [x] Runtime publico verificado en el mismo SHA.
- [x] Tag `v0.10.0` publicado sobre el `FINAL_RELEASE_SHA`.
- [x] GitHub Release publicado.
- [x] Cierre documental registrado en `docs/05-ops/V0.10.0-PRODUCTION-CLOSEOUT-20260830.md`.
- [x] No se ejecutaron nuevas migraciones ni mutaciones Supabase durante la promocion.
- [x] No se afirma E2E autenticada: `authenticated_smoke=NOT_AVAILABLE`.

## Snapshot beta candidata 0.6.0
- Fecha de homologacion documental: 2026-08-20.
- Commit de codigo release verificado: `9695d40`.
- HEAD documental: commits posteriores al release, sin cambios de codigo.
- Runtime publico verificado: `9695d40` (`2026-08-19T00:00:00-05:00`).
- Estado: beta candidata con gates locales y QA postdeploy fresco PASS; checklist cerrado con deuda editorial explicita.
- Supabase: migraciones `0013`-`0017` aplicadas; 100 preguntas visibles en `v_item_bank_active`.
- Release creado: `v0.6.0-beta.1` sobre `9695d40`.

## 1. Validación Pre-Release (fuente canónica)
- [x] Commit objetivo de codigo definido y registrado: `9695d40`; la documentación posterior no cambia el código.
- [x] Evidencia funcional real registrada sobre runtime `9695d40`: 5 turnos, cierre y dashboard.
- [x] Trabajo de sincronizacion realizado en `/home/ubuntu/.openclaw/product`; `/opt/gcm/app` actualizado desde Git.
- [x] `git status --short --branch` bajo control: `master` alineado con `origin/master`, sin cambios pendientes al cierre.
- [x] `npm run content:validate` verde en la corrida de esta revision.
- [x] `npm run lint`/typecheck verde.
- [x] `npm run build` verde.
- [x] Suite unitaria relevante verde.
- [x] Registrar artifacts formales de cada gate en esta revision.
- [x] Cambios documentales críticos validados con `python3 scripts/validate_docs.py` y `python3 scripts/build_context_index.py`.
- [x] Documentación actualizada diferenciando evidencia de runtime y deuda pendiente.

## 2. Proceso de Deploy
- [x] Push a `master` con `9695d40`; los commits posteriores son documentales.
- [x] Sincronizar `/opt/gcm/app` desde Git; no se editó deploy tree a mano.
- [x] HEAD en `/opt/gcm/app` coincide con `9695d40`.
- [x] Rebuild/recreate pasando metadata obligatoria:
  ```bash
  APP_COMMIT=$(git -C /opt/gcm/app rev-parse --short HEAD)
  APP_BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  docker compose -f /opt/gcm/docker-compose.yml build \
    --build-arg APP_COMMIT="$APP_COMMIT" \
    --build-arg APP_BUILD_TIME="$APP_BUILD_TIME" \
    gcm-app
  docker compose -f /opt/gcm/docker-compose.yml up -d gcm-app
  ```

## 3. Triple Verificación (obligatoria)
- [x] **Source de codigo**: `9695d40` verificado; los commits posteriores contienen solo documentación.
- [x] **Deploy tree**: `/opt/gcm/app` en `9695d40`.
- [x] **Runtime visible**: `https://cnsc.profemarlon.com` muestra `9695d40`.
- [x] **BuildTime visible**: `2026-08-19T00:00:00-05:00`.
- [x] Las cuatro comprobaciones del release de codigo tienen evidencia; la diferencia documental queda registrada y no afecta el binario desplegado.

## 4. Gates QA Postdeploy (runtime `:3000`)
- [x] Smoke publico fresco: `/opt/gcm/app/artifacts/qa-smoke-postdeploy-smoke-mt0xrhmp-mzt8se` (`ok=true`).
- [x] API E2E fresco de 5 turnos: `/opt/gcm/app/artifacts/qa-e2e-api-mt0xs2k0-m767ff` (`assertions=passed`).
- [x] UI Chromium fresco de 5 turnos: `/opt/gcm/app/artifacts/qa-ui-e2e-ui-mt0xtcsa-u279gx` (`assertions=passed`).
- [x] Gates históricos previos conservados en los artifacts registrados en Git.
- [x] E2E Playwright autenticada manual: 5 turnos, sesión cerrada y dashboard verificado.
- [x] Artifact roots de smoke, API E2E y UI E2E registrados arriba.
- [x] Riesgo operativo registrado: QA UI/API depende de bootstrap Supabase/Playwright del host y puede tardar varios minutos; se conserva como PASS con artifacts, no como ejecución instantánea.

## 5. Cierre documental
- [x] Actualizar `docs/project/status.md`, `docs/02-delivery/sprint-log.md` y `docs/02-delivery/change-log.md`.
- [x] Actualizar `docs/01-product/backlog.md`, `docs/05-ops/runtime-and-release.md`, `docs/04-quality/known-issues.md` y `docs/04-quality/technical-debt-register.md` cuando cambia estado beta, runtime, QA o deuda; los cambios documentales están trazados en commits previos.
- [x] Diferenciar explícitamente entre release de codigo (`9695d40`), documentación posterior y runtime.
- [x] Tag/release `v0.6.0-beta.1` creado y publicado sobre `9695d40`.
- [x] Checklist Beta cerrado para la candidata; queda como riesgo abierto únicamente la deuda editorial de metadata rica.
