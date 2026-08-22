# Expansión V4 — Fase C selectiva

**Rama:** `v4-post-sprint48-expansion`  
**Fecha:** 2026-08-22  
**Base de rama:** 254 reactivos aprobados tras cierre de Fase B  
**Estado:** **C1 AUDITADA Y CERRADA — 4/4 APPROVED**  
**C1:** `DOC-001291`–`DOC-001294`  
**Corpus tras C1:** 258 reactivos  
**Auditoría:** [`AUDIT-PHASE-C1-20260822.md`](./AUDIT-PHASE-C1-20260822.md)

## Justificación

Tras Fase B, `desarrollo_aprendizaje` tenía 13 reactivos y permanecía entre los dominios con menor representación. C1 se limitó a cuatro constructos con utilidad docente clara y soporte académico verificable.

El tópico `aprendizaje_y_desarrollo_cognitivo` se incorporó porque ninguno de los tópicos anteriores describía honestamente estos procesos. Reutilizar `planeacion_curricular`, `comprension_lectora` o `evaluacion_formativa` habría falseado el constructo.

## C1 ejecutada

| ID | Constructo | Fuente rectora | Clave | Auditoría |
|---|---|---|---|---|
| `DOC-001291` | ZDP, apoyo temporal y retirada progresiva | OpenStax, Vygotsky/ZDP/scaffolding | A | APPROVED |
| `DOC-001292` | conocimiento previo y aprendizaje significativo | Agra et al.; Bryce & Blown / Ausubel | B | APPROVED |
| `DOC-001293` | asimilación y acomodación de esquemas | OpenStax / Piaget | C | APPROVED |
| `DOC-001294` | metacognición: planificar, monitorear y evaluar | EEF 2025 | D | APPROVED |

## Resultado de cobertura

- corpus: **254 → 258**;
- `desarrollo_aprendizaje`: **13 → 17**;
- `aprendizaje_y_desarrollo_cognitivo`: **0 → 4**;
- claves C1: **A=1, B=1, C=1, D=1**;
- outliers de longitud de clave (>1,65 × mediana de distractores): **0**.

Snapshot: `COVERAGE-AFTER-PHASE-C1-20260822.json`.

## Fuentes verificadas

- OpenStax, *Lifespan Development*: ZDP, apoyo de adulto/par más capaz y scaffolding como soporte; asimilación y acomodación como ajuste de esquemas.
- Agra et al. (2019), revisión de aprendizaje significativo a la luz de Ausubel.
- Bryce & Blown (2024), revisión contemporánea de la teoría de aprendizaje significativo.
- Education Endowment Foundation (2025), *Metacognition and Self-Regulated Learning*, 2.ª edición.

## Gates heredados

1. Auditoría individual previa a serialización.
2. IDs inmutables y no reutilizables.
3. Control de posición de claves a nivel de lote sin determinar la respuesta por posición.
4. Gate de pistas de forma y longitud.
5. Fuente verificable y vigente.
6. No crear tópico nuevo si un valor existente describe honestamente el constructo.

## Gate antes de C2

**C2 no está autorizado por anticipado.** El próximo paso es recalcular la cobertura de los 258 reactivos y decidir si persiste otro vacío selectivo con retorno suficiente. El siguiente ID nunca usado es `DOC-001295`.
