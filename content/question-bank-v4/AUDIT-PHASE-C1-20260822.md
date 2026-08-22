# Auditoría adversarial V4 — Fase C1 selectiva

**Fecha:** 2026-08-22  
**Rama:** `v4-post-sprint48-expansion`  
**Base:** 254 reactivos aprobados tras Fase B  
**Estado final C1:** **2 nuevos APPROVED + 2 reclasificados; 2 candidatos REJECTED por duplicación**

## 1. Corrección de la auditoría preliminar

La primera pasada sobre los cuatro candidatos `DOC-001291`–`DOC-001294` no detectó dos duplicaciones conceptuales porque la búsqueda inicial se apoyó demasiado en coincidencias del escenario redactado. Una revisión posterior por constructo y por los lotes V4 existentes identificó que el banco ya contenía:

- `DOC-001104`: zona de desarrollo próximo de Vygotsky, mediación y avance hacia independencia;
- `DOC-001110`: metacognición, planificación, monitoreo y evaluación con fuente EEF 2025.

Por esta razón se revoca la aprobación preliminar de `DOC-001291` y `DOC-001294`.

## 2. Veredictos finales de candidatos

| ID | Constructo | Veredicto | Disposición |
|---|---|---|---|
| `DOC-001291` | ZDP y apoyos temporales | **REJECTED** | retirar; ID no reutilizable; duplicación con `DOC-001104` |
| `DOC-001292` | conocimiento previo y aprendizaje significativo | **APPROVED** | conservar |
| `DOC-001293` | asimilación y acomodación | **APPROVED** | conservar |
| `DOC-001294` | metacognición y autorregulación | **REJECTED** | retirar; ID no reutilizable; duplicación con `DOC-001110` |

La búsqueda V4 no encontró un reactivo equivalente para aprendizaje significativo/Ausubel ni para asimilación-acomodación/Piaget. Los resultados sobre Ausubel existentes en el repositorio pertenecen a material legacy/no-beta y no constituyen reactivos V4 ya aprobados.

## 3. Reclasificación de reactivos existentes

La creación del tópico `aprendizaje_y_desarrollo_cognitivo` obliga a revisar los reactivos V4 que ya medían ese constructo bajo una etiqueta genérica.

### `DOC-001104`

Antes:
- `domain: pedagogia`
- `topic: planeacion_curricular`

Después:
- `domain: desarrollo_aprendizaje`
- `topic: aprendizaje_y_desarrollo_cognitivo`

El contenido, clave, explicaciones y fuente no cambian.

### `DOC-001110`

Antes:
- `domain: pedagogia`
- `topic: evaluacion_formativa`

Después:
- `domain: desarrollo_aprendizaje`
- `topic: aprendizaje_y_desarrollo_cognitivo`

El contenido, clave, explicaciones y fuente no cambian.

Estas reclasificaciones eliminan una incoherencia taxonómica: ZDP y regulación metacognitiva son procesos de aprendizaje/desarrollo y no ejemplos centrales de planeación curricular o evaluación formativa.

## 4. Reactivos nuevos aprobados

### `DOC-001292`

Evalúa la decisión de conectar conocimiento previo relevante con nuevo conocimiento para favorecer aprendizaje significativo. La fuente se apoya en revisiones contemporáneas de la teoría de Ausubel. Single-best-answer: B.

### `DOC-001293`

Evalúa la distinción entre asimilación y acomodación mediante revisión de un esquema que ya no explica un contraejemplo. La fuente se apoya en OpenStax y la formulación piagetiana. Single-best-answer: C.

Ambos presentan distractores plausibles, clasificación coherente y relación longitud-clave/mediana de distractores inferior a 1,65.

## 5. Resultado de cobertura

C1 no necesita fabricar dos sustitutos para alcanzar una cuota. La cobertura se resuelve con **dos nuevos reactivos + dos reclasificaciones**:

- corpus: **254 → 256**;
- `pedagogia`: **10 → 8** por corrección taxonómica de 104 y 110;
- `desarrollo_aprendizaje`: **13 → 17**;
- `aprendizaje_y_desarrollo_cognitivo`: **4** (`104`, `110`, `292`, `293`);
- `planeacion_curricular`: **57 → 56**;
- `evaluacion_formativa`: **24 → 23**.

## 6. IDs

`DOC-001291` y `DOC-001294` fueron usados como candidatos serializados y luego rechazados en la auditoría ampliada. Se retiran del corpus y **no se reutilizan**. El siguiente ID nunca usado continúa siendo `DOC-001295`.

## 7. Gate de continuidad

**C1 queda cerrada en 256. No se autoriza C2 por defecto.** La siguiente decisión debe partir del mapa de cobertura corregido y no del objetivo de añadir volumen.
