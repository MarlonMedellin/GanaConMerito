# PRD — Migración de Question Bank V4 en Supabase

**Estado:** propuesto. No ejecutar cambios directamente en producción sin aplicar
las migraciones versionadas desde el repositorio.

## 1. Resultado esperado

Supabase almacena, valida y sirve el banco V4 con trazabilidad editorial, acceso
seguro y una lectura predeterminada V4. Los datos Beta/V3/legacy permanecen
intactos e inaccesibles para selección por defecto después del corte.

## 2. Decisiones de modelo

- Mantener `public.item_bank` como tabla principal y `public.item_options` para
  las opciones A–D.
- No crear una tabla paralela de preguntas en la primera adopción V4.
- Añadir frontera explícita por versión y vistas de lectura separadas.
- Mantener el UUID existente como identidad técnica para sesiones e historial.
- Usar JSONB solo para detalle editorial/tutor; guardar campos filtrables en
  columnas estructuradas.
- Separar **taxonomía** (qué se evalúa) de **targeting** (a quién aplica).
- Tratar perfil/cargo y OPEC como destinos equivalentes para selección, pero no
  como el mismo identificador: el perfil/cargo es reusable y la OPEC es una
  instancia concreta de convocatoria/entidad.
- Una pregunta puede aplicar a varios perfiles; por ello la evolución posterior
  debe admitir relaciones many-to-many y evitar duplicar reactivos por cargo.
- La base de conocimiento normativa/académica/técnica debe normalizarse como una
  capa reutilizable y no copiarse por cada perfil u OPEC.

Arquitectura de referencia:

`docs/03-architecture/question-bank-knowledge-targeting-architecture.md`

## 3. Migraciones requeridas

### M-0019 — Contrato de columnas V4

Crear `supabase/migrations/0019_question_bank_v4_contract.sql` (reconfirmar el
siguiente número disponible antes de crear el archivo) para añadir:

| Columna | Tipo | Regla |
|---|---|---|
| `bank_version` | `text not null` | `legacy`, `v3`, `v4` |
| `editorial_scope` | `text null` | `general` u `opec_specific` para V4 |
| `topic_code` | `text null` | catálogo V4 |
| `question_type` | `text null` | catálogo V4 |
| `cognitive_level` | `text null` | catálogo V4 |
| `source_reference` | `text null` | obligatorio para V4 |
| `source_locator` | `text null` | artículo, sección o página |
| `source_url` | `text null` | URL de evidencia si existe |

Agregar índices para `bank_version`, `editorial_scope`, `opec_id`, `topic_code` y
la combinación usada por el selector. Agregar constraints para valores válidos y
para exigir `source_reference`/`opec_id` cuando corresponda a V4.

> Nota de gobernanza: el repositorio puede contener ya artefactos con estos números.
> Antes de crear o modificar migraciones, verificar la secuencia real en
> `supabase/migrations/` y el historial aplicado en cada ambiente. No reutilizar ni
> reescribir una migración ya aplicada.

### M-0020 — Frontera urgente de respuestas

Revocar acceso directo de roles cliente a tablas/vistas con claves o explicaciones,
restringir RPC críticas a `service_role` y migrar las rutas de servidor antes de
aplicar los permisos. Artefacto: `0020_secure_question_answer_boundary.sql`.

### M-0021 — Escritura V4

Crear una función nueva `public.upsert_content_item_v4(...)`; no modificar ni
reutilizar la firma actual de `upsert_content_item(...)`. La función debe:

- insertar/actualizar el ítem y reescribir sus cuatro opciones atómicamente;
- guardar metadatos de tutoría y auditoría en `editorial_metadata`;
- definir `bank_version = 'v4'` y `source_path` V4;
- iniciar en `status = 'draft'`, `is_published = false`, `is_active = false` y
  `approval_status = 'pending_approval'`;
- devolver el UUID e información de versión para el importador.

### M-0022 — Vistas de lectura y RLS

Crear:

- `v_question_bank_v4_active`: solo V4 publicado, aprobado, activo y elegible.
- `v_question_bank_v4_practice`: proyección sin `correct_option`, explicaciones ni
  `learningNote`, apta para entregar antes de responder.
- `v_question_bank_v4_answered`: lectura exclusiva de servidor para feedback
  posterior autorizado.

Usar `security_invoker = true`, grants mínimos y RLS alineada con los endpoints
actuales. Ninguna vista accesible al navegador expone claves o explicaciones.

### M-0023 — Corte de fuente predeterminada

Después del piloto, actualizar `v_item_bank_active` o el repositorio de selección
para que solo el banco V4 autorizado sea predeterminado. Preservar una vista de
lectura histórica para diagnóstico y rollback, sin selección automática.

### Evolución posterior — targeting y knowledge graph

No mezclar esta evolución con el corte inicial V4 si todavía no está estabilizado.
Cuando se autorice, crear migraciones nuevas y monotónicas para incorporar:

#### Catálogos de destinatarios

- `target_families`: familias amplias de preparación/concurso;
- `target_profiles`: cargos/perfiles canónicos reusables;
- `opec_catalog`: OPEC concretas, cada una asociada a un perfil/cargo.

Para la familia docente el catálogo inicial debe poder representar:

- `rector_director_rural`;
- `coordinador`;
- `docente_aula_preescolar`;
- `docente_aula_basica_primaria`;
- `docente_aula_secundaria_media`;
- `docente_orientador`.

#### Relaciones de aplicabilidad

- `item_target_profiles(item_id, profile_id, target_kind)`;
- `item_opec_targets(item_id, opec_id)`.

El campo existente `item_bank.opec_id` se conserva durante la transición por
compatibilidad, pero no debe ser la única representación futura de aplicabilidad.

#### Biblioteca de conocimiento

- `knowledge_sources`: identidad y metadatos de normas, teoría, guías, documentos
  técnicos y temarios;
- `knowledge_source_targets`: relación de una fuente con familia/perfil/OPEC;
- `item_source_links`: relación entre reactivo y una o varias fuentes, con
  `relation_type` y localizador.

`source_reference`, `source_locator` y `source_url` pueden mantenerse como datos
denormalizados de la fuente principal durante la transición.

## 4. Datos y activación

1. Hacer backup verificable y registrar conteos de `item_bank`, `item_options`,
   sesiones y turnos antes de cada migración.
2. Aplicar M-0019 a M-0022 en staging cuando corresponda al historial real.
3. Importar una cohorte V4 usando dry-run y después aplicación controlada.
4. Verificar opciones, estado, fuente, OPEC, vista de práctica y vista posterior.
5. Aprobar editorialmente la cohorte y activar de forma explícita.
6. Repetir en producción con una cohorte pequeña.
7. Aplicar el corte de fuente predeterminada únicamente cuando el piloto y las
   pruebas de runtime estén aprobados.
8. Adoptar targeting/perfiles y knowledge graph como evolución aditiva posterior,
   con migraciones separadas y backfill explícitamente auditado.

No se migran datos legacy a V4: se importan reactivos V4 nuevos. No se borran filas
legacy/V3 ni datos de sesiones durante este proyecto.

El corte editorial V4 congelado tampoco debe reescribirse para agregar perfiles.
El mapeo inicial de los reactivos existentes puede residir en relaciones externas y
solo debe backfillearse con evidencia editorial validada.

## 5. Pruebas obligatorias

- tests SQL de constraints, función de upsert, vistas y RLS;
- importación idempotente y rechazo de JSON incompleto/no aprobado;
- prueba de que `v_question_bank_v4_practice` no devuelve clave ni feedback;
- prueba de que la vista posterior autorizada devuelve la explicación correcta;
- integración de `session/start`, `session/item` y `session/advance`;
- E2E autenticada y smoke de runtime tras cada activación;
- verificación de rollback por desactivación sin pérdida de historial;
- para targeting futuro: tests de herencia `OPEC → perfil → familia`;
- prueba de que un reactivo multi-perfil no se duplica físicamente;
- prueba de que una OPEC solo hereda preguntas del perfil/familia correctos;
- pruebas de integridad referencial entre fuentes, perfiles, OPEC y reactivos.

## 6. Criterios de corte

V4 puede ser fuente predeterminada solo cuando:

1. existe una cohorte V4 suficiente y aprobada;
2. la vista de práctica devuelve exclusivamente V4;
3. no existe fuga de clave antes de responder;
4. los filtros activos tienen cobertura V4;
5. importación, API, UI, RLS y E2E pasan;
6. existe evidencia de piloto y plan de rollback probado.

La incorporación de targeting normalizado tiene además estos criterios:

7. existe catálogo controlado de perfiles/cargos;
8. cada OPEC cargada puede resolverse a un perfil canónico;
9. el selector distingue preguntas comunes, de perfil y OPEC-specific;
10. no se depende de texto libre para inferir cargos en runtime.

## 7. Operación posterior

- El importador usa `service_role` solo en servidor/CI seguro.
- La activación/desactivación se registra en una operación auditable.
- Nuevos ítems V4 permanecen inactivos hasta aprobación editorial y técnica.
- Las métricas de uso y respuesta se registran sin alterar el historial legacy.
- El catálogo de OPEC debe ser versionable/auditable por convocatoria.
- Los perfiles/cargos se mantienen como catálogo estable; una nueva OPEC se mapea a
  uno de ellos o requiere una decisión explícita de catálogo.
- La biblioteca de conocimiento no se expone al cliente como sustituto del contrato
  seguro de preguntas; sirve para trazabilidad, generación, auditoría y gestión.
