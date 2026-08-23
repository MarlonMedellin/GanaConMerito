# Modelo de datos resumido

## Tablas principales actuales

### `profiles`
Perfil base del usuario autenticado.

### `learning_profiles`
Perfil pedagógico y meta activa del usuario.

### `sessions`
Sesiones de práctica, simulacro o revisión.

### `session_turns`
Turnos individuales dentro de una sesión.

### `item_bank`
Banco principal de preguntas.

### `item_options`
Opciones asociadas a cada ítem.

### `evaluation_events`
Resultado evaluativo por turno.

### `user_topic_stats`
Estadística agregada por usuario y competencia.

### `user_skill_snapshots`
Memoria comprimida por usuario.

## Reglas estructurales relevantes

- `difficulty` entre `0` y `1`
- `correct_option` en `A|B|C|D`
- `selected_option` en `A|B|C|D`
- `confidence_self_report` entre `1` y `5`
- `unique(item_id, option_key)` en `item_options`
- `unique(session_id, turn_number)` en `session_turns`
- `unique(profile_id, area, competency)` en `user_topic_stats`
- `content_id` único en `item_bank`
- `target_role` y `exam_type` restringidos por CHECK para el dominio actual

## V4: clasificación vs destinatario

Para V4 deben mantenerse dos ejes separados:

- **taxonomía:** dominio/área, tópico, competencia, tipo de pregunta, nivel cognitivo y dificultad;
- **targeting:** familia de concurso, perfil/cargo y OPEC específica.

Una OPEC concreta puede mapear al mismo perfil/cargo que otras OPEC. Un reactivo
puede ser común a varios perfiles y no debe duplicarse físicamente por esa razón.

Arquitectura de referencia:

`docs/03-architecture/question-bank-knowledge-targeting-architecture.md`

## Administración del importador V4 y foundation PRD 3 (`0028–0030`)

La migración versionada `0028_atomic_v4_batch_import.sql`, aplicada en producción
sin ejecutar todavía el lote, añade:

- `question_bank_v4_manifests`: SHA fuente, hashes y conteo del corte congelado;
- `question_bank_v4_taxonomy_snapshot`: valores exactos aceptados por ese lote;
- `question_bank_v4_import_runs`: estado, tiempos, error seguro y reconciliación;
- `import_question_bank_v4_batch(...)`: operación transaccional exclusiva de
  `service_role`.

Estas tablas son administrativas, tienen RLS y no otorgan acceso a `anon` ni
`authenticated`. El snapshot valida la taxonomía del manifiesto importado; no es
el futuro catálogo de targeting ni sustituye la capa de conocimiento.

La migración monotónica `0029_harden_v4_manifest_reconciliation.sql`, validada
localmente y pendiente de aplicación remota, fija el hash exacto del plan canónico,
detecta deriva real de columnas/opciones y amplía la reconciliación transaccional.
No contiene targeting ni modifica el corpus congelado.

La migración aditiva `0030_targeting_knowledge_foundation.sql` está implementada
en una rama aislada y validada con reconstrucción local `0001–0030`, pruebas de
integridad y frontera de permisos. No fue aplicada en un ambiente Supabase remoto.
No modifica el corte editorial V4 congelado, `item_bank`, sus UUID, sus vistas
seguras ni `item_bank.opec_id`.

## Foundation de targeting y conocimiento — implementada en rama (`0030`)

`0030` incorpora persistencia normalizada y aditiva para separar destinatarios,
fuentes y reactivos sin convertir targeting en taxonomía.

### `target_families`
Familias amplias de preparación/concurso. La migración siembra únicamente la
familia canónica `docentes`.

### `target_profiles`
Perfiles/cargos canónicos reusables. Para docentes, el catálogo inicial contempla
rector/director rural, coordinador, docente de aula preescolar, básica primaria,
secundaria/media y docente orientador. No añade perfiles por disciplina.

### `opec_catalog`
OPEC concretas de una convocatoria/entidad, cada una mapeada a un perfil/cargo y
familia. La tabla queda vacía: `0030` no inventa ni importa OPEC.

### `item_target_families`
Relación many-to-many para targets de familia ya admitidos por el contrato
editorial. Evita expandir artificialmente una familia a todos sus perfiles.

### `item_target_profiles`
Relación many-to-many entre `item_bank` y perfiles/cargos, con estado de revisión,
evidencia y auditoría. Queda sin backfill.

### `item_opec_targets`
Relación many-to-many para reactivos verdaderamente específicos de una OPEC, con
estado de revisión y evidencia. Queda sin backfill.

### `knowledge_sources`
Catálogo de normas, teoría, guías, documentos técnicos y temarios, con estado de
verificación. Queda vacío y ninguna fuente se declara verificada.

### `knowledge_source_targets`
Aplicabilidad revisable de una fuente como común o dirigida a familia,
perfil/cargo u OPEC. Una relación activa exige fuente verificada y auditoría.

### `item_source_links`
Relación reactivo-fuente con tipo de relación y localizador. Queda sin backfill.

Las nueve tablas habilitan RLS, no conceden acceso a `anon` ni `authenticated` y
reservan CRUD a `service_role`. Este documento describe el SQL versionado en la
rama; no declara que el esquema esté desplegado. Antes de aplicar `0030` se debe
reconfirmar por separado el historial, recuperación, seguridad y datos del ambiente
objetivo dentro de una ventana autorizada.

## Compatibilidad de transición

- `item_bank` continúa siendo la identidad técnica del reactivo;
- `item_bank.opec_id` se conserva durante la transición;
- `source_reference`, `source_locator` y `source_url` pueden funcionar como datos
  denormalizados de la fuente principal;
- las nuevas relaciones no deben romper las vistas V4 seguras ni exponer claves;
- el corte V4 congelado no debe reescribirse para insertar targeting sin un cambio
  explícito de contrato y manifiesto.

## Trazabilidad operativa

Tienen `updated_at`:
- `profiles`
- `learning_profiles`
- `item_bank`
- `user_topic_stats`
- `sessions`
- `session_turns`
- `user_skill_snapshots`
- `evaluation_events`

La implementación `0030` añade `created_at` y `updated_at` a sus catálogos y
relaciones, además de estados y campos de evidencia/revisión donde aplica.

## Contrato activo de lectura del banco

Para consumo seguro de la app, la lectura del banco no debe quedar acoplada a
`item_bank` crudo.

Referencias canónicas de diseño:

- `docs/database/active-question-bank-contract.md`
- `docs/database/question-bank-v4-contract.md`
- `docs/database/prd-question-bank-v4-supabase.md`

## Fuente ejecutable

La definición real del esquema vigente vive en `supabase/migrations/`. Los documentos
de arquitectura describen intención y evolución; las migraciones efectivamente
aplicadas prevalecen como hecho operativo.
