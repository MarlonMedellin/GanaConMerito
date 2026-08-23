# Expansión V4 — Fase C selectiva

**Rama:** `v4-post-sprint48-expansion`  
**Fecha:** 2026-08-22  
**Base de rama:** 254 reactivos aprobados tras Fase B  
**Estado:** **C1 CERRADA TRAS AUDITORÍA AMPLIADA**  
**Resultado neto:** 2 reactivos nuevos + 2 reclasificaciones  
**Corpus final C1:** **256 reactivos**  
**Auditoría:** [`AUDIT-PHASE-C1-20260822.md`](../audits/AUDIT-PHASE-C1-20260822.md)

## Justificación

Tras Fase B, `desarrollo_aprendizaje` tenía 13 reactivos. C1 investigó procesos de aprendizaje y cambio cognitivo y abrió el tópico `aprendizaje_y_desarrollo_cognitivo` porque los tópicos anteriores no describían honestamente estos constructos.

La auditoría ampliada mostró que dos oportunidades ya estaban cubiertas por V4 pero clasificadas bajo tópicos genéricos. Por ello C1 se cerró sin fabricar sustitutos para completar una cuota.

## Resultado final C1

| ID | Constructo | Acción | Estado |
|---|---|---|---|
| `DOC-001104` | ZDP y mediación | reclasificar desde `pedagogia/planeacion_curricular` | APPROVED existente |
| `DOC-001110` | metacognición | reclasificar desde `pedagogia/evaluacion_formativa` | APPROVED existente |
| `DOC-001292` | conocimiento previo y aprendizaje significativo | nuevo | APPROVED |
| `DOC-001293` | asimilación y acomodación | nuevo | APPROVED |
| `DOC-001291` | ZDP y apoyo temporal | retirar por duplicación con 104 | REJECTED |
| `DOC-001294` | metacognición y autorregulación | retirar por duplicación con 110 | REJECTED |

## Fuentes rectoras

- Vygotsky / `DOC-001104`: *Mind in Society*, pp. 86–87.
- EEF 2025 / `DOC-001110`: *Metacognition and Self-Regulated Learning*, 2.ª edición.
- Agra et al. (2019) y Bryce & Blown (2024) / `DOC-001292`: aprendizaje significativo y conocimiento previo.
- OpenStax / `DOC-001293`: asimilación y acomodación en Piaget.

## Cobertura final C1

- corpus: **254 → 256**;
- `pedagogia`: **10 → 8**;
- `desarrollo_aprendizaje`: **13 → 17**;
- `aprendizaje_y_desarrollo_cognitivo`: **4**;
- `planeacion_curricular`: **57 → 56**;
- `evaluacion_formativa`: **24 → 23**.

Snapshot: `../snapshots/COVERAGE-AFTER-PHASE-C1-20260822.json`.

## IDs y no reutilización

Los candidatos `DOC-001291` y `DOC-001294` fueron serializados durante la primera iteración y luego rechazados al detectar duplicación conceptual. Se retiran y sus IDs quedan consumidos/no reutilizables. Los nuevos aprobados son `DOC-001292` y `DOC-001293`. El siguiente ID nunca usado es `DOC-001295`.

## Aprendizaje de proceso

La deduplicación no puede apoyarse solo en similitud literal del escenario. Desde C1, el gate debe consultar también:

1. constructo y autor/teoría;
2. informes de lotes anteriores;
3. `source.reference` y términos conceptuales;
4. escenarios semánticamente distintos que midan la misma decisión.

## Gate antes de C2

**No existe C2 autorizado por anticipado.** Debe revisarse la cobertura corregida de 256 reactivos y abrir otra expansión solo si existe un vacío de alto valor que no esté ya cubierto por otro dominio o tópico.
