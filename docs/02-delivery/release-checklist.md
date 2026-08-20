# Checklist de Release — GanaConMerito

Este documento define los pasos obligatorios para considerar un release como exitoso, trazable y operativamente verificable.

## Snapshot beta candidata 0.6.0
- Fecha de homologacion documental: 2026-08-20.
- Commit de codigo release verificado: `9695d40`.
- HEAD documental actual: `271712f` (cambios de documentacion posteriores, sin cambios de codigo).
- Runtime publico verificado: `9695d40` (`2026-08-19T00:00:00-05:00`).
- Estado: beta candidata con gates locales y QA postdeploy fresco PASS; checklist cerrado con deuda editorial explicita.
- Supabase: migraciones `0013`-`0017` aplicadas; 100 preguntas visibles en `v_item_bank_active`.
- Release creado: `v0.6.0-beta.1` sobre `9695d40`.

## 1. Validación Pre-Release (fuente canónica)
- [x] Commit objetivo de codigo definido y registrado: `9695d40`; HEAD documental `271712f`.
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
- [x] **Source de codigo**: `9695d40` verificado; HEAD documental `271712f` contiene solo documentación.
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
- [x] Diferenciar explícitamente entre release de codigo (`9695d40`), HEAD documental (`271712f`) y runtime.
- [x] Tag/release `v0.6.0-beta.1` creado y publicado sobre `9695d40`.
- [x] Checklist Beta cerrado para la candidata; queda como riesgo abierto únicamente la deuda editorial de metadata rica.
