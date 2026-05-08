# Banco de preguntas — índice maestro de referencia

## Propósito

Este índice reúne los documentos base para diseñar, clasificar, validar y escalar el banco de preguntas de GanaConMerito.

## Documentos principales

### 1. Plantillas y estructura de preguntas
Ruta:
- `docs/project/reference/plantillas-y-estructura-de-preguntas.md`

Contiene:
- estructura canónica de cada pregunta
- definición de cada campo del frontmatter
- definición de cada sección del cuerpo
- plantilla maestra
- plantillas por tipo de pregunta
- recomendación sobre organización del banco
- uso de metadatos secundarios por perfil docente

### 2. Taxonomía y nomenclatura del banco de preguntas
Ruta:
- `docs/project/reference/taxonomia-y-nomenclatura-del-banco-de-preguntas.md`

Contiene:
- convención de `id`
- convención de `slug`
- taxonomía sugerida de áreas, subáreas y competencias
- estructura editorial de carpetas
- criterios para crecimiento ordenado del banco

### 3. Estructura híbrida del banco
Ruta:
- `docs/project/reference/estructura-hibrida-taxonomia-perfiles-docente.md`

Contiene:
- distinción entre carpeta canónica y capa secundaria por perfiles docentes
- reglas de uso de `content/items/` y `content/profiles/docente/`
- relación recomendada entre perfiles docentes y áreas del banco

### 4. Metadatos secundarios para perfiles docentes
Ruta:
- `docs/project/reference/metadatos-secundarios-perfiles-docente.md`

Contiene:
- definición de `targetRole`
- definición de `targetPosition`
- definición de `applicantProfile`
- definición y uso prudente de `tags`
- catálogo permitido y ejemplos de uso

### 5. Guía de decisión para perfiles docentes
Ruta:
- `docs/project/reference/guia-decision-perfiles-docente.md`

Contiene:
- criterio para decidir cuándo usar solo taxonomía base
- criterio para usar `applicantProfile`
- criterio para usar `targetPosition`
- reglas para mantener la segunda capa útil y liviana

### 6. Ejemplos modelo de preguntas
Ruta:
- `docs/project/reference/ejemplos-modelo-de-preguntas.md`

Contiene:
- 10 ejemplos completos de preguntas
- ejemplos por área y por tipo de problema
- referencia directa de redacción y metadatos

### 7. Checklist de validación editorial
Ruta:
- `docs/project/reference/checklist-de-validacion-editorial.md`

Contiene:
- checklist obligatorio
- checklist de calidad
- checklist técnico
- checklist de publicación
- semáforo de decisión editorial

### 8. Descripción del corpus
Ruta:
- `docs/project/reference/descripcion-del-corpus-de-preguntas.md`

Contiene:
- visión estructural del corpus
- principios de organización
- núcleos temáticos
- niveles de clasificación
- estrategia de crecimiento del banco

## Orden recomendado de lectura

1. `descripcion-del-corpus-de-preguntas.md`
2. `plantillas-y-estructura-de-preguntas.md`
3. `taxonomia-y-nomenclatura-del-banco-de-preguntas.md`
4. `estructura-hibrida-taxonomia-perfiles-docente.md`
5. `metadatos-secundarios-perfiles-docente.md`
6. `guia-decision-perfiles-docente.md`
7. `ejemplos-modelo-de-preguntas.md`
8. `checklist-de-validacion-editorial.md`

## Uso recomendado

### Para diseñar nuevas preguntas
Leer:
1. descripción del corpus
2. plantillas
3. taxonomía
4. metadatos secundarios por perfil si aplican
5. ejemplos
6. checklist

### Para organizar el banco
Leer:
1. descripción del corpus
2. taxonomía y nomenclatura
3. estructura híbrida
4. guía de decisión por perfiles

### Para revisar calidad editorial
Leer:
1. checklist de validación editorial
2. ejemplos modelo
3. guía de decisión por perfiles si el ítem tiene segmentación docente

## Criterio rector

El banco debe organizarse **primero por contenido, área, subárea y competencia**, y solo después por variables secundarias como cargo, aspirante, convocatoria o entidad.

## Regla operativa complementaria

En la práctica, eso significa:
- `content/items/` = ítems finales canónicos
- `content/profiles/docente/` = mapas, lotes y trabajo editorial por perfil
- `targetRole`, `targetPosition`, `applicantProfile` y `tags` = segunda capa opcional dentro del ítem
