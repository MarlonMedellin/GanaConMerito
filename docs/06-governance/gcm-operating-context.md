---
id: GOV-GCM-OPERATING-CONTEXT
name: gcm-operating-context
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: governance
modules: [governance, release, runtime]
tags: [operacion, runtime, release, source-of-truth]
related:
  - PROJ-STATUS
  - DEL-SPRINT-LOG
  - DEL-CHANGE-LOG
last_reviewed: 2026-05-06
---

# GCM operating context

## Contexto ejecutivo base

GanaConMerito es un producto web educativo construido sobre:
- Next.js
- React
- TypeScript
- Supabase
- Docker

El core real ya existe y funciona sobre estas superficies activas:
- login
- onboarding
- practica
- dashboard

El proyecto no debe tratarse como MVP temprano. La prioridad operativa es madurez de producto, disciplina de release, alineacion entre fuentes de codigo, deploy y runtime visible, y avance controlado del frente de asistentes.

## Fuente de verdad y modelo de edicion

La fuente de verdad del producto es el repositorio remoto principal:
- `https://github.com/ProfeMarlonMDE/GanaConMerito`

Ese repositorio puede ser editado desde varios origenes de trabajo:
1. Google Antigravity, corriendo desde un WSL en un PC.
2. El agente Gauss desde ChatGPT.
3. Un Codex conectado desde el perfil dueno del repo `https://github.com/ProfeMarlonMDE`.
4. Un Codex conectado desde el perfil contributor `https://github.com/MarlonMedellin`.

Cada uno de esos entornos puede tener su propia carpeta local. Ninguna carpeta local es por si sola la fuente de verdad final si no esta alineada con el repo remoto principal.

## Regla operativa de promocion

Toda fuente de trabajo debe seguir esta secuencia:
1. hacer cambios en su entorno local o rama de trabajo
2. abrir Pull Request hacia `https://github.com/ProfeMarlonMDE/GanaConMerito`
3. integrar ese cambio en la rama `master` del repo principal
4. descargar o actualizar ese estado en `~/.openclaw/product`
5. alinear despues el deploy en `/opt/gcm/app`
6. actualizar, reconstruir, reiniciar o verificar Docker en el VPS OCI
7. validar el resultado final en `https://cnsc.profemarlon.com`

## Jerarquia de verdad operativa

Cuando haya conflicto entre senales, usar este orden:
1. repositorio remoto principal
2. documentacion canonica alineada
3. copia sincronizada en `~/.openclaw/product`
4. arbol de deploy `/opt/gcm/app`
5. runtime visible en `https://cnsc.profemarlon.com`

## Nota sobre hashes y ramas

Por el flujo con Pull Requests, puede ocurrir que el hash de `master` sea distinto al hash de una rama de sprint aunque el trabajo ya este promovido o parcialmente integrado.

Por eso:
- no asumir equivalencia de hashes entre `master` y ramas de sprint
- validar por PR integrado, diff real y runtime visible
- no declarar drift solo porque los hashes no coinciden entre ramas

## Infraestructura operativa

- repo remoto principal: `https://github.com/ProfeMarlonMDE/GanaConMerito`
- rama principal: `master`
- copia sincronizada en VPS: `~/.openclaw/product`
- arbol de deploy: `/opt/gcm/app`
- entorno persistente de deploy: `/opt/gcm/env/gcm-app.env`
- hosting operativo final: VPS en OCI
- runtime publico de validacion: `https://cnsc.profemarlon.com`

## Validacion obligatoria

Las pruebas relevantes deben correrse contra la URL publica cuando aplique:
- `https://cnsc.profemarlon.com`

Orden preferido cuando el cambio toque flujo real:
1. build
2. smoke
3. E2E
4. verificacion visible en runtime publico

No declarar cierre:
- solo porque compilo
- solo porque el PR fue merged
- solo porque `git status` esta limpio

## Estado historico confirmado

### Sprint 4
Quedo evidencia de:
- navegacion principal simplificada
- editorial o biblioteca fuera del nav principal del usuario
- hardening UX del core
- estados `LoadingState`, `EmptyState`, `ErrorState`
- mejoras en `home` y `practice`
- version declarada `0.5.0`

Commits de referencia:
- `304f950` = cambio funcional real de Sprint 4
- `ef13a4f` = cierre documental posterior

### Estado posterior
En la fuente hay evidencia de Sprint 13.

Por lo tanto, la continuidad de planeacion debe arrancar desde:
- Sprint 14
- Sprint 15
- Sprint 16

## Guardrails vigentes

1. no tratar una carpeta local aislada como fuente de verdad final
2. no desarrollar directamente sobre `/opt/gcm/app` como fuente principal
3. no cerrar trabajo sin pasar por PR hacia el repo principal
4. no cerrar release sin actualizar `~/.openclaw/product`, luego `/opt/gcm/app`, y finalmente Docker en el VPS OCI
5. no declarar exito sin validar en `https://cnsc.profemarlon.com`
6. no abrir Tutor GCM como chat libre dominante
7. no mover logica critica del sistema al LLM
8. no reabrir editorial como frente principal sin decision explicita
9. no usar diferencias de hash entre ramas como unica prueba de drift
