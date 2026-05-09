# Item Taxonomy Contract v1 (Sprint 40)

## Estructura de contenido
- Banco principal: `content/items/`.
- Capa editorial por perfiles: `content/profiles/docente/`.

## Contrato taxonómico obligatorio
Cada ítem debe mapearse en jerarquía:
`area -> subarea -> competency`.

## Regla de no duplicación
- Los perfiles **no** duplican ítems.
- Los perfiles **no** reemplazan la taxonomía base.
- Los perfiles referencian IDs existentes para curación, cobertura, lotes, filtros y dashboards.

## Catálogo cerrado de `targetPosition`
- `docente_aula`
- `docente_orientador`
- `docente_lider`
- `coordinador`
- `rector`
- `directivo_docente`
- `sin_posicion_objetivo`

## Uso de metadata
- `targetRole`: rol funcional del ítem (ej. docencia, liderazgo pedagógico).
- `targetPosition`: posición destino cerrada por catálogo.
- `applicantProfile`: etiqueta del perfil aspiracional/editorial.
- `tags`: clasificación transversal (filtro, lote, analítica).

## Integración con Tutor GCM
- Tutor Evidence Builder mantiene compatibilidad legacy y consume metadata rica cuando exista.
- `QuestionTruth` se enriquece con subárea, afirmación/evidencia, nivel cognitivo/dificultad, justificación de distractores y riesgos técnicos.
- `TutorSupportContract` usa esta metadata para hints más precisos, feedback de distractores y cautela explícita cuando haya ambigüedad/doble clave.
