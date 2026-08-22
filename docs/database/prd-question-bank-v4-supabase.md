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

## 4. Datos y activación

1. Hacer backup verificable y registrar conteos de `item_bank`, `item_options`,
   sesiones y turnos antes de cada migración.
2. Aplicar M-0019 a M-0022 en staging.
3. Importar una cohorte V4 usando dry-run y después aplicación controlada.
4. Verificar opciones, estado, fuente, OPEC, vista de práctica y vista posterior.
5. Aprobar editorialmente la cohorte y activar de forma explícita.
6. Repetir en producción con una cohorte pequeña.
7. Aplicar M-0023 únicamente cuando el piloto y las pruebas de runtime estén
   aprobados.

No se migran datos legacy a V4: se importan reactivos V4 nuevos. No se borran filas
legacy/V3 ni datos de sesiones durante este proyecto.

## 5. Pruebas obligatorias

- tests SQL de constraints, función de upsert, vistas y RLS;
- importación idempotente y rechazo de JSON incompleto/no aprobado;
- prueba de que `v_question_bank_v4_practice` no devuelve clave ni feedback;
- prueba de que la vista posterior autorizada devuelve la explicación correcta;
- integración de `session/start`, `session/item` y `session/advance`;
- E2E autenticada y smoke de runtime tras cada activación;
- verificación de rollback por desactivación sin pérdida de historial.

## 6. Criterios de corte

V4 puede ser fuente predeterminada solo cuando:

1. existe una cohorte V4 suficiente y aprobada;
2. la vista de práctica devuelve exclusivamente V4;
3. no existe fuga de clave antes de responder;
4. los filtros activos tienen cobertura V4;
5. importación, API, UI, RLS y E2E pasan;
6. existe evidencia de piloto y plan de rollback probado.

## 7. Operación posterior

- El importador usa `service_role` solo en servidor/CI seguro.
- La activación/desactivación se registra en una operación auditable.
- Nuevos ítems V4 permanecen inactivos hasta aprobación editorial y técnica.
- Las métricas de uso y respuesta se registran sin alterar el historial legacy.
