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
> encaja honestamente en un valor vigente, no se fuerza una etiqueta “cercana” que
> distorsione lo que realmente mide: se documenta por separado la necesidad editorial
> y el catálogo solo se amplía cuando existe una justificación fuerte, una fuente
> verificable y ausencia de un valor canónico equivalente.

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
| `desarrollo_aprendizaje` | Piaget, Vygotsky, Ausubel; investigación contemporánea sobre aprendizaje y metacognición |
| `practica_docente` | Decreto 1278 de 2002; marco ECDF/MEN |

### `topics.json`

| Valor | Base |
|---|---|
| `evaluacion_formativa` | Decreto 1290 de 2009, art. 3 |
| `evaluacion_diagnostica` | Decreto 1290 de 2009 (identificación de características/ritmos) |
| `retroalimentacion` | Evaluación formativa (Black & Wiliam); orientaciones MEN |
| `evaluacion_desempeno_docente` | Decreto 3782 de 2007; evaluación anual de desempeño laboral docente |
| `carrera_docente` | Decreto Ley 1278 de 2002; procesos de carrera y evaluación docente |
| `ajustes_razonables` | Decreto 1421 de 2017 |
| `dua` | Decreto 1421 de 2017; orientaciones MEN (Diseño Universal para el Aprendizaje) |
| `piar` | Decreto 1421 de 2017 (Plan Individual de Ajustes Razonables) |
| `inclusion_educativa` | Ley 1618 de 2013; Decreto 1421 de 2017 |
| `convivencia_escolar` | Ley 1620 de 2013 |
| `debido_proceso` | Ley 1620 de 2013; Decreto 1965 de 2013 |
| `rutas_de_atencion` | Ley 1620 de 2013; Decreto 1965 de 2013 (rutas de atención integral) |
| `proteccion_integral` | Ley 1098 de 2006 y Ley 1878 de 2018; restablecimiento de derechos |
| `competencias_ciudadanas` | Estándares Básicos de Competencias Ciudadanas (MEN, 2004) |
| `competencias_comportamentales` | Decreto 3782 de 2007, art. 17; MEN, Guía No. 31 |
| `gobierno_escolar_participacion` | Ley 115 de 1994 y Decreto 1075 de 2015, Gobierno Escolar |
| `planeacion_curricular` | Ley 115 de 1994; lineamientos curriculares MEN |
| `prae_proyectos_transversales` | Decreto 1743 de 1994; Proyecto Ambiental Escolar y transversalidad |
| `funciones_y_jornada_docente` | Ley 715 de 2001; Decreto 1075 de 2015; Decreto 277 de 2025 |
| `educacion_inicial_transicion` | Decreto 1411 de 2022; DBA para el grado Transición (MEN/UdeA) |
| `aprendizaje_y_desarrollo_cognitivo` | Piaget (asimilación/acomodación), Vygotsky (ZDP), Ausubel (conocimiento previo/aprendizaje significativo) y EEF 2025 (metacognición y autorregulación) |
| `razonamiento_cuantitativo` | ICFES, Marco de referencia del módulo Razonamiento Cuantitativo |
| `indagacion` | Estándares Básicos de Competencias en Ciencias Naturales (MEN, 2006), proceso de indagación |
| `modelizacion` | Estándares Básicos de Competencias en Matemáticas (MEN, 2006); ICFES, formulación y ejecución en Razonamiento Cuantitativo |
| `argumentacion` | Estándares Básicos de Competencias en Lenguaje (MEN, 2006); Estándares Básicos de Competencias Ciudadanas (MEN, 2004) |
| `comprension_lectora` | Estándares Básicos de Competencias en Lenguaje (MEN, 2006); ICFES, Marco de referencia de Lectura Crítica |

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
   (c) no duplicar un valor existente; y (d) demostrar que reutilizar un valor vigente
   falsearía o volvería excesivamente genérico el constructo.
3. **Sin sinónimos en el banco.** Un concepto tiene un único valor canónico.
4. **`technical_applied`** exige aplicar conocimiento técnico/disciplinar vinculado a
   funciones o conocimientos esenciales del empleo (seleccionar procedimiento,
   interpretar información o determinar una solución).

## Integración de expansiones post-Sprint 48

Las expansiones post-Sprint 48 integradas en `master` añadieron, con justificación
editorial documentada, cuatro tópicos:

- `competencias_comportamentales` (Fase B);
- `educacion_inicial_transicion` (Fase B);
- `razonamiento_cuantitativo` (Fase B);
- `aprendizaje_y_desarrollo_cognitivo` (Fase C1).

El tópico de C1 agrupa procesos de aprendizaje y cambio cognitivo que no pueden
clasificarse honestamente como currículo, lectura, evaluación o didáctica específica:
activación y conexión del conocimiento previo, ZDP y apoyos temporales, revisión de
esquemas mediante asimilación/acomodación y regulación metacognitiva del aprendizaje.
No se usa para cualquier estrategia pedagógica genérica.

Estos valores ya pertenecen al catálogo V4 canónico. El hash agregado del catálogo
y sus valores ordenados se congelan en `content/question-bank-v4/MANIFEST.json`;
cualquier modificación requiere actualizar el manifiesto y superar el QA V4.

## Relación con la taxonomía legacy de la app

`src/domain/taxonomy/catalogs.ts` mantiene una taxonomía anterior en español
(`area`, `subarea`, `competency`, `tipo_item`, `nivel_cognitivo`, `dificultad`),
con aliases/deprecated/forbidden, orientada al banco anterior. **No es la fuente de
verdad del banco V4.** La eventual unificación de ambas debe decidirse como cambio de
arquitectura explícito; hasta entonces, el banco V4 usa únicamente los catálogos de
esta carpeta.
