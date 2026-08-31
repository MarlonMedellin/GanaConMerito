# Checklist de Release — GanaConMerito

Este documento define los pasos obligatorios para considerar un release como exitoso, trazable y operativamente verificable.

Política canónica de versionado visible:
`docs/02-delivery/versioning-and-releases.md`.

Antes de release, Canary, producción o hotfix, registrar `CURRENT_APP_VERSION`,
`CURRENT_RELEASE_DATE` y `CANDIDATE_SHA`. Después de merge, registrar
`FINAL_RELEASE_SHA`. Después de deploy, verificar visualmente `ReleaseStamp`.

## v0.11.0 / dashboard update release preparation
- VERSION=0.11.0
- RELEASE_DATE=2026-08-30
- RELEASE_STATUS=RELEASE_PREPARATION
- RELEASE_CLASSIFICATION=MINOR
- CANDIDATE_SHA=662c175b4b1288e1a7003e4b2139435e8a470183
- FINAL_RELEASE_SHA=PENDING
- CANARY=NOT_STARTED
- PRODUCTION_VERSION=0.10.0
- PRODUCTION_RUNTIME_SHA=fc0f9e62ca798a25f84d2c4dd8cfe76ca4040a01
- Runtime verified: no.
- Deploy performed: no.
- User exposure adicional: no.

### Alcance
- Release metadata y documentación requerida para MINOR compatible `v0.11.0`.
- Cambios funcionales ya integrados y validados por PR #123.
- Incluye cambios visibles de UX/copy y cambio compatible de comportamiento de
  producto en el alcance temporal de la métrica de fortaleza cuando existe
  `sessionId`.
- No existen breaking changes.
- No Supabase changes, no migrations, no V4.1 changes, no Knowledge Base
  changes, no targeting changes, no Tutor contract changes.
- `VISIBLE_TUTOR_EXPECTED=true`.
- `VISIBLE_OPENROUTER_LLM=false`.

### Gates locales de esta preparación
- [x] `git diff --check`.
- [x] `npm run check:doc-triggers`.
- [x] `npm exec -- tsx --test src/lib/app-version.test.ts scripts/prepare-build-metadata.test.ts`.
- [ ] GitHub PR CI pendiente.
- [ ] Merge reservado a ChatGPT web después de GREEN.

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
