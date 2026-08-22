# Cierre V4 — Fase A: 54 reactivos de alto retorno

**Fecha:** 2026-08-22  
**Estado:** COMPLETADO  
**Línea base:** 170 reactivos V4 válidos  
**Resultado final:** 224 reactivos V4 válidos  
**Expansión:** +54 reactivos aprobados

## Resultado por microbloque

| Bloque | Rango | Nuevos | Núcleo |
|---|---|---:|---|
| A1 | `DOC-001202`–`DOC-001213` | 12 | Evaluación del desempeño y carrera docente |
| A2 | `DOC-001214`–`DOC-001223` | 10 | Protección integral, Ley 1098 y PARD |
| A3 | `DOC-001224`–`DOC-001233` | 10 | Funciones, jornada y régimen profesional |
| A4 | `DOC-001234`–`DOC-001241` | 8 | PRAE y proyectos pedagógicos transversales |
| A5 | `DOC-001242`–`DOC-001249` | 8 | Gobierno escolar y participación democrática |
| A6 | `DOC-001250`–`DOC-001255` | 6 | Ajustes razonables y accesibilidad real |
| **Total** |  | **54** |  |

## Ampliación taxonómica justificada

El contrato V4 permite ampliar catálogos únicamente cuando existe necesidad editorial real. Antes de esta fase `planeacion_curricular` concentraba 57/170 reactivos y varios constructos de alto valor no podían clasificarse sin perder precisión. Se añadieron solo seis tópicos:

- `evaluacion_desempeno_docente` — 8 reactivos.
- `carrera_docente` — 4 reactivos.
- `proteccion_integral` — 10 reactivos.
- `funciones_y_jornada_docente` — 10 reactivos.
- `prae_proyectos_transversales` — 8 reactivos.
- `gobierno_escolar_participacion` — 8 reactivos.

No se creó un tópico adicional para inclusión: `ajustes_razonables` ya era semánticamente correcto y pasó de 1 a 7 reactivos. `planeacion_curricular` permaneció en 57, confirmando que la expansión aumentó granularidad sin usar esa categoría como cajón de sastre.

## Cobertura final

Snapshot canónico: `COVERAGE-AFTER-PHASE-A-20260822.json`.

- Reactivos: **224**.
- Errores estructurales o taxonómicos: **0**.
- Dominios: **10/10** con cobertura.
- Tópicos: **22/22** con cobertura.
- Competencias: **8/8** con cobertura.
- Tipos de pregunta: **7/7** con cobertura.
- Niveles cognitivos: **4/4** con cobertura.

### Dominios

- `pedagogia`: 10
- `evaluacion`: 27
- `convivencia`: 30
- `inclusion`: 25
- `curriculo`: 18
- `didactica`: 22
- `gestion_educativa`: 33
- `normativa_educativa`: 35
- `desarrollo_aprendizaje`: 12
- `practica_docente`: 12

### Competencias

- `decision_pedagogica`: 42
- `interpretacion_normativa`: 42
- `analisis_de_evidencia`: 33
- `planeacion_pedagogica`: 33
- `resolucion_de_problemas`: 10
- `comprension_conceptual`: 33
- `juicio_profesional`: 21
- `gestion_de_aula`: 10

### Tipos

- `situational`: 46
- `conceptual`: 24
- `normative_applied`: 43
- `reasoning`: 28
- `reading_analysis`: 19
- `case_analysis`: 36
- `technical_applied`: 28

### Nivel cognitivo

- `understand`: 24
- `apply`: 69
- `analyze`: 68
- `judge`: 63

## Fuentes y correcciones normativas

Se usó `temas(1).md` como mapa de oportunidades, no como autoridad normativa. Las afirmaciones se contrastaron con fuentes vigentes antes de serializar. Entre los controles relevantes:

- evaluación/carrera: Decreto Ley 1278 de 2002, Decreto 3782 de 2007 y portal MEN de evaluación actualizado el 4 de agosto de 2026;
- protección integral: Ley 1098 de 2006, Ley 1878 de 2018 e información vigente del ICBF sobre PARD;
- funciones y jornada: Decreto 277 de 2025, Decreto 1075, Ley 715 y Resolución MEN 003842 de 2022;
- PRAE: Decreto 1743 de 1994;
- gobierno escolar: Ley 115 de 1994 y Decreto 1075 de 2015;
- ajustes razonables: Decreto 1421 de 2017 compilado en Decreto 1075 y Circular MEN 024 de 2026.

No se incorporaron como vigentes proyectos normativos ni formulaciones históricas incompatibles con normas posteriores.

## QA y criterio editorial

Cada microbloque fue validado contra contrato, taxonomías, IDs, opciones A–D, explicaciones, fuente y unicidad. El cierre ejecutó una segunda validación independiente sobre los 224 archivos y exigió expresamente la presencia de los 54 IDs `DOC-001202`–`DOC-001255` y las coberturas esperadas de los nuevos tópicos.

La Fase A queda cerrada. El siguiente identificador esperado para una nueva incorporación es `DOC-001256`, sujeto a comprobación de disponibilidad antes de usarlo.
