# Taxonomía del banco V4

Vocabulario controlado para clasificar los ítems de `content/question-bank-v4/`.
Estos archivos son la **fuente de verdad** de la clasificación editorial: la fábrica
debe clasificar únicamente con estos valores, el auditor los verifica, y
`scripts/validate-question-bank-v4.ts` los impone sobre cada ítem serializado.

## Archivos

| Archivo | Dimensión | Consumidores |
|---|---|---|
| `domains.json` | `domain` (área amplia de conocimiento/desempeño) | fábrica, auditor, validador |
| `topics.json` | `topic` (contenido específico evaluado) | fábrica, auditor, validador |
| `competencies.json` | `competency` (capacidad cognitiva/funcional principal) | fábrica, auditor, validador |
| `question-types.json` | `questionType`, `cognitiveLevel`, `estimatedDifficulty` | fábrica, auditor, validador |

## Regla de uso (no negociable)

> Los campos `domain`, `topic`, `competency`, `questionType`, `cognitiveLevel` y
> `estimatedDifficulty` deben tomar **exclusivamente** valores de estos catálogos.
> Está prohibido inventar valores nuevos dentro de un ítem. Si un constructo no
> encaja, usa el valor más cercano y reporta la propuesta de ampliación por
> separado (nunca dentro del JSON del reactivo).

## Fundamentación de cada dimensión

Cada valor debe poder justificarse con una fuente normativa, un documento MEN/ICFES
o un autor consolidado. No se agregan valores "por si acaso".

### `domains.json`

| Valor | Base |
|---|---|
| `pedagogia` | Ley 115 de 1994 (fines de la educación); referentes MEN |
| `evaluacion` | Decreto 1290 de 2009 (evaluación del aprendizaje) |
| `convivencia` | Ley 1620 de 2013 (sistema nacional de convivencia escolar) |
| `inclusion` | Ley 1618 de 2013 y Decreto 1421 de 2017 (educación inclusiva) |
| `curriculo` | Ley 115 de 1994; lineamientos curriculares MEN |
| `didactica` | Literatura pedagógica reconocida (MEN, autores consolidados) |
| `gestion_educativa` | Ley 715 de 2001; Decreto 1075 de 2015 |
| `normativa_educativa` | Ley 115 de 1994; Decreto 1075 de 2015 (compilatorio) |
| `desarrollo_aprendizaje` | Piaget, Vygotsky, Ausubel (teorías del desarrollo y aprendizaje) |
| `practica_docente` | Decreto 1278 de 2002; marco ECDF/MEN |

### `topics.json`

| Valor | Base |
|---|---|
| `evaluacion_formativa` | Decreto 1290 de 2009, art. 3 |
| `evaluacion_diagnostica` | Decreto 1290 de 2009 (identificación de características/ritmos) |
| `retroalimentacion` | Evaluación formativa (Black & Wiliam); orientaciones MEN |
| `ajustes_razonables` | Decreto 1421 de 2017 |
| `dua` | Decreto 1421 de 2017; orientaciones MEN (Diseño Universal para el Aprendizaje) |
| `piar` | Decreto 1421 de 2017 (Plan Individual de Ajustes Razonables) |
| `inclusion_educativa` | Ley 1618 de 2013; Decreto 1421 de 2017 |
| `convivencia_escolar` | Ley 1620 de 2013 |
| `debido_proceso` | Ley 1620 de 2013; Decreto 1965 de 2013 |
| `rutas_de_atencion` | Ley 1620 de 2013; Decreto 1965 de 2013 (rutas de atención integral) |
| `competencias_ciudadanas` | Estándares Básicos de Competencias Ciudadanas (MEN, 2004) |
| `planeacion_curricular` | Ley 115 de 1994; lineamientos curriculares MEN |

### `competencies.json`

| Valor | Base |
|---|---|
| `decision_pedagogica` | Decreto 1278 de 2002; marco ECDF/MEN |
| `interpretacion_normativa` | Decreto 1075 de 2015; evaluación de docentes (CNSC/MEN) |
| `analisis_de_evidencia` | Evaluación por competencias (ICFES); evaluación formativa |
| `planeacion_pedagogica` | ECDF/MEN (componente de planeación) |
| `resolucion_de_problemas` | ICFES; pedagogía |
| `comprension_conceptual` | Bloom/Anderson-Krathwohl; Ausubel |
| `juicio_profesional` | ECDF/MEN; Perrenoud (competencias) |
| `gestion_de_aula` | ECDF/MEN (componente de ambiente escolar) |

### `question-types.json`

| Campo | Valores | Base |
|---|---|---|
| `questionType` | `situational`, `conceptual`, `normative_applied`, `reasoning`, `reading_analysis`, `case_analysis`, `technical_applied` | Diseño de pruebas MEN/ICFES |
| `cognitiveLevel` | `understand`, `apply`, `analyze`, `judge` | Taxonomía de Bloom revisada (Anderson & Krathwohl) |
| `estimatedDifficulty` | `low`, `medium`, `high` | Estimación editorial (no psicométrica) |

## Gobernanza del catálogo

1. **Vocabulario cerrado.** Solo los valores listados son válidos.
2. **Ampliación con justificación.** Agregar un valor exige: (a) una fuente normativa,
   académica o institucional que lo fundamente; (b) actualizar este README y el JSON;
   (c) no duplicar un valor existente.
3. **Sin sinónimos en el banco.** Un concepto tiene un único valor canónico.
4. **`technical_applied`** exige aplicar conocimiento técnico/disciplinar vinculado a
   funciones o conocimientos esenciales del empleo (seleccionar procedimiento,
   interpretar información o determinar una solución).

## Relación con la taxonomía legacy de la app

`src/domain/taxonomy/catalogs.ts` mantiene una taxonomía anterior en español
(`area`, `subarea`, `competency`, `tipo_item`, `nivel_cognitivo`, `dificultad`),
con aliases/deprecated/forbidden, orientada al banco anterior. **No es la fuente de
verdad del banco V4.** La eventual unificación de ambas debe decidirse como cambio de
arquitectura explícito; hasta entonces, el banco V4 usa únicamente los catálogos de
esta carpeta.
