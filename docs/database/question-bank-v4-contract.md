# Contrato de persistencia y lectura del banco V4

**Estado:** propuesto; no ejecutado en Supabase.
**Precondición:** un ítem debe cumplir
`content/question-bank-v4/CONTRATO-EDITORIAL-V4.md` y haber sido auditado.

## Objetivo

Adoptar V4 sin romper sesiones, historial ni el banco activo actual. La tabla
`item_bank` sigue siendo la identidad técnica de un ítem; V4 añade una frontera de
origen, metadatos estructurados y un contrato de lectura que no expone respuestas
al cliente antes de tiempo.

## Diseño recomendado

No crear una segunda tabla de preguntas inicialmente. Extender `item_bank` y
`item_options`, conservar el UUID existente para sesiones y registrar los detalles
editoriales V4 en columnas consultables más un JSONB de trazabilidad.

Columnas que debe agregar una migración nueva y reversible:

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
| `approval_status` | existente | V4 inicia `pending_approval`; solo `approved` es legible |
| `editorial_metadata` | existente `jsonb` | conservar `hint`, `learningNote`, explicaciones por opción, resultado de auditoría y trazabilidad de importación |

`opec_id`, `area`, `competency`, `difficulty`, `source_path`, `status`,
`is_active` y `thematic_nucleus_id` ya existen y deben reutilizarse. No guardar la
respuesta correcta, fuente o explicaciones únicamente dentro de JSONB: sus campos
mínimos deben poder filtrarse y auditarse.

## Reglas de integridad recomendadas

La migración debe añadir `CHECK` para `bank_version`, `editorial_scope`,
`question_type`, `cognitive_level` y estados editoriales. También debe exigir para
V4: cuatro opciones A–D únicas, `source_reference`, `source_path` bajo
`content/question-bank-v4/`, `approval_status = 'approved'` para activación y
`opec_id` cuando `editorial_scope = 'opec_specific'`.

Las validaciones complejas —paridad de claves de opciones/explicaciones,
taxonomías leídas desde archivos y ausencia de duplicación conceptual— pertenecen
al importador TypeScript y al auditor, no a constraints SQL frágiles.

## Vista de lectura propuesta

Crear `public.v_question_bank_v4_active` con `security_invoker = true`. Debe
exponer únicamente ítems con:

1. `bank_version = 'v4'`;
2. `status = 'published'`, `is_active = true` y `is_published = true`;
3. `approval_status = 'approved'`;
4. `pilot_status` en el estado que se autorice para producción;
5. `source_path like 'content/question-bank-v4/%'`;
6. núcleo temático activo cuando el selector lo requiera.

Crear además una vista o función de detalle para servidor que una `item_bank` e
`item_options`. La proyección pública no incluye `correct_option`, explicaciones,
`learningNote` ni fuente completa antes de responder. La proyección post-respuesta
puede devolver el feedback autorizado.

## Importación y activación

1. Validar JSON contra el contrato V4 y catálogos locales.
2. Ejecutar la auditoría adversarial y comprobar `APPROVED`.
3. Importar de modo idempotente por `content_id`/`slug`, usando una nueva función
   `upsert_content_item_v4(...)` o una firma versionada; no cambiar la firma actual
   de `upsert_content_item(...)` durante la transición.
4. Guardar las opciones en `item_options` y los campos tutor en `editorial_metadata`.
5. Dejar inicialmente `is_active = false` hasta completar pruebas de importación,
   lectura y una aprobación editorial humana.
6. Activar mediante una operación explícita y auditable, nunca por el importador.

## RLS y seguridad

- El `service_role` importa; los usuarios no insertan ni aprueban contenido.
- Las vistas públicas usan `security_invoker` y políticas que permitan solo el
  subconjunto publicado/autorizado.
- Ningún endpoint del navegador consulta `item_bank` con una columna de clave.
- La evaluación de `selectedOption` ocurre en una ruta de servidor autenticada.

## Migración en fases

1. Crear migración V4 y tests SQL sin tocar la vista activa actual.
2. Construir importador V4 en modo `--dry-run`; después probar en un entorno de
   staging con uno o pocos ítems.
3. Validar vista V4, RLS, selección y feedback post-respuesta.
4. Cargar una cohorte piloto con `is_active = false` y revisar editorialmente.
5. Activar una cohorte aprobada y cambiar el selector de forma controlada.
6. Medir errores, tiempos, tasa de respuesta y calidad; mantener rollback por
   `is_active = false` y `bank_version`, sin borrar filas.
