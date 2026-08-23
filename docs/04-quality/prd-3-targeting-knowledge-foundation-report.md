# Reporte técnico — PRD 3 targeting/knowledge foundation

**Fecha:** 2026-08-23

**Estado:** implementación de rama validada localmente

**Migración:** `supabase/migrations/0030_targeting_knowledge_foundation.sql`

**Runtime/producción:** estado de datos e historial verificados en modo lectura;
`0030` no aplicada y sin escrituras remotas

## Resultado del bloque

`0030` implementa una foundation aditiva para persistir targeting y procedencia de
conocimiento sin modificar el banco V4 congelado. La secuencia `0001–0030` se
reconstruyó desde cero en Supabase local y las pruebas de contrato e integración
pasaron. Este cierre técnico local no autoriza ni declara aplicación remota.

## Alcance implementado

- catálogos `target_families`, `target_profiles` y `opec_catalog`;
- relaciones auditables `item_target_families`, `item_target_profiles` e
  `item_opec_targets`;
- catálogo `knowledge_sources` y relaciones `knowledge_source_targets` e
  `item_source_links`;
- una familia canónica `docentes` y los seis perfiles congelados;
- constraints de coherencia familia/perfil/OPEC, estados de revisión y evidencia;
- controles para impedir aplicabilidad activa de una fuente no verificada y para
  impedir degradar una fuente verificada mientras tenga targets activos, incluso
  bajo transacciones concurrentes;
- índices, timestamps, RLS y frontera administrativa reservada a `service_role`.

## Hallazgos adversariales corregidos

- se añadió `item_target_families` para persistir el `familyTarget` que ya admite
  el contrato congelado, sin expandirlo artificialmente a seis perfiles;
- el invariante `target activo => fuente verificada` ahora bloquea la fila fuente
  y resiste la carrera concurrente reproducida durante la auditoría;
- se eliminó de `0030` la clasificación no contractual de targets de perfil;
- la evidencia aprobada rechaza arrays vacíos, nulos o con texto en blanco;
- `verified_by` de la fuente es opcional para coincidir con el inventario canónico;
  las relaciones activas sí conservan `verified_at` y `verified_by` obligatorios.

## Invariantes preservados por diseño

- no se modifica `item_bank` ni se reemplaza `item_bank.opec_id`;
- no se reescriben los JSON V4, el manifiesto, la taxonomía ni UUID existentes;
- no se crean perfiles por disciplina;
- no se crean OPEC, fuentes verificadas, mappings de reactivos ni backfills;
- no se usa inferencia por palabras clave como targeting canónico;
- no se consume `content/knowledge-base/themes/docentes/temario-base.md` mientras
  permanezca abierta `V4-ARCH-DEBT-021`;
- no se conceden lecturas de las tablas nuevas a `anon` ni `authenticated`.

## Validación ejecutada

- reset completo de Supabase local con migraciones `0001–0030`: **PASS**;
- suite unitaria completa del repositorio: **PASS**;
- prueba estática del contrato `0030`, 5 casos: **PASS**;
- integración PostgreSQL loopback, transaccional y revertida: **PASS**;
- seed exacto de una familia y seis perfiles, con OPEC, fuentes y mappings en cero:
  **PASS**;
- constraints familia/perfil, OPEC activa/verificada, evidencia no vacía de mappings,
  fechas y formas de targets: **PASS**;
- triggers de fuente verificada con prueba concurrente, unicidad, RLS, grants y
  denegación efectiva a `anon`/`authenticated`: **PASS**;
- compatibilidad con `item_bank.opec_id` y las cinco vistas runtime existentes:
  **PASS**;
- validación V4: 248/248; importador dry-run: 248 candidatos y cero escrituras;
- ensayo atómico local: 248 importados, segunda ejecución 248 `unchanged`, rollback,
  reconciliación y siete fallos esperados: **PASS**;
- validación del corpus activo: 100 archivos, cero errores; validación documental:
  **PASS** con advertencias legacy preexistentes;
- lint de Supabase: sin hallazgos nuevos; persiste la advertencia previa por el
  parámetro no usado `p_previous_state` en `advance_session_atomic`;
- typecheck y `git diff --check`: **PASS**.

El preflight remoto de solo lectura confirmó historial aplicado `0001–0028`, 298
reactivos totales, 163 V4 con 652 opciones, cero V4 activas/publicadas/en piloto y
cero ejecuciones batch. `0029` y `0030` permanecen sin aplicar; las nueve tablas
de `0030` no existen remotamente, por lo que tampoco existen allí sus OPEC,
fuentes, mappings ni backfill. El runtime público declara `e1dc63b` y está 251
commits detrás del `master` observado; no hay evidencia de deploy de este gate.

La auditoría también produjo evidencia negativa crítica: aunque el historial
incluye `0020`, el esquema efectivo conserva grants/policies de cliente sobre
`item_bank`/`item_options` y una consulta REST anónima puede acceder a
`correct_option` en 120 filas activas. Las vistas V4 sí permanecen server-only.
Este drift bloquea escrituras, importación, activación y la apertura del PR draft
hasta que se explique o repare mediante un bloque autorizado separado.

Supabase reportó WAL-G habilitado, PITR deshabilitado y sin timestamps de backup
físico disponibles; no se autorizó ni realizó ninguna escritura remota.

## Límites operativos

No se aplicó `0029`/`0030`, no se ejecutó el lote V4, no se activaron reactivos y
no se realizó despliegue. No se abrió PR draft porque el gate remoto de seguridad
resultó negativo. Cualquier escritura o remediación requiere autorización y un
bloque independiente; este trabajo no modifica el runtime ni producción.

## Gate de integración tras PR #97

Corte remoto observado el **2026-08-23**:

- `master`: `12c620b3af461576d35ffa2e29342af962449db8`;
- PR #97 fusionado; sus contratos editoriales knowledge/targeting forman parte de
  ese `master`;
- esta rama fue rebaseada sobre el nuevo `master` sin conflictos textuales;
- PR #101, readiness canary: permanece draft sobre una base anterior; usa
  transitoriamente
  `professional_profiles`, catálogo OPEC de entorno e `item_bank.opec_id`, no las
  tablas normalizadas de `0030`.

La integración conservó los scripts knowledge/targeting incorporados por PR #97
y los gates PRD 3 en `package.json`. Se eliminó de `0030` y de la documentación
canónica la clasificación de targets de perfil que no existe en los schemas
machine-readable fusionados.

### Matriz contrato editorial → persistencia `0030`

| Contrato editorial del PR #97 | Persistencia `0030` | Regla de compatibilidad |
|---|---|---|
| familia `code/name/description/status` | `target_families` | identidad por `code`; `active` se representa con `is_active=true` |
| perfil `familyCode/profileCode/name/legacyApplicantProfile/status` | `target_profiles` | familia resuelta por código; seis perfiles canónicos; sin disciplinas |
| OPEC `sourceSystem/externalOpecId/familyCode/profileCode/...` | `opec_catalog` | identidad natural fuente+ID externo; perfil debe pertenecer a la familia |
| target de reactivo tipo `family` | `item_target_families` | relación explícita; no expandir automáticamente a todos los perfiles |
| target de reactivo tipo `profile` | `item_target_profiles` | relación directa; no añade clasificaciones ajenas al contrato |
| target de reactivo tipo `opec` | `item_opec_targets` | OPEC existente y revisión/evidencia preservadas |
| inventario de fuente | `knowledge_sources` | fuente `needs_review` permanece no verificada y sin targets activos |
| mapa knowledge `common/family/profile/opec` | `knowledge_source_targets` | una sola forma de target; estado `active` exige verificación completa |
| relación reactivo–fuente | `item_source_links` | solo evidencia editorial explícita; nunca inferida desde texto o keywords |

El corte machine-readable del PR #97 contiene una familia, seis perfiles, cero
OPEC, dos fuentes `needs_review`, cero mapas knowledge y cero mappings de
reactivos. Por tanto, cualquier importador futuro debe tratar archivos vacíos
como “sin instrucciones”, no como borrado, y queda fuera de este bloque.

### Gate repetido tras integrar PR #97

1. rebase sobre `master` con PR #97: **PASS**, sin conflictos textuales;
2. `content:validate:knowledge-targeting`: **PASS**, 1 familia, 6 perfiles,
   0 OPEC, 2 fuentes `needs_review`, 0 mapas y 0 mappings;
3. reset Supabase local `0001–0030`: **PASS**;
4. contrato estático, integración PostgreSQL, seguridad/RLS y concurrencia:
   **PASS**;
5. V4 248/248, dry-run 248 sin escrituras e importación atómica local: **PASS**;
6. unitarias, typecheck, documentación, lint Supabase y diff check: **PASS**; el
   lint conserva solo la advertencia histórica de `p_previous_state`;
7. verificación remota: solo lectura; `0029`/`0030`, lote, OPEC, fuentes,
   mappings, backfill, activación y deploy permanecen fuera de este gate.

El catálogo y las cookies de PR #101 quedan clasificados explícitamente como un
**adaptador canary transitorio, apagado y no canónico**. No deben poblar la base
ni habilitarse cuando existan catálogos o mappings normalizados independientes.
PR #101 deberá rebasearse después de esta foundation y repetir sus checks; sus
verdes sobre la base anterior no prueban compatibilidad con `0030`.

## Sincronización documental

Actualizados en este bloque:

- `docs/database/schema.md`;
- `docs/database/prd-question-bank-v4-supabase.md`;
- `docs/database/question-bank-v4-contract.md`;
- `docs/03-architecture/question-bank-knowledge-targeting-architecture.md`;
- `content/targeting/README.md`;
- `docs/project/status.md`;
- este reporte.

Deliberadamente no tocados:

- `content/question-bank-v4/**` y sus contratos congelados;
- `content/knowledge-base/**`;
- catálogos, schemas y mappings bajo `content/targeting/**`;
- contratos de lectura V4 y migraciones `0001–0029`;
- runtime, despliegue y datos de ambientes remotos.

Known documentation drift accepted:

- `docs/02-delivery/sprint-log.md` y `docs/02-delivery/change-log.md` quedan para
  la integración/release; este bloque registra su estado en `docs/project/status.md`
  y en el presente reporte técnico.
- el checkpoint propio de PR #101 no existe en esta rama; deberá alinearse al
  rebasar esa rama y no se promueve aquí como fuente ejecutiva.

## Metadata operacional

| Campo | Valor |
|---|---|
| Agent | Codex — coordinación con agentes de pruebas, auditoría y documentación |
| Via | Codex desktop / orquestación multiagente |
| Contributor | marlon-arcila |
| Environment | checkout local, rama aislada PRD 3 |
| Shell | bash |
| Timezone | America/Bogota |
| Validation | reset `0001–0030`; unitarias; contrato 5/5; integración PostgreSQL; V4 248/248; import atómico; docs; diff check |
| Runtime-Verified | solo preflight de datos/historial remoto en lectura; aplicación `0030`: no |
| Related-Files | `0030_targeting_knowledge_foundation.sql`, schema, PRD Supabase V4, status |
| Governance-Context | PRD 3; arquitectura V4 congelada; cerrar antes que ampliar |

## Riesgos abiertos

- no existe todavía evidencia para poblar OPEC, fuentes o mappings;
- una futura carga o backfill debe ser otro bloque auditable y no forma parte de
  esta foundation.
