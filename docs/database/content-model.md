# Modelo de contenido

> **Política de gobernanza (2026-05-23):**
> - **Canon Legacy/Beta/V3**: Markdown en `content/items/` — fuente única de verdad.
> - **JSON Legacy/Beta/V3**: artefacto DERIVADO generado por `scripts/export-items-to-json.ts`.
> - **Canon V4**: JSON bajo `content/question-bank-v4/items/`, gobernado por su contrato y manifiesto.

## Fuente canónica

Existen dos contratos editoriales durante la transición:

- **Legacy/Beta/V3:** Markdown en `content/items/` conserva el canon histórico y
  sus JSON son derivados cuando aplica.
- **V4:** el JSON definido por `content/question-bank-v4/CONTRATO-EDITORIAL-V4.md`
  es canónico porque los reactivos se producen nuevos, completos y auditados; no
  se deriva de Markdown legacy.

La coexistencia no autoriza mezclar formatos ni activar V4 sin la migración y los
gates de `docs/database/question-bank-v4-contract.md`.

## Tres capas editoriales distintas

La arquitectura de contenido distingue:

1. **conocimiento fuente** — normas, teoría, guías, documentos técnicos y temarios;
2. **reactivos/taxonomía** — preguntas y clasificación de qué se evalúa;
3. **targeting** — familia, perfil/cargo y OPEC a los que aplica el contenido.

Rutas de referencia:

```text
content/knowledge-base/   # conocimiento fuente reutilizable
content/targeting/        # familias, perfiles/cargos y OPEC
content/question-bank-v4/ # reactivos V4
```

Diseño canónico de evolución:

`docs/03-architecture/question-bank-knowledge-targeting-architecture.md`

## Identidad canónica

Se adopta este criterio:

- `content_id` editorial estable identifica al reactivo;
- `slug` es identificador funcional/humano cuando el contrato lo use;
- UUID de DB es identidad técnica persistente para sesiones e historial;
- `profile_code` identifica un cargo/perfil reusable;
- `opec_id` identifica una instancia concreta de convocatoria/entidad;
- una fuente de conocimiento debe tener identidad propia para poder relacionarse con múltiples reactivos y destinos.

## Estructura editorial del banco

La estructura sigue siendo híbrida, pero con responsabilidades claras:

- organización temática: `area/domain -> subarea/topic -> competency`;
- targeting: familia -> perfil/cargo -> OPEC;
- biblioteca de conocimiento: fuente única + mapas de aplicabilidad;
- la carpeta física del reactivo no reemplaza ninguno de esos metadatos.

## Perfiles docentes actuales

Catálogo inicial de perfiles/cargos docentes:

- `rector_director_rural`
- `coordinador`
- `docente_aula_preescolar`
- `docente_aula_basica_primaria`
- `docente_aula_secundaria_media`
- `docente_orientador`

El perfil/cargo y la OPEC se comportan como destinos equivalentes para selección,
pero no deben compartir identidad técnica: varias OPEC pueden pertenecer al mismo
perfil y heredar su base común.

## Modelo Legacy/Beta/V3

Los ítems Markdown actuales conservan campos principales como:

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

Y una segunda capa histórica/opcional:

- `targetRole`
- `targetPosition`
- `applicantProfile`
- `tags`

Esta segunda capa es antecedente del targeting normalizado futuro; no se debe
prolongar como texto libre sin catálogo.

## Modelo V4

V4 mantiene su contrato congelado actual. Los 248 reactivos aprobados no deben
reescribirse para insertar targeting nuevo sin un cambio explícito de contrato,
validador, importador y `MANIFEST.json`.

Para V4 actual:

- `domain`, `topic`, `competency`, `questionType`, `cognitiveLevel` describen el constructo;
- `scope = general|opec_specific` mantiene el alcance editorial vigente;
- `opecId` solo corresponde cuando el contrato lo exige;
- la segmentación por perfil/cargo puede añadirse externamente en una evolución posterior.

## Biblioteca de conocimiento

`content/knowledge-base/` es la ruta objetivo para consolidar:

- normativa;
- literatura académica;
- documentos técnicos;
- guías;
- temarios y blueprints;
- mapas de aplicabilidad por familia/perfil/OPEC.

Una fuente se almacena/identifica una vez. No se copia por cargo.

El Markdown de temas docentes que originó la expansión debe ubicarse, desde el
archivo original, en:

```text
content/knowledge-base/themes/docentes/temario-base.md
```

`content/normative/` permanece como fuente histórica a inventariar antes de una
consolidación física.

## Relación con la base de datos

La identidad de reactivo sigue en `item_bank` y las opciones en `item_options`.

Evolución recomendada, sin alterar migraciones ya aplicadas:

- `target_families`
- `target_profiles`
- `opec_catalog`
- `item_target_profiles`
- `item_opec_targets`
- `knowledge_sources`
- `knowledge_source_targets`
- `item_source_links`

Esto evita duplicar reactivos o normas y permite herencia de aplicabilidad:

```text
OPEC → perfil/cargo → familia
```

El campo existente `item_bank.opec_id` se conserva durante la transición por
compatibilidad, pero no debe convertirse en el único mecanismo futuro de targeting.

## Reglas editoriales

- una pregunta no se duplica por perfil u OPEC;
- un perfil no sustituye `area/domain`, `topic` o `competency`;
- una OPEC no se convierte en topic;
- una fuente no se duplica por destinatario;
- targeting multi-perfil debe modelarse mediante relaciones, no arrays/texto libre si se persiste en DB;
- el mapeo de los 248 V4 existentes a perfiles requiere revisión editorial; no inferirlo automáticamente por palabras clave;
- una fuente debe declarar procedencia, vigencia/fecha de consulta y localizador cuando aplique.

## Persistencia y runtime

La persistencia Legacy/Beta/V3 y V4 mantiene sus contratos existentes mientras la
evolución normalizada no sea aprobada y migrada.

Referencias obligatorias:

- `docs/database/question-bank-v4-contract.md`
- `docs/database/prd-question-bank-v4-supabase.md`
- `docs/03-architecture/question-bank-knowledge-targeting-architecture.md`

La existencia de esta arquitectura documental no implica que las tablas de targeting
o conocimiento ya existan en Supabase ni que V4 esté activo en runtime.
