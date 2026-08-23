# PRD — Migración de Question Bank V4 en Supabase

**Estado:** base `0019–0027` materializada; importador atómico `0028` implementado y
validado en Supabase local aislado. No aplicado en producción.

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

## 3. Secuencia versionada real

Las migraciones `0019–0027` ya existen en el repositorio y no deben modificarse.
El historial remoto fue auditado en modo lectura y coincide hasta `0027`. La nueva
operación usa el siguiente número libre, `0028`.

### M-0019 — Contrato de columnas V4 (materializada)

`supabase/migrations/0019_question_bank_v4_contract.sql` añade:

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

> Regla de gobernanza: verificar la secuencia real en `supabase/migrations/` y el
> historial aplicado en cada ambiente. No reutilizar ni reescribir migraciones.

### M-0020 a M-0027 — Seguridad y runtime V4 (materializadas)

Esta secuencia incorpora la frontera de respuestas, el upsert unitario V4, las
vistas seguras, métricas shadow, políticas server-only y ajustes de runtime. Sus
definiciones ejecutables viven en `supabase/migrations/`.

### M-0028 — Importación V4 atómica y auditable

`supabase/migrations/0028_atomic_v4_batch_import.sql` añade, sin reescribir la
historia:

- `question_bank_v4_manifests`, registro del corte congelado con SHA, hashes y conteo;
- `question_bank_v4_taxonomy_snapshot`, catálogo exacto usado para validar el lote;
- `question_bank_v4_import_runs`, trazabilidad de inicio, final, estado, error seguro
  y reconciliación;
- `import_question_bank_v4_batch(candidates, plan_hash, expected_count, source_sha)`,
  función `SECURITY DEFINER`, `search_path` fijo y acceso exclusivo de
  `service_role`;
- validación completa del lote antes de escribir y reutilización del upsert unitario
  solo después de superar ese gate;
- rollback de todas las preguntas/opciones ante cualquier falla, conservando una
  fila administrativa segura de la ejecución fallida;
- reconciliación idempotente y desactivación, nunca borrado, de V4 históricas
  ausentes del manifiesto;
- vistas pre-respuesta sin clave ni explicaciones y vista post-respuesta reservada
  a servidor.

Toda pregunta importada queda `draft`, inactiva, no publicada y fuera del piloto.
La migración fue reconstruida y ensayada localmente desde cero; su aplicación en
staging remoto y producción requiere autorización separada.

La ejecución en producción conserva las protecciones de los entornos aislados y
añade un gate específico en el importador versionado. Debe coincidir de forma
exacta el proyecto Supabase esperado, el SHA Git comprobado, el árbol debe estar
limpio y la confirmación debe incorporar el hash y conteo del plan canónico. Este
gate no autoriza activación, despliegue de aplicación, cambios del manifiesto ni
migraciones posteriores a `0028`.

### M-0029 — Anclaje canónico y reconciliación fuerte (checkpoint)

`supabase/migrations/0029_harden_v4_manifest_reconciliation.sql` se creó después
de aplicar `0028` sin ejecutar el lote. Añade el hash de plan esperado al manifiesto
administrativo, rechaza cargas alternativas y solo declara una fila `unchanged`
cuando columnas, metadata y opciones A–D coinciden realmente. También verifica el
estado final completo dentro de la transacción. Está validada en base local y no
aplicada en producción al cierre del checkpoint.

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
2. Confirmar que el ambiente objetivo esté alineado hasta `0027`.
3. Aplicar `0028` solo en una rama/base aislada autorizada.
4. Ejecutar dry-run y después una única llamada batch controlada.
5. Verificar opciones, estado, fuente, OPEC, vista de práctica y vista posterior.
6. Aprobar editorialmente la cohorte y activar de forma explícita.
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

- reconstrucción desde cero de todas las migraciones en Supabase aislado;
- importación completa, segunda ejecución idempotente y rollback intermedio;
- rechazo de JSON inválido, ID duplicado, hash y conteo incorrectos;
- preservación inactiva de filas V4 históricas;
- pruebas de constraints, función de upsert, vistas, grants y RLS;
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
