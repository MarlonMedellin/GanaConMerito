# Manual Rollback Runbook — Sprint 33

## Objetivo
Definir un procedimiento manual, verificable y seguro para regresar el runtime de GanaConMerito a un commit estable cuando un release rompe una capacidad critica del MVP.

## Estado

- Sprint: 33.18
- Rol lider: PM-DevOps
- Estado: PROPOSED
- Runtime validado: no
- Automatizacion: pendiente
- Alcance: rollback manual sobre repo sincronizado, arbol de deploy y Docker

## Fuente canonica

```text
https://github.com/MarlonMedellin/GanaConMerito
```

## Topologia operativa esperada

| Capa | Ruta / superficie | Rol |
|---|---|---|
| Repo remoto | GitHub `master` | fuente de verdad |
| Copia sincronizada | `~/.openclaw/product` | copia operativa de trabajo |
| Arbol deploy | `/opt/gcm/app` | runtime deployable |
| Env persistente | `/opt/gcm/env/gcm-app.env` | variables de entorno |
| Runtime publico | `https://ganaconmerito.com` | validacion usuario |

## Condiciones de rollback inmediato

Ejecutar rollback review si ocurre cualquiera de estos eventos:

- `/login` no responde o no permite inicio de sesion legitimo;
- `/practice` queda inaccesible para usuario autenticado;
- `/dashboard` queda roto;
- rutas privadas quedan expuestas sin sesion;
- `session advance` falla o duplica estado de forma critica;
- Tutor GCM revela respuestas antes de que el usuario responda;
- errores 5xx masivos o sostenidos;
- metadata runtime no coincide con el commit esperado;
- build Docker inconsistente;
- `/api/health` retorna `down` o 503 cuando exista.

## Datos requeridos antes de iniciar

Antes de ejecutar rollback, registrar:

```text
Incident ID:
Fecha/hora:
Release SHA actual:
Stable SHA candidato:
Motivo de rollback:
Persona/agente responsable:
Runtime afectado:
Evidencia:
```

## Paso 0 — Confirmar que rollback es necesario

Validaciones minimas:

```bash
curl -I https://ganaconmerito.com/login
curl -I https://ganaconmerito.com/practice
curl -I https://ganaconmerito.com/dashboard
```

Cuando exista healthcheck semantico:

```bash
curl -fsS https://ganaconmerito.com/api/auth/public-config >/dev/null
```

Si el problema es solo cosmetico o documental, preferir hotfix por PR y no rollback.

## Paso 1 — Identificar ultimo commit estable

Fuentes aceptadas:

1. ultimo release documentado en `docs/project/status.md`;
2. ultimo runtime con QA PASS/WARN aceptado;
3. ultimo PR mergeado sin incidente;
4. commit indicado por el responsable humano.

Ejemplo:

```bash
STABLE_SHA=<stable_sha>
```

## Paso 2 — Actualizar copia sincronizada

```bash
cd ~/.openclaw/product
git fetch origin
git checkout master
git reset --hard "$STABLE_SHA"
```

Verificar:

```bash
git rev-parse HEAD
git status --short
```

Resultado esperado:

- HEAD igual a `STABLE_SHA`;
- worktree limpio.

## Paso 3 — Sincronizar arbol de deploy

Desde la copia sincronizada hacia deploy:

```bash
rsync -a --delete \
  --exclude .git \
  --exclude node_modules \
  --exclude .next \
  ~/.openclaw/product/ /opt/gcm/app/
```

Verificar:

```bash
cd /opt/gcm/app
git rev-parse HEAD 2>/dev/null || true
ls -la
```

Nota:
- si `/opt/gcm/app` no conserva `.git`, la verificacion debe hacerse por metadata de build despues del rebuild.

## Paso 4 — Reconstruir Docker

```bash
cd /opt/gcm/app
docker compose --env-file /opt/gcm/env/gcm-app.env up -d --build
```

Verificar contenedores:

```bash
docker compose ps
docker compose logs --tail=100
```

## Paso 5 — Validar runtime publico

Validar rutas minimas:

```bash
curl -I https://ganaconmerito.com/login
curl -I https://ganaconmerito.com/practice
curl -I https://ganaconmerito.com/dashboard
```

Validar proteccion de rutas privadas sin sesion:

```bash
curl -I https://ganaconmerito.com/practice
curl -I https://ganaconmerito.com/dashboard
```

Resultado esperado:
- `/login` responde;
- `/practice` y `/dashboard` sin sesion redirigen a login o no exponen contenido privado;
- no hay 5xx sostenido.

## Paso 6 — Validar metadata de build

Abrir o consultar `/login` y confirmar:

- commit hash igual a `STABLE_SHA` o su short hash;
- build time actualizado;
- version esperada.

Si metadata no coincide:
- no cerrar rollback;
- revisar Docker cache;
- reconstruir sin cache si aplica.

## Paso 7 — Registrar resultado

Actualizar documentacion viva o incidente con:

```text
Rollback ejecutado: si/no
Stable SHA aplicado:
Runtime commit observado:
Build time observado:
Validaciones PASS/WARN/FAIL:
Riesgo residual:
Proximo paso:
```

Archivos recomendados:
- `docs/project/status.md`
- `docs/02-delivery/sprint-log.md`
- `docs/02-delivery/change-log.md`

## Rollback fallido

Si el rollback no restaura servicio:

1. mantener sitio en estado seguro;
2. no continuar con cambios aleatorios en deploy;
3. revisar logs Docker;
4. confirmar variables en `/opt/gcm/env/gcm-app.env`;
5. escalar a investigacion AppSec/DevOps;
6. documentar `blocked`.

## Comandos de diagnostico

```bash
docker compose ps
docker compose logs --tail=200
docker images | head
docker system df
```

```bash
curl -v https://ganaconmerito.com/login
curl -v https://ganaconmerito.com/api/auth/public-config
```

## Guardrails

No hacer:

- editar directamente en `/opt/gcm/app` como fuente de verdad;
- corregir primero en VPS sin PR posterior;
- exponer secretos en logs o documentos;
- declarar PASS si no se valido runtime;
- resetear `master` remoto sin aprobacion humana explicita.

## Criterios de cierre del rollback

Rollback puede cerrarse solo si:

- runtime responde;
- metadata muestra SHA esperado;
- rutas privadas siguen protegidas;
- flujo principal minimo vuelve a estado aceptable;
- incidente queda documentado;
- se abre issue o PR para corregir la causa raiz.

## Relacion con SLO/SI

Si un SLO P0 falla repetidamente despues del rollback:

- mantener freeze de expansion funcional;
- priorizar RCA;
- no cerrar Sprint 33 como estable.

## Definition of Done Sprint 33.18

- runbook manual creado;
- condiciones de rollback definidas;
- pasos de source, deploy y Docker documentados;
- validacion runtime documentada;
- criterios de cierre y fallos definidos;
- automatizacion queda pendiente para sprint posterior.

## Siguiente sprint pequeno

Sprint 33.19 — gobernanza de migraciones Supabase en `docs/03-architecture/supabase-migration-governance.md`.
