---
id: OPS-RUNBOOK
name: runbook
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: runbook
modules: [platform, auth, data]
tags: [runbook, operacion, soporte]
related:
  - ARCH-SYSTEM-OVERVIEW
  - COMP-SECURITY-GUARDRAILS
last_reviewed: 2026-05-01
---

# Runbook operativo

## Objetivo
Tener una guía mínima para operar, validar y recuperar contexto del repositorio sin depender de memoria informal.

## Verificaciones básicas
1. Confirmar estado de dependencias del proyecto.
2. Confirmar integridad del árbol documental crítico.
3. Revisar migraciones de Supabase pendientes o recientes.
4. Validar que cambios estructurales tengan ADR asociado.
5. Confirmar que `~/.openclaw/product` y el estado publicado en GitHub sean la referencia antes de tocar deploy.
6. Si se requiere acceso remoto autenticado a GitHub, aplicar `docs/05-ops/github-authentication-runbook.md` antes de tocar `origin` o credenciales.

## Antes de desarrollar
- Leer contexto mínimo obligatorio.
- Revisar deuda e issues del módulo.
- Confirmar si el cambio requiere aprobación humana.

## Antes de integrar cambios
- Ejecutar `python3 scripts/validate_docs.py`
- Ejecutar `python3 scripts/build_context_index.py`
- Revisar cambios relevantes en `docs/02-delivery/change-log.md`

## Operación del banco de preguntas
- Runbook específico: `docs/05-ops/question-bank-load-runbook.md`
- Validación local del corpus actual: `npm run content:validate`
- Auditoría de todo `content/items`, incluyendo legados: `npm run content:validate:all`
- Importación controlada del corpus actual: `npm run content:import:current`

## Incidentes operativos comunes
- divergencia entre documentación y código
- migración sin decisión estructural clara
- cambio sensible sin evidencia de aprobación
- workaround sin deuda registrada

## Respuesta mínima
- detener propagación del cambio
- registrar incidente o issue
- vincular ADR o deuda si aplica
- escalar a aprobación humana cuando corresponda

## Regla de oro product / deploy
- `~/.openclaw/product` = desarrollo, QA, commits y push
- GitHub = fuente oficial compartida
- `/opt/gcm/app` = árbol de deploy en VPS
- `/opt/gcm/app` no se usa como fuente principal de desarrollo
- ningún fix debe quedar persistente solo en VPS

## Checklist operativo estándar
Checklist corto de referencia: `docs/05-ops/deploy-checklist.md`
Runbook de rollback: `docs/05-ops/rollback-runbook.md`


### Antes de codificar
1. confirmar que el trabajo ocurre en `~/.openclaw/product`
2. confirmar branch/estado git limpio o intencional
3. leer contexto mínimo requerido

### Antes de push
1. ejecutar validaciones relevantes
2. revisar diff
3. commit en `~/.openclaw/product`
4. push a GitHub
5. confirmar que `git remote -v` no contiene tokens ni credenciales embebidas

### Antes de deploy
1. confirmar que GitHub ya contiene el cambio correcto
2. sincronizar `/opt/gcm/app` desde Git
3. construir con metadata de build
4. levantar/recrear servicio

### Después de deploy
1. abrir `/login`
2. verificar `Commit desplegado`
3. verificar `Build time`
4. correr `npm run qa:smoke:postdeploy` contra el runtime objetivo
5. si el cambio tocó auth, onboarding, sesiones o dashboard, correr además la E2E aplicable
6. confirmar que producción coincide con el commit esperado
7. confirmar explícitamente la triple coincidencia: `product` = `/opt/gcm/app` = runtime visible en `/login`
8. si falla una QA UI, separar primero si el bloqueo es de host, de datos o de contrato funcional del formulario antes de tocar backend
9. si `master` quedó ahead luego del cierre por commits documentales, registrar por separado cuál fue el último commit triple-verificado y no reportar el HEAD como deploy válido sin nueva verificación


## Procedimiento estándar de deploy

### Contrato
- todo cambio nace en `~/.openclaw/product`
- el árbol `/opt/gcm/app` se actualiza desde Git
- todo build Docker debe recibir `APP_COMMIT` y `APP_BUILD_TIME`
- si falta uno de esos valores, el build debe fallar
- la UI debe exponer ambos en login/footer para verificación manual rápida

### Secuencia oficial
```bash
cd ~/.openclaw/product
# editar, validar, commit, push

git -C /opt/gcm/app fetch origin
git -C /opt/gcm/app checkout master
git -C /opt/gcm/app reset --hard origin/master

APP_COMMIT=$(git -C /opt/gcm/app rev-parse --short HEAD)
APP_BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
docker compose -f /opt/gcm/docker-compose.yml build \
  --build-arg APP_COMMIT="$APP_COMMIT" \
  --build-arg APP_BUILD_TIME="$APP_BUILD_TIME" \
  gcm-app

docker compose -f /opt/gcm/docker-compose.yml up -d gcm-app
```

### Verificación manual mínima
1. abrir `/login`
2. confirmar que `Commit desplegado` coincide con `git -C /opt/gcm/app rev-parse --short HEAD`
3. confirmar que `Build time` está visible y no vacío
4. confirmar en layout/footer que no aparece `not-set`
5. confirmar también que `git -C ~/.openclaw/product rev-parse --short HEAD` coincide con ambos si el deploy pretende reflejar lo último canónico
6. si hay divergencia entre árbol deploy y runtime visible, el contenedor debe reconstruirse/recrearse; no dar el deploy por cerrado
7. si `~/.openclaw/product` quedó más adelante solo por documentación local, dejar explícito que el último cierre de runtime sigue anclado al commit visible en `/login`
8. si hay divergencia, corregir en `~/.openclaw/product`, no directamente en VPS
9. cuando el onboarding exija campos obligatorios nuevos, actualizar también la QA UI versionada para evitar drift entre test y regla funcional

## Matriz corta de validación
- deploy/redeploy simple: `qa:smoke:postdeploy`
- cambio backend de dashboard/sesión: `qa:smoke:postdeploy` + `qa:e2e:api`
- cambio frontend de onboarding/practice/dashboard: `qa:smoke:postdeploy` + `qa:e2e:ui`
- cambio transversal auth + dashboard + UI: correr los tres

## Vacíos
- TODO: owners operativos por tipo de incidente
