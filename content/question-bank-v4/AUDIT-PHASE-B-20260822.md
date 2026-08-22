# Auditoría adversarial V4 — Fase B post-Sprint 48

**Fecha:** 2026-08-22  
**Rama:** `v4-post-sprint48-expansion`  
**Base congelada en `master`:** 224 reactivos aprobados  
**Delta auditado en profundidad:** `DOC-001256`–`DOC-001285` (30 reactivos)  
**Corpus físico de la rama:** 254 JSON  
**Veredicto de la Fase B:** **BLOQUEADA — NO AUTORIZAR B5**

## 1. Método

La revisión sigue `docs/ai/skills/GCM-Adversarial-Item-Auditor-Docentes.md` v1.1 y `CONTRATO-EDITORIAL-V4.md`.

Se aplicaron dos capas:

1. **QA del corpus completo de 254:** contrato, IDs, scope, catálogos taxonómicos, A–D, clave, explicaciones, fuentes y concordancia con el snapshot B4.
2. **Auditoría adversarial del delta de 30:** lectura ciega de contexto/stem/opciones; single-best-answer; rol docente; fuente y vigencia; constructo; clasificación; demanda cognitiva; distractores; pistas lingüísticas; capa pedagógica y comparación conceptual con el banco congelado de 224.

No se creó `DOC-001286` ni se produjo contenido B5 durante la auditoría.

## 2. Resultado ejecutivo

- **25/30:** `APPROVED` en auditoría individual.
- **5/30:** `REJECTED` por hallazgos bloqueantes.
- **Fuentes/vigencia:** sin error sustantivo detectado en las cuatro familias rectoras (Decreto 3782 de 2007 + Guía MEN 31; ICFES Lectura Crítica; Decreto 1411 de 2022 + DBA Transición; ICFES Razonamiento Cuantitativo).
- **Duplicación conceptual:** no se detectó una repetición sustantiva que obligue a descartar alguno de los 25 aprobados; los nuevos núcleos amplían constructos distintos respecto del corte de 224.
- **Integridad de claves del lote:** `A=11`, `B=17`, `C=2`, `D=0`. Este patrón impide considerar la Fase B lista para incorporación aun cuando 25 reactivos aprueben de manera individual.
- **Pistas de forma:** existe recurrencia de alternativas correctas más completas, matizadas y extensas que los distractores. Debe corregirse como propiedad del lote antes de una nueva auditoría.

## 3. Veredictos individuales

| ID | Veredicto | Hallazgo bloqueante si aplica |
|---|---|---|
| DOC-001256 | APPROVED | — |
| DOC-001257 | APPROVED | — |
| DOC-001258 | REJECTED | **Constructo/taxonomía:** `gestion_de_aula` no representa la capacidad principal evaluada; el caso mide comunicación y relaciones interpersonales con una familia, fuera del núcleo de gestión de aula. |
| DOC-001259 | REJECTED | **Tipo + constructo:** `technical_applied` no corresponde: el reactivo discrimina trabajo en equipo y no exige aplicar conocimiento técnico/disciplinar; `planeacion_pedagogica` queda subordinada al constructo real. |
| DOC-001260 | APPROVED | — |
| DOC-001261 | REJECTED | **Constructo/taxonomía:** el reactivo mide compromiso social e institucional frente a permanencia/ausentismo; `decision_pedagogica` no describe de forma suficientemente fiel la capacidad principal solicitada. |
| DOC-001262 | APPROVED | — |
| DOC-001263 | APPROVED | — |
| DOC-001264 | APPROVED | — |
| DOC-001265 | REJECTED | **Demanda cognitiva:** identificar la función explícita del conector adversativo “sin embargo” es comprensión (`understand`), no un proceso `analyze` como está serializado. |
| DOC-001266 | APPROVED | — |
| DOC-001267 | APPROVED | — |
| DOC-001268 | REJECTED | **Demanda cognitiva:** reconocer el propósito explícito/global de un breve mensaje logístico corresponde principalmente a comprensión (`understand`); `analyze` sobredeclara la demanda real. |
| DOC-001269 | APPROVED | — |
| DOC-001270 | APPROVED | — |
| DOC-001271 | APPROVED | — |
| DOC-001272 | APPROVED | — |
| DOC-001273 | APPROVED | — |
| DOC-001274 | APPROVED | — |
| DOC-001275 | APPROVED | — |
| DOC-001276 | APPROVED | — |
| DOC-001277 | APPROVED | — |
| DOC-001278 | APPROVED | — |
| DOC-001279 | APPROVED | — |
| DOC-001280 | APPROVED | — |
| DOC-001281 | APPROVED | — |
| DOC-001282 | APPROVED | — |
| DOC-001283 | APPROVED | — |
| DOC-001284 | APPROVED | — |
| DOC-001285 | APPROVED | — |

## 4. Hallazgos por microbloque

### B1 — Competencias comportamentales

**5 APPROVED / 3 REJECTED.** La base normativa es correcta: el Decreto 3782 de 2007 mantiene la distinción entre competencias funcionales y comportamentales y enumera liderazgo, comunicación y relaciones interpersonales, trabajo en equipo, negociación y mediación, compromiso social e institucional, iniciativa y orientación al logro. Los problemas están en la clasificación de tres reactivos, no en ese marco.

### B2 — Lectura crítica profesional

**6 APPROVED / 2 REJECTED.** Los ocho contextos son distintos de los cuatro reactivos previos de `comprension_lectora`; la falla en 265 y 268 es de nivel cognitivo, no de fuente ni de single-best-answer. El marco ICFES vigente continúa distinguiendo comprensión local, articulación global y reflexión/evaluación del contenido.

### B3 — Educación inicial y transición

**6 APPROVED / 0 REJECTED.** Se verificó la correspondencia normativa de la definición de educación inicial, familia como actor fundamental, edad de referencia para transición y admisión a básica cuando no se cursó transición. Los DBA respaldan que evidencias y ejemplos no funcionan como lista rígida de logros y que la planeación debe ser integral y contextualizada.

### B4 — Razonamiento cuantitativo y modelización

**8 APPROVED / 0 REJECTED.** Los ítems distinguen porcentajes/puntos porcentuales, tasas con denominadores distintos, promedios ponderados, escalas gráficas, capacidad, proyección bajo supuestos, interpretación algebraica y límites de inferencia causal. No duplican el antiguo `DOC-000026`, que evalúa modelización como intervención didáctica para traducir una situación a una ecuación.

## 5. Gate de lote: FALLA

Aunque 25 reactivos aprueben individualmente, **el lote de 30 no está listo para promoción**.

### Distribución actual de claves

| Opción | Cantidad | Proporción |
|---|---:|---:|
| A | 11 | 36.7 % |
| B | 17 | 56.7 % |
| C | 2 | 6.7 % |
| D | 0 | 0 % |

Esto crea un patrón de posición excesivamente visible, especialmente si los reactivos se consumen por secuencia o microbloques. También se observó de forma recurrente que la alternativa correcta es la más desarrollada o matizada frente a distractores más categóricos. La siguiente iteración debe romper ambos patrones sin convertir la distribución de letras en un objetivo mecánico por encima de la calidad.

## 6. Disposición obligatoria antes de B5

1. **No crear `DOC-001286`.**
2. Los cinco `REJECTED` deben resolverse según la skill: `REGENERATE_FROM_ZERO` o `ABANDON`; no se corrigen incrementalmente como si fueran aprobados.
3. Los 25 aprobados deben pasar un control de integridad de opciones a nivel de lote para eliminar pistas sistemáticas de posición/forma; cualquier ítem que falle ese nuevo gate deberá ser rechazado y regenerado desde cero.
4. Recalcular claves, cobertura y snapshot después de la resolución.
5. Ejecutar otra auditoría adversarial. Solo si el delta queda 30/30 limpio puede discutirse si existe argumento editorial para B5.

## 7. Estado resultante

- `master`: **224 aprobados y congelados**.
- rama: **254 archivos materializados**.
- editorialmente aprobados tras esta auditoría: **249 = 224 + 25**.
- rechazados de Fase B pendientes de disposición: **5**.
- Fase B como lote: **NO APROBADA PARA PROMOCIÓN**.
- B5: **BLOQUEADO**.
