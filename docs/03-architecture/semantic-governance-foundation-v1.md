# Sprint 41 — Semantic Governance Foundation v1

## Objetivo
Establecer una base canónica de gobernanza semántica para Tutor GCM sin introducir cambios funcionales visibles en runtime ni inventar metadata pedagógica ausente.

## Alcance implementado en v1
- Catálogo canónico de taxonomía para `area`, `subarea`, `competency`, `nivel_educativo`, `tipo_item`, `nivel_cognitivo`, `dificultad`, `targetPosition`, `targetRole` y `applicantProfile`.
- Vocabulario controlado de tags por categorías editoriales.
- Aliases soportados, deprecaciones explícitas y valores prohibidos.
- Validadores estrictos para taxonomía y tags.
- Normalizador legacy `legacy item -> normalized rich item` sin inventar valores ausentes.
- Adaptadores `rich item -> QuestionTruth` y `QuestionTruth -> TutorSupportContract` preservando los guardrails de seguridad ya vigentes del Tutor.

## Principios de gobernanza
- Sin tags libres fuera del registro controlado.
- Sin expansión no controlada de contratos centrales.
- Sin convertir metadata faltante en verdad canónica silenciosa.
- Compatibilidad backward con runtime actual.
- Rechazo explícito de valores desconocidos o prohibidos en validación estricta.
- Degradación trazable y no destructiva cuando un item legacy trae metadata faltante o inválida.

## Limitaciones aceptadas en Sprint 41
- La lectura runtime actual solo integra de forma efectiva `area` y `competency` desde el banco activo ya existente.
- `subarea`, `nivel_educativo`, `tipo_item`, `nivel_cognitivo`, `dificultad`, `targetPosition`, `targetRole`, `applicantProfile` y `tags` quedan gobernados en código, pero su adopción punta a punta en consultas y lectura productiva pasa a Sprint 42.
- Esta versión no promueve `source_verified`; mantiene el frente en `synthesized_governed_unverified`.

## Criterio de cierre
Sprint 41 puede cerrarse cuando se cumpla todo esto:
- La taxonomía y los tags estén gobernados por catálogos/versionado explícito.
- El normalizador legacy no invente metadata faltante.
- Los adaptadores preserven compatibilidad backward y el `TutorSupportContract` mantenga `responsePolicy` y guardrails previos.
- La documentación canónica deje explícito que la adopción completa de ingesta rica corresponde al siguiente sprint.

## Siguiente sprint
- Sprint 42 — Rich Ingestion Normalization
