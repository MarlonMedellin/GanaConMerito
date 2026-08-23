# Contrato de persistencia y lectura del banco V4

**Estado:** propuesto; no ejecutar cambios de producción solo a partir de este documento.
**Precondición:** un ítem debe cumplir
`content/question-bank-v4/CONTRATO-EDITORIAL-V4.md` y haber sido auditado.

## Objetivo

Adoptar V4 sin romper sesiones, historial ni el banco activo actual. La tabla
`item_bank` sigue siendo la identidad técnica de un ítem; V4 añade una frontera de
origen, metadatos estructurados y un contrato de lectura que no expone respuestas
al cliente antes de tiempo.

La evolución de perfiles/cargos/OPEC y biblioteca de conocimiento se documenta en:

`docs/03-architecture/question-bank-knowledge-targeting-architecture.md`

Esa evolución es aditiva y no autoriza reescribir el corte V4 congelado.

## Diseño recomendado

No crear una segunda tabla de preguntas inicialmente. Extender `item_bank` y
`item_options`, conservar el UUID existente para sesiones y registrar los detalles
editoriales V4 en columnas consultables más un JSONB de trazabilidad.

Columnas V4 existentes/propuestas según la secuencia de migración real:

| Columna | Tipo | Regla |
|---|---|---|
| `bank_version` | `text` | `legacy`, `v3` o `v4`; indexada |
| `editorial_scope` | `text` | `general` u `opec_specific` |
| `topic_code` | `text` | valor de `taxonomy/topics.json` |
| `question_type` | `text` | valor del catálogo V4 |
| `cognitive_level` | `text` | valor del catálogo V4 |
| `source_reference` | `text` | obligatorio para V4 |
| `source_locator` | `text null` | artículo, sección o página cuando aplique |
| `source_url` | `text null` | URL oficial o académica si existe |
| `approval_status` | existente | solo `approved` es elegible para activación |
| `editorial_metadata` | existente `jsonb` | conservar tutoría, auditoría y trazabilidad de importación |

`opec_id`, `area`, `competency`, `difficulty`, `source_path`, `status`,
`is_active` y `thematic_nucleus_id` ya existen y deben reutilizarse. No guardar la
respuesta correcta, fuente o explicaciones únicamente dentro de JSONB: sus campos
mínimos deben poder filtrarse y auditarse.

## Taxonomía y targeting son ejes distintos

El contrato debe preservar esta separación:

- `area`/`domain`, `topic_code`, `competency`, `question_type` y
  `cognitive_level` describen **qué se evalúa**;
- familia, perfil/cargo y OPEC describen **a quién aplica**.

No introducir cargos como topics ni inferir el cargo desde el texto del reactivo.

Para docentes, el catálogo de perfiles inicial esperado es:

- `rector_director_rural`;
- `coordinador`;
- `docente_aula_preescolar`;
- `docente_aula_basica_primaria`;
- `docente_aula_secundaria_media`;
- `docente_orientador`.

Una OPEC concreta debe mapear a uno de estos perfiles o a un perfil futuro
controlado. El perfil es estable entre convocatorias; `opec_id` identifica una
instancia concreta.

## Evolución normalizada de targeting

El campo actual `item_bank.opec_id` se conserva para compatibilidad, pero no debe
ser la única representación futura de aplicabilidad porque:

- un reactivo puede ser común a toda una familia;
- un reactivo puede servir a varios perfiles;
- varias OPEC pueden compartir un mismo perfil/cargo;
- duplicar la misma pregunta por OPEC degrada deduplicación y mantenimiento.

Cuando se autorice la evolución, se recomienda crear mediante migraciones nuevas:

### `target_families`
Catálogo de familias amplias de preparación/concurso.

### `target_profiles`
Catálogo de perfiles/cargos canónicos, asociado a una familia.

### `opec_catalog`
Catálogo de OPEC concretas, cada una mapeada a un `target_profile`.

### `item_target_profiles`
Relación many-to-many entre reactivos y perfiles. Debe permitir distinguir al menos
perfil `primary` y `compatible`.

### `item_opec_targets`
Relación many-to-many para reactivos verdaderamente `opec_specific`.

El selector futuro puede entonces resolver:

```text
OPEC → perfil/cargo → familia
```

y combinar preguntas OPEC-specific + de perfil + comunes de familia antes de
aplicar taxonomía, dificultad y estrategia adaptativa.

## Evolución normalizada de fuentes

`source_reference`, `source_locator` y `source_url` continúan siendo suficientes
para el contrato inicial V4, pero la biblioteca compartida requerirá posteriormente:

- `knowledge_sources`;
- `knowledge_source_targets`;
- `item_source_links`.

Esto permite registrar una norma o guía una sola vez y relacionarla con múltiples
familias, perfiles, OPEC y reactivos. La biblioteca de repositorio vive en
`content/knowledge-base/`.

Durante la transición, `source_reference` puede actuar como dato denormalizado de
la fuente decisiva del reactivo.

## Reglas de integridad recomendadas

La migración V4 debe añadir/verificar `CHECK` para `bank_version`,
`editorial_scope`, `question_type`, `cognitive_level` y estados editoriales. También
debe exigir para V4: cuatro opciones A–D únicas, `source_reference`, `source_path`
bajo `content/question-bank-v4/`, `approval_status = 'approved'` para activación y
`opec_id` cuando `editorial_scope = 'opec_specific'` mientras se use el contrato
actual.

Las validaciones complejas —paridad de claves de opciones/explicaciones,
taxonomías leídas desde archivos, targeting multi-perfil y ausencia de duplicación
conceptual— pertenecen al importador/auditor y a relaciones normalizadas, no a
constraints SQL frágiles o arrays de texto libre.

## Vista de lectura

`public.v_question_bank_v4_active` debe exponer únicamente ítems elegibles según el
estado operativo real de las migraciones, preservando como mínimo:

1. `bank_version = 'v4'`;
2. `status = 'published'`, `is_active = true` e `is_published = true`;
3. `approval_status = 'approved'`;
4. `pilot_status` en el estado autorizado;
5. `source_path like 'content/question-bank-v4/%'`;
6. núcleo temático activo cuando el selector lo requiera.

La proyección pública no incluye `correct_option`, explicaciones, `learningNote` ni
fuente completa antes de responder. La proyección post-respuesta puede devolver el
feedback autorizado.

La evolución de targeting debe incorporarse sin romper este límite de seguridad y
sin convertir joins de perfiles/OPEC en una vía para exponer campos reservados.

## Importación y activación

1. Validar JSON contra el contrato V4 y catálogos locales.
2. Ejecutar la auditoría adversarial y comprobar `APPROVED`.
3. Importar de modo idempotente por `content_id`/`slug`, usando la función V4
   versionada vigente.
4. Guardar opciones en `item_options` y metadatos tutor/auditoría en
   `editorial_metadata`.
5. Dejar inicialmente `is_active = false` hasta completar pruebas y aprobación.
6. Activar mediante una operación explícita y auditable, nunca por el importador.
7. Cuando exista targeting normalizado, asociar perfiles/OPEC en un paso separado y
   auditable; no inferirlos silenciosamente a partir del texto.

## RLS y seguridad

- El `service_role` importa; los usuarios no insertan ni aprueban contenido.
- Las vistas públicas usan `security_invoker` y políticas que permitan solo el
  subconjunto publicado/autorizado.
- Ningún endpoint del navegador consulta `item_bank` con una columna de clave.
- La evaluación de `selectedOption` ocurre en una ruta de servidor autenticada.
- Los catálogos de perfil/OPEC pueden ser legibles según necesidad de producto, pero
  las relaciones editoriales sensibles y las fuentes completas no deben ampliar el
  acceso a respuestas.

## Migración en fases

1. Estabilizar contrato, importador, vistas y seguridad V4 actuales.
2. Validar una cohorte V4 en staging/piloto sin activar automáticamente el corpus.
3. Mantener rollback por `is_active = false` y `bank_version`, sin borrar filas.
4. Definir y aprobar catálogo de familias/perfiles/OPEC.
5. Crear migraciones nuevas para targeting normalizado; no editar migraciones ya
   aplicadas.
6. Crear migraciones posteriores para biblioteca de conocimiento si se decide
   persistirla en Supabase.
7. Backfill de perfiles/OPEC solo con mapa editorial revisado.
8. Cambiar el selector de forma controlada y probar herencia OPEC → perfil → familia.
