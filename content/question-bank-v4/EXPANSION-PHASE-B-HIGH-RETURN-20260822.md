# Expansión V4 — Fase B: alta rentabilidad post-Sprint 48

**Rama:** `v4-post-sprint48-expansion`  
**Fecha:** 2026-08-22  
**Base congelada en `master`:** 224 reactivos aprobados  
**Estado:** META INICIAL 30/30 COMPLETADA EN RAMA; PENDIENTE AUDITORÍA DE COBERTURA PARA DECIDIR B5  
**Corpus de rama tras B4:** 254 reactivos.

## Regla de aislamiento

`master` permanece congelada en 224 reactivos durante Sprint 48. Ningún reactivo de esta fase debe llegar a `master` por escritura directa. La rama se usa para investigar, producir, auditar y medir una expansión posterior.

## Microbloques ejecutados

| Bloque | Rango | Nuevos | Núcleo | Decisión taxonómica | Estado |
|---|---|---:|---|---|---|
| B1 | `DOC-001256`–`DOC-001263` | 8 | Competencias comportamentales profesionales | nuevo `competencias_comportamentales` | COMPLETADO |
| B2 | `DOC-001264`–`DOC-001271` | 8 | Lectura crítica profesional | reutiliza `comprension_lectora` | COMPLETADO |
| B3 | `DOC-001272`–`DOC-001277` | 6 | Educación inicial y transición | nuevo `educacion_inicial_transicion` | COMPLETADO |
| B4 | `DOC-001278`–`DOC-001285` | 8 | Razonamiento cuantitativo, datos y modelización | nuevo `razonamiento_cuantitativo`; `modelizacion` solo para modelos reales | COMPLETADO |
| **Total** | `DOC-001256`–`DOC-001285` | **30** |  |  | **30/30** |

## Criterio para ampliar tópicos

Solo se amplía `topics.json` cuando reutilizar un tópico vigente describiría falsamente el constructo o volvería a inflar una categoría genérica. No se crean sinónimos taxonómicos.

### Ampliaciones justificadas

- `competencias_comportamentales`: constructo profesional específico definido en Decreto 3782 de 2007 y Guía MEN No. 31; no equivale a competencias ciudadanas ni a evaluación del desempeño.
- `educacion_inicial_transicion`: marco pedagógico y normativo específico para menores de seis años, grados prejardín/jardín/transición y DBA propios; no equivale a comprensión lectora ni a planeación curricular genérica.
- `razonamiento_cuantitativo`: constructo ICFES para interpretar/representar, formular/ejecutar y argumentar con información cuantitativa en contextos reales; no equivale a `modelizacion`, que solo se usa cuando el reactivo construye o interpreta un modelo.

B2 no amplió taxonomía: `comprension_lectora` ya describe correctamente lectura crítica profesional. `modelizacion` se conservó como tópico específico y pasó de 1 a 3 reactivos.

## Fuentes rectoras

### B1 — Competencias comportamentales
- Decreto 3782 de 2007, especialmente artículos 13 y 17.
- MEN, Guía No. 31 — Guía Metodológica Evaluación Anual de Desempeño Laboral.

### B2 — Lectura crítica profesional
- ICFES, Marco de referencia de la prueba Lectura Crítica Saber 11°, Saber TyT y Saber Pro.
- ICFES, guías de orientación vigentes: comprensión local, articulación global y reflexión/evaluación; textos continuos y discontinuos.

### B3 — Educación inicial y transición
- Decreto 1411 de 2022, incorporado al Decreto 1075 de 2015.
- MEN y Universidad de Antioquia, Derechos Básicos de Aprendizaje para el grado Transición.
- Colombia Aprende, recurso DBA Transición actualizado el 25/05/2026.

### B4 — Razonamiento cuantitativo y modelización
- ICFES, Marco de referencia del módulo Razonamiento Cuantitativo.
- ICFES, guía de orientación de módulos genéricos: interpretación y representación, formulación y ejecución, argumentación.

## Cobertura tras la meta inicial

Snapshot: `COVERAGE-AFTER-PHASE-B4-20260822.json`.

- `master`: **224** reactivos congelados.
- rama: **254** reactivos.
- Fase B inicial: **30/30**.
- `competencias_comportamentales`: **8**.
- `comprension_lectora`: **12**.
- `educacion_inicial_transicion`: **6**.
- `razonamiento_cuantitativo`: **6**.
- `modelizacion`: **3**.
- `resolucion_de_problemas`: **17**.
- `gestion_de_aula`: **11**.

## Gate antes de cualquier B5

No se autoriza automáticamente otro lote. Antes de crear `DOC-001286` debe ejecutarse una auditoría de cobertura y duplicación sobre los 254 reactivos de la rama para determinar si persiste algún vacío de alto retorno. Si no existe un argumento fuerte, la Fase B se cierra en 30 reactivos.

## Gates de calidad

Cada ítem debe ser nuevo frente al corte de 224, medir un constructo distinto, evitar memoria trivial, tener una única mejor respuesta, distractores profesionales plausibles, fuente verificable y superar validación estructural/taxonómica. Los snapshots intermedios son evidencia de cobertura editorial; el QA final de rama debe ser de solo lectura y no modificar reactivos ni snapshots.
