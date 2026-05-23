---
id: SCHEMA-DERIVED-JSON-V1
name: derived-json-schema-v1
project: ganaconmerito
owner: PM-Governance
status: canonical
artifact_type: schema-contract
version: "1.0.0"
effective_date: 2026-05-23
last_reviewed: 2026-05-23
related:
  - docs/database/content-model.md
  - docs/05-ops/question-bank-load-runbook.md
  - scripts/export-items-to-json.ts
---

# Schema JSON Derivado — `derived-json-schema-v1`

## Declaración de gobernanza

> **IMPORTANTE:** Este schema describe un artefacto DERIVADO. El JSON producido
> por `scripts/export-items-to-json.ts` NO es fuente canónica. La fuente canónica
> es siempre el archivo Markdown en `content/items/`.
>
> Cualquier edición de contenido DEBE realizarse en el archivo `.md` fuente.
> El JSON se regenera a partir del Markdown; nunca al revés.

## Propósito

El JSON derivado existe para procesos específicos que requieren acceso programático
estructurado al banco de ítems sin parsear Markdown:

- **Auditoría** — análisis masivo de campos, claves, consistencia
- **Analítica** — dashboards, métricas de cobertura taxonómica
- **Integraciones externas** — sistemas de terceros que no consumen Markdown
- **QA automatizado** — assertions sobre estructura sin ejecutar el parser
- **Exportaciones controladas** — snapshots del corpus para revisión editorial

## Campos del schema v1

### Metadatos de trazabilidad (obligatorios, generados por el exportador)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `_schema` | `string` | Versión del schema derivado. Valor fijo: `"derived-json-schema-v1"` |
| `_exported_at` | `string` | ISO 8601 timestamp de la exportación |
| `_exporter_version` | `string` | Versión del script exportador (semver) |
| `_source_file` | `string` | Ruta relativa al archivo `.md` fuente |
| `_source_hash` | `string` | SHA-256 del contenido del `.md` en el momento de exportación |

### Identidad (obligatorios)

| Campo | Tipo | Mapeo desde MD | Descripción |
|-------|------|----------------|-------------|
| `id` | `string` | `frontmatter.id` | Identificador editorial estable |
| `slug` | `string` | `frontmatter.slug` | Identificador funcional legible |
| `title` | `string` | `frontmatter.title` | Título del ítem |
| `version` | `number` | `frontmatter.version` | Versión editorial |
| `published` | `boolean` | `frontmatter.published` | Estado de publicación |

### Taxonomía (obligatorios salvo indicado)

| Campo | Tipo | Mapeo desde MD | Descripción |
|-------|------|----------------|-------------|
| `area` | `string` | `frontmatter.area` | Área temática |
| `subarea` | `string \| null` | `frontmatter.subarea` | Sub-área (opcional en MD) |
| `examType` | `string` | `frontmatter.examType` | Tipo de examen |
| `competency` | `string` | `frontmatter.competency` | Competencia evaluada |
| `difficulty` | `number` (0–1) | `frontmatter.difficulty` | Dificultad normalizada |
| `targetLevel` | `string \| null` | `frontmatter.targetLevel` | Nivel educativo objetivo |
| `targetRole` | `string \| null` | `frontmatter.targetRole` | Rol del evaluado |
| `targetPosition` | `string \| null` | `frontmatter.targetPosition` | Cargo específico |
| `applicantProfile` | `string \| null` | `frontmatter.applicantProfile` | Perfil del postulante |
| `itemType` | `string` | `frontmatter.itemType` | Tipo de ítem (`multiple_choice`) |
| `normativeRefs` | `string[]` | `frontmatter.normativeRefs` | Referencias normativas |
| `tags` | `string[]` | `frontmatter.tags` | Etiquetas libres |

### Contenido pedagógico (obligatorios)

| Campo | Tipo | Mapeo desde MD | Descripción |
|-------|------|----------------|-------------|
| `stem` | `string` | Sección `## Enunciado` | Enunciado del ítem |
| `options` | `Array<{key, text}>` | Sección `## Opciones` | Opciones A-D |
| `correctOption` | `string` (`"A"–"D"`) | Sección `## RespuestaCorrecta` | Clave correcta |
| `explanation` | `string` | Sección `## Explicacion` | Justificación de la clave |

## Reglas de mapeo MD → JSON

1. **Frontmatter YAML → campos planos**: todos los campos del frontmatter se mapean
   directamente a propiedades de primer nivel del JSON.
2. **Secciones `##` del body → campos de contenido**: se extraen por heading exacto
   (case-insensitive).
3. **Opciones**: el parser reconoce el patrón `- A. texto` → `{key: "A", text: "texto"}`.
4. **Valores ausentes en MD opcionales → `null` en JSON** (no se omiten, para facilitar
   acceso programático consistente).
5. **SHA-256**: calculado sobre el contenido íntegro del `.md` (incluyendo frontmatter).
6. **El JSON no agrega campos no presentes en el MD** (no se enriquece el derivado).

## Reglas de compatibilidad futura

- **Adición de campos**: siempre retrocompatible (consumidores deben ignorar campos desconocidos).
- **Cambio de tipo o eliminación de campo**: requiere bump de versión (`derived-json-schema-v2`).
- **El campo `_schema`** permite a los consumidores detectar la versión y adaptar su lógica.
- **No hacer depender el pipeline de Supabase de este JSON** — el pipeline de importación
  usa el parser MD directamente.

## Ejemplo de ítem exportado válido

```json
{
  "_schema": "derived-json-schema-v1",
  "_exported_at": "2026-05-23T19:00:00.000Z",
  "_exporter_version": "1.0.0",
  "_source_file": "content/items/pedagogia/pedagogia-evaluacion-aprendizaje-001.md",
  "_source_hash": "a3f2...",
  "id": "item-doc-006",
  "slug": "pedagogia-evaluacion-aprendizaje-001",
  "title": "Estrategia de evaluación formativa",
  "version": 1,
  "published": true,
  "area": "pedagogia",
  "subarea": "evaluacion_del_aprendizaje",
  "examType": "docente",
  "competency": "evaluacion_formativa",
  "difficulty": 0.2,
  "targetLevel": "basico",
  "targetRole": "docente",
  "targetPosition": null,
  "applicantProfile": "docente_de_aula",
  "itemType": "multiple_choice",
  "normativeRefs": [],
  "tags": ["foco:evaluacion_formativa"],
  "stem": "El profesor Juan está implementando...",
  "options": [
    { "key": "A", "text": "Aplicar una prueba escrita..." },
    { "key": "B", "text": "Utilizar una rúbrica..." },
    { "key": "C", "text": "Proporcionar retroalimentación continua..." },
    { "key": "D", "text": "Diseñar listas de cotejo..." }
  ],
  "correctOption": "C",
  "explanation": "La opción correcta es C porque..."
}
```

## Comandos npm

```bash
# Exportar corpus activo (27 ítems)
npm run content:export:json

# Exportar todos los ítems
npm run content:export:json:all

# Verificar consistencia MD vs JSON derivado existente
npm run content:export:json:check
```

## Qué NO hace este schema

- ❌ No reemplaza el canon Markdown
- ❌ No se importa directamente a Supabase (el pipeline usa `import-current-question-bank.ts`)
- ❌ No valida la calidad editorial (eso lo hace `validate-question-bank.ts`)
- ❌ No define el modelo de la base de datos (ver `docs/database/content-model.md`)
