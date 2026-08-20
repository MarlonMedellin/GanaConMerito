# Checklist de Release — GanaConMerito

Este documento define los pasos obligatorios para considerar un release como exitoso, trazable y operativamente verificable.

## Snapshot beta candidata 0.6.0
- Fecha de homologacion documental: 2026-08-19.
- HEAD actual revisado: `b0207e9`.
- Ultimo runtime publico verificado: `ad6ad35` (`2026-08-19T04:20:00Z`).
- Estado: beta candidata con E2E real PASS, no release cerrado por falta de paridad.
- Supabase: migraciones `0013`-`0017` aplicadas; 100 preguntas visibles en `v_item_bank_active`.
- Proximo release sugerido: `v0.6.0-beta.1` despues de triple verificacion y QA runtime fresco.

## 1. Validación Pre-Release (fuente canónica)
- [ ] Commit objetivo definido y registrado: pendiente; candidato actual `b0207e9`.
- [x] Evidencia funcional real registrada sobre runtime `ad6ad35`: 5 turnos, cierre y dashboard.
- [ ] Trabajo realizado en `/home/ubuntu/.openclaw/product`, no en `/opt/gcm/app`.
- [ ] `git status --short --branch` entendido y bajo control.
- [x] `npm run content:validate` verde en la corrida de esta revision.
- [x] `npm run lint`/typecheck verde.
- [x] `npm run build` verde.
- [x] Suite unitaria relevante verde.
- [ ] Registrar artifacts formales de cada gate en esta revision.
- [ ] Si hubo cambios documentales críticos: `python3 scripts/validate_docs.py` y `python3 scripts/build_context_index.py`.
- [ ] Documentación actualizada sin afirmar como “hecho” nada sin evidencia de runtime.

## 2. Proceso de Deploy
- [ ] Push a `master` con el commit exacto que se quiere ver en runtime.
- [ ] Sincronizar `/opt/gcm/app` desde Git; no editar deploy tree a mano.
- [ ] Confirmar que el HEAD en `/opt/gcm/app` coincide con el commit objetivo.
- [ ] Rebuild/recreate pasando metadata obligatoria:
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
- [ ] **Source**: actualmente `ad6ad35`; debe alinearse al commit objetivo `b0207e9`.
- [ ] **Deploy tree**: actualmente `ad6ad35`; debe alinearse al commit objetivo `b0207e9`.
- [ ] **Runtime visible**: actualmente muestra `ad6ad35`; debe mostrar el commit objetivo.
- [x] **BuildTime visible**: `2026-08-19T04:20:00Z`.
- [ ] Si una de las 4 comprobaciones falla, el release no se considera cerrado.

## 4. Gates QA Postdeploy (runtime `:3000`)
- [x] Smoke local: `/opt/gcm/app/artifacts/qa-smoke-postdeploy-smoke-mt0wd760-p8yke7`.
- [x] Smoke publico: `/opt/gcm/app/artifacts/qa-smoke-postdeploy-smoke-mt0wkf4t-vycjn4`.
- [x] API E2E 5 turnos: `/opt/gcm/app/artifacts/qa-e2e-api-mt0wdtcq-1anjty` (`assertions.ok=true`).
- [x] UI Chromium 5 turnos: `/opt/gcm/app/artifacts/qa-ui-e2e-ui-mt0wfn7a-mh3n8i` (`assertions.ok=true`).
- [x] E2E Playwright autenticada manual: 5 turnos, sesión cerrada y dashboard verificado.
- [x] Artifact roots de smoke, API E2E y UI E2E registrados arriba.
- [ ] Si una corrida tarda anormalmente o depende de bootstrap host-specific, dejarlo explícito como riesgo operativo; no maquillarlo como verde limpio.

## 5. Cierre documental
- [ ] Actualizar `docs/project/status.md`, `docs/02-delivery/sprint-log.md` y `docs/02-delivery/change-log.md`.
- [ ] Actualizar `docs/01-product/backlog.md`, `docs/05-ops/runtime-and-release.md`, `docs/04-quality/known-issues.md` y `docs/04-quality/technical-debt-register.md` si cambia estado beta, runtime, QA o deuda.
- [x] Diferenciar explícitamente entre HEAD actual del repo (`b0207e9`) y último runtime verificado (`ad6ad35`).
- [ ] Registrar tag/release creado, o dejar explicitamente pendiente `v0.6.0-beta.1`.
- [ ] No marcar sprint/release como cerrado mientras falte un gate obligatorio o no exista owner claro del bloqueo.
