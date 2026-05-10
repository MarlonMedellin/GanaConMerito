Status: superseded
Replaced by: docs/project/status.md
Canonical reference: docs/project/status.md; docs/02-delivery/sprint-log.md
Do not use for: estado ejecutivo vigente, cierre de sprint actual, claims de runtime
Last reviewed: 2026-05-10

## Legacy authority context
- Este documento ya NO es fuente ejecutiva porque refleja un checklist táctico de Sprint 33.
- Para estado operativo vigente consultar `docs/project/status.md`.
- Sigue siendo útil como evidencia histórica del proceso de post-merge de Sprint 33.
---

# Sprint 33 Post-Merge Checklist

## Objetivo
Definir los pasos obligatorios despues de mergear cambios de Sprint 33 hacia `master`, incluyendo sincronizacion, deploy, validacion runtime y cierre documental.

## Estado

- Sprint: 33.26
- Rol lider: PM-Release
- Estado: PROPOSED
- Runtime validado: no
- Tipo: checklist post-merge
- Alcance: GitHub, copia sincronizada, deploy, Docker, runtime y documentacion viva

## Principio operativo

Todo cambio estable debe seguir la cadena:

```text
PR -> master -> ~/.openclaw/product -> /opt/gcm/app -> Docker -> Runtime validation
```

No se debe declarar cierre operativo si una capa queda sin sincronizar o verificar.

## Checklist 1 — Confirmacion del merge

- [ ] PR aprobado y mergeado a `master`.
- [ ] Commit merge o head commit identificado.
- [ ] No quedan conflictos abiertos.
- [ ] PR no queda en estado draft.
- [ ] CI minimo revisado.
- [ ] Riesgos abiertos documentados en PR.

Datos a registrar:

```text
PR:
Merge SHA:
Fecha/hora:
Responsable:
Riesgos abiertos:
```

## Checklist 2 — Actualizar copia sincronizada

En VPS o entorno autorizado:

```bash
cd ~/.openclaw/product
git fetch origin
git checkout master
git pull --ff-only origin master
```

Verificar:

```bash
git rev-parse HEAD
git status --short
```

Criterio:

- [ ] HEAD coincide con `master` remoto esperado.
- [ ] Worktree limpio.
- [ ] No hay cambios locales sin commit.

## Checklist 3 — Sincronizar arbol de deploy

Sincronizar desde fuente local hacia deploy:

```bash
rsync -a --delete \
  --exclude .git \
  --exclude node_modules \
  --exclude .next \
  ~/.openclaw/product/ /opt/gcm/app/
```

Verificar:

```bash
ls -la /opt/gcm/app
```

Criterio:

- [ ] `/opt/gcm/app` contiene los archivos esperados.
- [ ] No se edito directamente en deploy.
- [ ] El archivo de entorno persistente sigue en `/opt/gcm/env/gcm-app.env`.

## Checklist 4 — Rebuild/restart Docker

```bash
cd /opt/gcm/app
docker compose --env-file /opt/gcm/env/gcm-app.env up -d --build
```

Verificar:

```bash
docker compose ps
docker compose logs --tail=100
```

Criterio:

- [ ] Contenedor principal arriba.
- [ ] No hay errores fatales en logs recientes.
- [ ] Build completo sin fallo.
- [ ] No se expusieron secretos en logs.

## Checklist 5 — Validacion runtime publica

Rutas minimas:

```bash
curl -I https://cnsc.profemarlon.com/login
curl -I https://cnsc.profemarlon.com/practice
curl -I https://cnsc.profemarlon.com/dashboard
```

Criterios:

- [ ] `/login` responde.
- [ ] `/practice` sin sesion redirige o protege.
- [ ] `/dashboard` sin sesion redirige o protege.
- [ ] No hay 5xx sostenido.

Cuando exista healthcheck semantico:

```bash
curl -fsS https://cnsc.profemarlon.com/api/health
```

- [ ] `/api/health` retorna `ok` o `degraded` aceptado.
- [ ] No retorna `down` para checks P0.

## Checklist 6 — Metadata de build

Verificar en `/login` o superficie equivalente:

- [ ] commit hash visible.
- [ ] build time visible.
- [ ] version visible o inferible.
- [ ] commit runtime coincide con SHA esperado o merge SHA.

Datos a registrar:

```text
Runtime commit observado:
Build time observado:
Version observada:
URL:
```

## Checklist 7 — QA post-merge

### Gate A minimo
- [ ] login responde.
- [ ] rutas privadas protegidas.
- [ ] app arranca sin 5xx.

### Gate B si hay entorno disponible
- [ ] practice smoke autenticado.
- [ ] session advance operativo.
- [ ] dashboard operativo.
- [ ] tutor guardrails operativos.

### Gate C forensic si aplica
- [ ] Playwright completo.
- [ ] screenshots/artifacts sanitizados.
- [ ] reporte E2E guardado.

## Checklist 8 — Seguridad post-merge

- [ ] no hay secretos nuevos en repo.
- [ ] `.env` no fue commiteado.
- [ ] logs no muestran tokens/cookies/secrets.
- [ ] callback auth funciona en dominio canonico.
- [ ] rutas privadas siguen protegidas.
- [ ] content/admin no queda expuesto accidentalmente.

## Checklist 9 — Datos y migraciones

Si el PR incluye migraciones:

- [ ] migraciones aplicadas en orden esperado.
- [ ] no hay prefijos duplicados nuevos.
- [ ] Supabase refleja objetos esperados.
- [ ] rollback o forward-fix documentado.
- [ ] funciones criticas probadas o verificadas.

Si no incluye migraciones:

- [ ] registrar que no hubo cambios DB.

## Checklist 10 — Cierre documental

Actualizar si corresponde:

- [ ] `docs/project/status.md`.
- [ ] `docs/02-delivery/sprint-log.md`.
- [ ] `docs/02-delivery/change-log.md`.
- [ ] backlog o matriz de deuda si se cierra item.
- [ ] PR con evidencia de runtime.

## Criterios de rollback post-merge

Activar rollback review si:

- `/login` falla;
- rutas privadas quedan publicas;
- `practice` o `dashboard` fallan con 5xx;
- metadata runtime no coincide;
- session advance falla de forma critica;
- Tutor GCM rompe guardrails;
- healthcheck P0 retorna `down`.

Runbook relacionado:

```text
docs/05-ops/manual-rollback-runbook.md
```

## Evidencia minima de cierre

Al cerrar post-merge, registrar:

```text
PR:
Merge SHA:
Runtime SHA:
Build time:
Gate A:
Gate B:
Gate C:
Rollback requerido: si/no
Riesgos abiertos:
Decision final:
```

## Definition of Done Sprint 33.26

- checklist post-merge creado;
- sincronizacion repo/VPS/deploy documentada;
- validacion Docker/runtime documentada;
- metadata y QA post-merge definidos;
- criterios de rollback incluidos;
- ejecucion real queda pendiente hasta merge y entorno activo.

## Siguiente sprint pequeno

Sprint 33.27 — formalizar freeze de expansion funcional en `docs/01-product/feature-freeze-sprint-33.md`.
