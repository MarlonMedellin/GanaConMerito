# Item Taxonomy Contract v1

## Objetivo
Definir el contrato del banco de ítems rico para Tutor GCM preservando compatibilidad con el banco legacy.

## Estructura de carpetas

### `content/items/`
Contiene el corpus principal. Organización obligatoria:

`area -> subarea -> competency`

Ejemplo:

`content/items/pedagogia/evaluacion_formativa/analisis/*.json`

Cada archivo debe representar ítems con metadata rica. Esta jerarquía es la fuente primaria de navegación pedagógica y cobertura curricular.

### `content/profiles/docente/`
Contiene curación editorial por perfil docente (lotes, cobertura, filtros, dashboards).

Reglas:
- No duplica ítems.
- No reemplaza la taxonomía base.
- Referencia ítems por `id` o `slug`.
- Puede agregar etiquetas editoriales para consumo de analítica.

## Contrato taxonómico

El contrato mínimo exige:
- `area`: dominio pedagógico/disciplinar.
- `subarea`: segmento especializado dentro del área.
- `competency`: resultado evaluado.

Tutor GCM usa esta relación para orientar pistas, comparaciones seguras y feedback contextualizado.

## Regla de no duplicación
- Un ítem vive una sola vez en `content/items/`.
- Perfiles en `content/profiles/docente/` solo apuntan/referencian.
- Si se detecta duplicado semántico, se corrige en la taxonomía fuente y se sincronizan referencias.

## Catálogo cerrado de `targetPosition`
Valores permitidos:
- `docente_aula`
- `docente_orientador`
- `docente_lider`
- `directivo_docente`
- `coordinador`
- `rector`
- `sin_especificar`

## Uso correcto de metadatos de perfil
- `targetRole`: rol general (ej. docente, directivo-docente).
- `targetPosition`: posición específica del catálogo cerrado.
- `applicantProfile`: agrupador editorial de preparación.
- `tags`: filtros auxiliares (tema, dificultad, contexto, cohortes).

## Integración con Tutor GCM
Tutor consume metadata rica para:
- fortalecer `QuestionTruth` con `subarea`, `affirmation`, `evidenceStatement` y contexto;
- generar hint ladders más precisas por dificultad/nivel cognitivo;
- explicar distractores con `justificacion_distractores`;
- activar advertencias prudentes cuando `riesgos_tecnicos` sugieren ambigüedad o doble clave;
- mantener fallback a contrato legacy cuando falten columnas en DB o campos en runtime.
