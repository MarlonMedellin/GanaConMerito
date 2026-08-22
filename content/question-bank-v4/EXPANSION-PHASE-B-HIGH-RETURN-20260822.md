# Expansión V4 — Fase B: alta rentabilidad post-Sprint 48

**Rama:** `v4-post-sprint48-expansion`  
**Fecha de inicio:** 2026-08-22  
**Base congelada en `master`:** 224 reactivos aprobados  
**Estado:** EN EJECUCIÓN SOLO EN RAMA  
**Meta inicial:** 30 reactivos; cualquier ampliación posterior exige recalcular cobertura.

## Regla de aislamiento

`master` permanece congelada en 224 reactivos durante Sprint 48. Ningún reactivo de esta fase debe llegar a `master` por escritura directa. La rama se usa para investigar, producir, auditar y medir una expansión posterior.

## Microbloques previstos

| Bloque | Rango previsto | Meta | Núcleo | Taxonomía |
|---|---|---:|---|---|
| B1 | `DOC-001256`–`DOC-001263` | 8 | Competencias comportamentales profesionales | nuevo `competencias_comportamentales` |
| B2 | `DOC-001264`–`DOC-001271` | 8 | Lectura crítica profesional | reutiliza `comprension_lectora` |
| B3 | `DOC-001272`–`DOC-001277` | 6 | Educación inicial y transición | evaluar `educacion_inicial_transicion` antes de producir |
| B4 | `DOC-001278`–`DOC-001285` | 8 | Razonamiento cuantitativo, datos y modelización | evaluar `razonamiento_cuantitativo`; reutilizar `modelizacion` cuando corresponda |

Después de B4 se recalcula la cobertura completa. No se autoriza por anticipado un B5.

## Criterio para ampliar tópicos

Solo se amplía `topics.json` cuando reutilizar un tópico vigente describiría falsamente el constructo o volvería a inflar una categoría genérica. No se crean sinónimos taxonómicos.

Para B1 la ampliación `competencias_comportamentales` está justificada porque estas competencias son un constructo profesional específico —liderazgo, comunicación y relaciones interpersonales, trabajo en equipo, negociación y mediación, compromiso social e institucional, iniciativa y orientación al logro— y no equivalen a `competencias_ciudadanas`, `evaluacion_desempeno_docente` ni `planeacion_curricular`.

## Fuentes rectoras B1

- Decreto 3782 de 2007, especialmente artículos 13 y 17.
- Ministerio de Educación Nacional, Guía No. 31 — Guía Metodológica Evaluación Anual de Desempeño Laboral, glosario de competencias y actuaciones intencionales.
- Portal MEN de evaluación de docentes y directivos docentes, consultado en 2026.

## Gates

Cada ítem debe ser nuevo frente al corte de 224, medir una sola competencia o distinción profesional, evitar memoria nominal trivial, tener una única mejor respuesta, distractores profesionales plausibles, fuente verificable y QA estructural/taxonómico antes del cierre del microbloque.
