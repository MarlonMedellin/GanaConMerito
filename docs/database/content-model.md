# Modelo de contenido

## Fuente canónica

Los ítems se modelan en Markdown con frontmatter.

## Identidad canónica

Se adopta este criterio:
- `id` del Markdown = `content_id` editorial estable
- `slug` = identificador funcional y humano legible
- `id` UUID DB = identificador interno persistente

## Estructura editorial del banco
La estructura vigente del banco es híbrida:
- carpeta canónica de ítems finales: `content/items/`
- organización primaria del banco: `area -> subarea -> competency`
- capa secundaria opcional por perfil docente: `targetRole`, `targetPosition`, `applicantProfile`, `tags`
- carpeta secundaria de trabajo editorial por perfil: `content/profiles/docente/`

## Campos canónicos principales

- `id`
- `slug`
- `title`
- `area`
- `subarea`
- `examType`
- `competency`
- `difficulty`
- `targetLevel`
- `itemType`
- `normativeRefs`
- `published`
- `version`

## Campos secundarios opcionales

- `targetRole`
- `targetPosition`
- `applicantProfile`
- `tags`

## Catálogo controlado de la segunda capa

### `targetRole`
Valores permitidos actuales:
- `docente`

### `targetPosition`
Valores permitidos actuales:
- `rector_director_rural`
- `coordinador`
- `docente_aula_preescolar`
- `docente_aula_basica_primaria`
- `docente_aula_secundaria_media`
- `docente_orientador`

### `applicantProfile`
Valores permitidos actuales:
- `directivo_docente`
- `docente_de_aula`
- `docente_orientador`

## Secciones mínimas

- `Enunciado`
- `Opciones`
- `RespuestaCorrecta`
- `Explicacion`
- `ErroresFrecuentes` (recomendado)

## Reglas editoriales

- frontmatter obligatorio
- `difficulty` entre `0` y `1`
- exactamente 4 opciones
- una sola correcta
- opciones no vacías
- warning si hay textos duplicados o casi duplicados
- en esta fase, **no se admiten opciones multilínea**
- la segunda capa por perfiles no sustituye `area`, `subarea` ni `competency`

## Relación con la base de datos

- `item_bank` guarda el ítem principal
- `item_bank.content_id` preserva el `id` editorial del Markdown
- `item_options` guarda las opciones A-D

## Persistencia

La persistencia de contenido ahora se resuelve de forma atómica mediante la función SQL:
- `public.upsert_content_item(...)`

Esa función:
- inserta/actualiza `item_bank`
- reescribe `item_options`
- devuelve `item_id` y `item_version`

## Estado actual

Ya existe:
- validador básico de opciones en `src/domain/content/validate-item.ts`
- parser real Markdown en `src/domain/content/parse-md.ts`
- endpoint real de validación en `src/app/api/content/validate/route.ts`
- endpoint de carga persistente en `src/app/api/content/upload/route.ts`
- importador real por archivos en `src/domain/content/import-from-file.ts`
- validación de catálogo para `targetRole`, `targetPosition` y `applicantProfile` en el parser

## Observación

Las referencias normativas aún se conservan en `normativeRefs` dentro del ítem. La persistencia estructurada de normativa queda como evolución posterior.

La segunda capa de perfiles ya existe en la capa editorial Markdown, pero su adopción completa en los contratos de lectura de runtime y base de datos sigue siendo una decisión evolutiva, no un hecho cerrado.
