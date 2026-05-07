# Sprint 17 — Tutor Trace Summary Consumer v1

## Objetivo
Agregar una visualización mínima en dashboard para consumir `GET /api/tutor/traces/summary` en modo solo lectura.

## Alcance implementado
- Se agregó una tarjeta pequeña en dashboard para mostrar:
  - `totalTurns`
  - `degradedTurns`
  - `preAnswerGuardrailHits`
  - `postAnswerExplanations`
  - `topIntents`
  - `topGuardrails`
- La tarjeta maneja estados de carga, error y vacío.
- El contenido es descriptivo; no realiza inferencias de fortaleza, no modifica scoring ni progreso.

## Fuera de alcance
- Cambios en backend del tutor.
- Cambios en scoring, session advance o reglas de progreso.
- Cambios en Docker, VPS o deploy.
