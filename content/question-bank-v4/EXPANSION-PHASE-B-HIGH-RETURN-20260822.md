# Expansión V4 — Fase B: alta rentabilidad post-Sprint 48

**Rama:** `v4-post-sprint48-expansion`  
**Fecha:** 2026-08-22  
**Base congelada en `master`:** 224 reactivos aprobados  
**Estado:** **AUDITADA Y BLOQUEADA — 25 APPROVED / 5 REJECTED; B5 NO AUTORIZADO**  
**Corpus físico de rama:** 254 reactivos.  
**Auditoría:** [`AUDIT-PHASE-B-20260822.md`](./AUDIT-PHASE-B-20260822.md)

## Regla de aislamiento

`master` permanece congelada en 224 reactivos durante Sprint 48. Ningún reactivo de esta fase debe llegar a `master` por escritura directa. La rama se usa para investigar, producir, auditar y medir una expansión posterior.

## Microbloques ejecutados y auditados

| Bloque | Rango | Nuevos | Núcleo | Decisión taxonómica | Auditoría individual |
|---|---|---:|---|---|---|
| B1 | `DOC-001256`–`DOC-001263` | 8 | Competencias comportamentales profesionales | nuevo `competencias_comportamentales` | **5 APPROVED / 3 REJECTED** |
| B2 | `DOC-001264`–`DOC-001271` | 8 | Lectura crítica profesional | reutiliza `comprension_lectora` | **6 APPROVED / 2 REJECTED** |
| B3 | `DOC-001272`–`DOC-001277` | 6 | Educación inicial y transición | nuevo `educacion_inicial_transicion` | **6 APPROVED / 0 REJECTED** |
| B4 | `DOC-001278`–`DOC-001285` | 8 | Razonamiento cuantitativo, datos y modelización | nuevo `razonamiento_cuantitativo`; `modelizacion` solo para modelos reales | **8 APPROVED / 0 REJECTED** |
| **Total** | `DOC-001256`–`DOC-001285` | **30** |  |  | **25 APPROVED / 5 REJECTED** |

## Criterio para ampliar tópicos

Solo se amplía `topics.json` cuando reutilizar un tópico vigente describiría falsamente el constructo o volvería a inflar una categoría genérica. No se crean sinónimos taxonómicos.

### Ampliaciones justificadas

- `competencias_comportamentales`: constructo profesional específico definido en Decreto 3782 de 2007 y Guía MEN No. 31; no equivale a competencias ciudadanas ni a evaluación del desempeño.
- `educacion_inicial_transicion`: marco pedagógico y normativo específico para menores de seis años, grados prejardín/jardín/transición y DBA propios; no equivale a comprensión lectora ni a planeación curricular genérica.
- `razonamiento_cuantitativo`: constructo ICFES para interpretar/representar, formular/ejecutar y argumentar con información cuantitativa en contextos reales; no equivale a `modelizacion`, que solo se usa cuando el reactivo construye o interpreta un modelo.

B2 no amplió taxonomía: `comprension_lectora` ya describe correctamente lectura crítica profesional. `modelizacion` se conservó como tópico específico y pasó de 1 a 3 reactivos.

## Fuentes rectoras verificadas

### B1 — Competencias comportamentales
- Decreto 3782 de 2007, especialmente artículos 13–17.
- MEN, Guía No. 31 — Guía Metodológica Evaluación Anual de Desempeño Laboral.

### B2 — Lectura crítica profesional
- ICFES, Marco de referencia de la prueba Lectura Crítica Saber 11°, Saber TyT y Saber Pro.
- ICFES, guías vigentes: comprensión local, articulación global y reflexión/evaluación; textos continuos y discontinuos.

### B3 — Educación inicial y transición
- Decreto 1411 de 2022, incorporado al Decreto 1075 de 2015.
- MEN y Universidad de Antioquia, Derechos Básicos de Aprendizaje para el grado Transición.

### B4 — Razonamiento cuantitativo y modelización
- ICFES, Marco de referencia del módulo Razonamiento Cuantitativo.
- ICFES: interpretación y representación, formulación y ejecución, argumentación.

## Cobertura material tras B4

Snapshot: `COVERAGE-AFTER-PHASE-B4-20260822.json`.

- `master`: **224** aprobados y congelados.
- rama: **254 archivos**.
- Fase B materializada: **30**.
- Fase B aprobada individualmente: **25**.
- Fase B rechazada: **5** (`DOC-001258`, `DOC-001259`, `DOC-001261`, `DOC-001265`, `DOC-001268`).
- aprobados editoriales efectivos en la rama: **249** hasta resolver los rechazados.

## Gate de lote tras auditoría

La Fase B **NO está aprobada para promoción** aunque 25 reactivos hayan pasado individualmente. La distribución de claves del delta es `A=11`, `B=17`, `C=2`, `D=0`, y se detectó recurrencia de alternativas correctas más desarrolladas que sus distractores. Antes de cualquier B5 debe resolverse este patrón y reauditarse el delta completo.

## Gate antes de cualquier B5

1. No usar `DOC-001286`.
2. Resolver los cinco `REJECTED` mediante `REGENERATE_FROM_ZERO` o `ABANDON`, sin parche incremental.
3. Aplicar control de integridad de opciones a los 25 `APPROVED`; si alguno falla por pistas de forma, se rechaza y regenera desde cero.
4. Recalcular cobertura y claves.
5. Ejecutar nuevamente `GCM-Adversarial-Item-Auditor-Docentes`.
6. Solo con delta limpio puede evaluarse si B5 tiene justificación editorial.

## Gates de calidad

Cada ítem debe ser nuevo frente al corte de 224, medir un constructo distinto, evitar memoria trivial, tener una única mejor respuesta, distractores profesionales plausibles, fuente verificable y superar validación estructural/taxonómica. Los snapshots intermedios son evidencia de cobertura editorial; el QA de rama es de solo lectura y no modifica reactivos ni snapshots.
