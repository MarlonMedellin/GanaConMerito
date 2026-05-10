# Sprint 41 — Semantic Governance Foundation v1

## Objetivo
Establecer base canónica semántica para Tutor GCM sin cambio funcional visible en runtime.

## Componentes
- Catálogo canónico de taxonomía (área, subárea, competencia, nivel educativo, tipo ítem, nivel cognitivo, dificultad, targetPosition, targetRole, applicantProfile).
- Vocabulario controlado de tags por categorías editoriales.
- Aliases soportados y valores prohibidos/deprecados.
- Adaptadores internos:
  1. legacy item -> normalized rich item
  2. rich item -> QuestionTruth
  3. QuestionTruth -> TutorSupportContract

## Principios de gobernanza
- Sin tags libres fuera del registro controlado.
- Sin expansión no controlada de contratos centrales.
- Compatibilidad backward con runtime actual.
- Rechazo explícito de valores desconocidos o prohibidos.

## Estado
Implementado v1 en `src/domain/taxonomy/*` y `src/domain/tutor/question-truth-adapter.ts`.
