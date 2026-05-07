---
id: DEL-PARALLEL-SPRINT-BOARD-2026-05-06
name: parallel-sprint-board-2026-05-06
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: delivery
modules: [core, platform, qa, governance]
tags: [sprint, paralelo, agentes, hardening]
related:
  - PROD-BACKLOG
  - DEL-SPRINT-LOG
  - GOV-AGENT-ROSTER
last_reviewed: 2026-05-06
---

# Sprint board corto y paralelizable

## Nota de contexto

El repo documenta `Sprint 13` como último sprint cerrado con fecha `2026-05-04`.
Si el equipo humano decide seguir nombrando este frente como `Sprint 9` por razones operativas externas, debe aclararlo en el siguiente cierre para evitar drift entre conversación y repo.

## Objetivo del frente actual

Ejecutar un bloque corto de madurez operativa y fixes de alto impacto sin abrir arquitectura nueva ni desplazar lógica crítica al asistente.

## Guardrails del sprint

- no tocar migraciones o schema Supabase sin aprobación humana explícita
- no convertir Tutor GCM en chat libre
- no mover scoring, avance o cierre de sesión al asistente
- no mezclar refactor grande con bugfixes y docs en el mismo PR
- validar build y evidencia mínima antes de cerrar una lane

## Lane A — Runtime y release hardening

- prioridad: `P1`
- owner sugerido: `Dev Agent` + `QA Agent`
- foco: `lint`, smoke ligero de runtime visible y disciplina local reproducible
- alcance permitido:
  - scripts npm
  - workflow CI
  - smoke scripts livianos
  - documentación operativa de release
- definición de cierre:
  - `npm run lint` existe y pasa
  - existe smoke reproducible para `/login` y `/api/auth/public-config`
  - el gate queda documentado para uso local o postdeploy

## Lane B — Drift source/deploy/runtime

- prioridad: `P1`
- owner sugerido: `QA Agent` + `Doc Control Agent`
- foco: detectar divergencias entre repo, deploy y runtime visible
- alcance permitido:
  - checklist
  - evidencia de commit/buildTime visible
  - actualización de docs operativas
- definición de cierre:
  - tabla simple de verificación `source = deploy = runtime`
  - riesgos abiertos documentados

## Lane C — Core UX pequeño y seguro

- prioridad: `P2`
- owner sugerido: `Dev Agent`
- foco: mejora puntual en login, onboarding, práctica o dashboard sin abrir frentes nuevos
- alcance permitido:
  - copy, estados vacíos, mensajes de error, polish pequeño
  - mejoras localizadas con impacto visible
- exclusiones:
  - refactor estructural de `PracticeSession`
  - cambios grandes de navegación o arquitectura

## Lane D — Backlog y gobernanza de agentes

- prioridad: `P3`
- owner sugerido: `Doc Control Agent`
- foco: mantener backlog corto, trazable y coherente con la vía real de contribución
- alcance permitido:
  - priorización corta
  - cierre documental
  - ajuste de trazabilidad por `Agent`, `Via` y `Contributor`
- definición de cierre:
  - backlog corto visible
  - reglas de commit y handoff alineadas con los canales reales de trabajo

## Reparto recomendado entre agentes

- Agente 1: Lane A
- Agente 2: Lane B
- Agente 3: Lane C
- Agente 4: Lane D

## Orden recomendado

1. cerrar Lane A primero para que los demás trabajen con gates más claros
2. correr Lane B en paralelo mientras se estabiliza Lane A
3. abrir Lane C solo contra superficies pequeñas del core
4. usar Lane D para consolidar cierre y evitar drift documental

## Checklist mínimo por PR

- scope acotado a una lane
- build y pruebas relevantes reportadas
- sin secretos en diff, logs o markdown
- commit con `Agent`, `Via` y `Contributor`
- riesgo abierto declarado si no hubo runtime visible validado
