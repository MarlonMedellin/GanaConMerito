# Reauditoría adversarial V4 — Fase B remediada

**Fecha:** 2026-08-22  
**Rama:** `v4-post-sprint48-expansion`  
**Base congelada en `master`:** 224 reactivos aprobados  
**Corpus físico de rama:** 254 JSON  
**Delta activo de Fase B:** 30 reactivos  
**Veredicto:** **APPROVED — 30/30; Fase B cerrada**

## 1. Alcance

Esta reauditoría se ejecuta después de `AUDIT-PHASE-B-20260822.md` y de dos rondas de remediación. Mantiene el criterio de `GCM-Adversarial-Item-Auditor-Docentes.md` y el contrato V4.

Se revisaron:

- contrato, taxonomía y trazabilidad de los 254 archivos activos;
- los cinco reactivos regenerados desde cero;
- los reactivos cuyas opciones fueron reordenadas o normalizadas;
- single-best-answer, constructo, demanda cognitiva, fuentes y capa pedagógica;
- posición de claves, rachas y asimetrías de longitud de opciones;
- duplicación conceptual de las cinco regeneraciones contra el banco congelado.

## 2. Resolución de los cinco rechazos

Los IDs rechazados **no se reutilizaron** y dejaron de estar serializados:

- `DOC-001258`
- `DOC-001259`
- `DOC-001261`
- `DOC-001265`
- `DOC-001268`

Fueron reemplazados por reactivos nuevos, creados desde cero y con identificadores nuevos:

| Nuevo ID | Núcleo | Veredicto |
|---|---|---|
| `DOC-001286` | Comunicación y relaciones interpersonales | APPROVED |
| `DOC-001287` | Trabajo en equipo | APPROVED |
| `DOC-001288` | Compromiso social e institucional | APPROVED |
| `DOC-001289` | Integración crítica de evidencia textual | APPROVED |
| `DOC-001290` | Función argumentativa y explicación alternativa | APPROVED |

No se reutilizaron contexto, stem, opciones, clave ni explicaciones de los cinco reactivos rechazados.

## 3. Integridad del lote

### Distribución de claves

| Opción | Cantidad |
|---|---:|
| A | 8 |
| B | 8 |
| C | 7 |
| D | 7 |

- Racha máxima de una misma clave en la secuencia activa: **3**.
- No existe opción ausente.
- La distribución no se usó para decidir qué alternativa era correcta; se reordenaron opciones solo después de preservar la clave sustantiva.

### Pistas de forma

Se aplicó un gate automatizable que compara la longitud en palabras de la clave con la mediana de los distractores. Umbral de bloqueo: razón > **1,65**.

Tras la remediación:

- máximo observado: aproximadamente **1,43**;
- mínimo observado: aproximadamente **0,88**;
- outliers bloqueantes: **0**.

También se normalizaron tono, nivel de precisión y plausibilidad de distractores en los reactivos que mostraban una alternativa correcta sistemáticamente más desarrollada.

## 4. Fuentes y vigencia

Se volvió a comprobar el soporte de los núcleos remediados:

- Decreto 3782 de 2007, artículos 13–17: distinción funcional/comportamental y siete competencias comportamentales.
- MEN, Guía No. 31: actuaciones y referentes para competencias comportamentales.
- ICFES, Marco de referencia de Lectura Crítica Saber 11°, TyT y Saber Pro: articulación, inferencia y reflexión/evaluación del contenido.
- Decreto 1411 de 2022 incorporado al Decreto 1075 de 2015: educación inicial, transición, acceso y continuidad.
- ICFES, Marco de referencia de Razonamiento Cuantitativo: interpretación/representación, formulación/ejecución y argumentación.

No se detectó un cambio de vigencia que invalide las claves utilizadas.

## 5. Duplicación

La búsqueda contra el banco congelado no encontró coincidencias para los cinco nuevos núcleos/contextos de regeneración: comunicación sobre reporte de avances con familias, trabajo en equipo en feria de ciencias, permanencia y barreras de transporte, uso presencial de sala de lectura y análisis de horario de tutorías.

Los cinco reactivos miden oportunidades editoriales distintas y no son paráfrasis de un reactivo V4 ya aprobado.

## 6. Estado final de Fase B

- `master`: **224** aprobados, sin cambios por esta rama.
- rama: **254** archivos activos.
- Fase B activa: **30** reactivos.
- Fase B: **30 APPROVED / 0 REJECTED activos**.
- Total editorialmente aprobado en rama: **254**.
- Snapshot canónico post-remediación: `../snapshots/COVERAGE-AFTER-PHASE-B-REMEDIATION-20260822.json`.
- QA de rama: `.github/workflows/v4-post-sprint48-qa.yml`, `permissions: contents: read`.
- Próximo ID nunca usado disponible: `DOC-001291`.

## 7. Decisión de continuidad

**Fase B queda CERRADA.** No se crea un B5: los cuatro vacíos de alta rentabilidad definidos para esta fase —competencias comportamentales, lectura crítica profesional, educación inicial/transición y razonamiento cuantitativo/modelización— ya fueron cubiertos y auditados.

Cualquier expansión posterior debe abrir una fase distinta y justificarla con el mapa de cobertura actualizado, en vez de extender B por inercia de volumen.
