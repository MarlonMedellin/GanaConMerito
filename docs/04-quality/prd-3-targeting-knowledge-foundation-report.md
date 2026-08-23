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
- `target_kind` quedó opcional porque el contrato editorial no autoriza inventar
  `primary|compatible`;
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

El preflight remoto de solo lectura confirmó historial aplicado `0001–0028`, 163
V4 con 652 opciones, cero filas inseguras/activas y cero ejecuciones batch. `0029`
y `0030` permanecen sin aplicar remotamente. Supabase reportó WAL-G habilitado,
PITR deshabilitado y sin timestamps de backup físico disponibles; por ello no se
autorizó ni realizó ninguna escritura remota.

## Límites operativos

No se aplicó `0029`, no se ejecutó el lote V4, no se activaron reactivos y no se
realizó despliegue. Cualquier aplicación de `0030` requiere autorización y un
preflight remoto independiente; este bloque no aporta evidencia de runtime ni de
producción.

## Preparación de integración

Corte remoto observado el **2026-08-23**:

- `master`: `7be92b655dee4965872963f1ca57d6eb96107599`;
- PR #97, contratos editoriales knowledge/targeting: draft, cabeza
  `9c1963e11de8ea7a267cf938840b96abf0063285`, checks verdes;
- rama de esta foundation: `b591a07242ffbcdbafc32b4089607193b912f0c2`;
- PR #101, readiness canary: draft y en evolución; usa transitoriamente
  `professional_profiles`, catálogo OPEC de entorno e `item_bank.opec_id`, no las
  tablas normalizadas de `0030`.

La foundation no debe integrarse todavía sobre `master`: depende de que los
contratos del PR #97 sean autorizados e integrados primero. Después de ello se
debe actualizar esta rama sobre el nuevo `master`, resolver cualquier conflicto
de CI y repetir el gate completo `0001–0030`. No se congelará en este documento
un SHA de PR #101 porque su rama está activa.

### Matriz contrato editorial → persistencia `0030`

| Contrato editorial del PR #97 | Persistencia `0030` | Regla de compatibilidad |
|---|---|---|
| familia `code/name/description/status` | `target_families` | identidad por `code`; `active` se representa con `is_active=true` |
| perfil `familyCode/profileCode/name/legacyApplicantProfile/status` | `target_profiles` | familia resuelta por código; seis perfiles canónicos; sin disciplinas |
| OPEC `sourceSystem/externalOpecId/familyCode/profileCode/...` | `opec_catalog` | identidad natural fuente+ID externo; perfil debe pertenecer a la familia |
| target de reactivo tipo `family` | `item_target_families` | relación explícita; no expandir automáticamente a todos los perfiles |
| target de reactivo tipo `profile` | `item_target_profiles` | `target_kind=NULL`; el contrato no define primary/compatible |
| target de reactivo tipo `opec` | `item_opec_targets` | OPEC existente y revisión/evidencia preservadas |
| inventario de fuente | `knowledge_sources` | fuente `needs_review` permanece no verificada y sin targets activos |
| mapa knowledge `common/family/profile/opec` | `knowledge_source_targets` | una sola forma de target; estado `active` exige verificación completa |
| relación reactivo–fuente | `item_source_links` | solo evidencia editorial explícita; nunca inferida desde texto o keywords |

El corte machine-readable del PR #97 contiene una familia, seis perfiles, cero
OPEC, dos fuentes `needs_review`, cero mapas knowledge y cero mappings de
reactivos. Por tanto, cualquier importador futuro debe tratar archivos vacíos
como “sin instrucciones”, no como borrado, y queda fuera de este bloque.

### Gate pendiente tras integrar PR #97

1. actualizar esta rama desde el `master` que ya contenga los contratos;
2. ejecutar `content:validate:knowledge-targeting`;
3. reconstruir Supabase local desde `0001` hasta `0030`;
4. repetir contrato estático, integración PostgreSQL, seguridad y concurrencia;
5. repetir suites V4, typecheck, documentación y diff check;
6. confirmar nuevamente que `0029`/`0030`, lote, OPEC, fuentes, mappings,
   backfill, activación y deploy siguen sin ejecutarse remotamente.

El PR #101 requiere una decisión de integración separada: su catálogo canary
debe declararse adaptador transitorio o migrarse después al modelo normalizado.
Mezclar ambos modelos sin esa decisión crearía dos fuentes de verdad para OPEC y
perfiles.

## Sincronización documental

Actualizados en este bloque:

- `docs/database/schema.md`;
- `docs/database/prd-question-bank-v4-supabase.md`;
- `docs/project/status.md`;
- este reporte.

Deliberadamente no tocados:

- `content/question-bank-v4/**` y sus contratos congelados;
- `content/knowledge-base/**`;
- `content/targeting/**`;
- contratos de lectura V4 y migraciones `0001–0029`;
- runtime, despliegue y datos de ambientes remotos.

Known documentation drift accepted:

- `docs/02-delivery/sprint-log.md` y `docs/02-delivery/change-log.md` quedan para
  la integración/release; este bloque registra su estado en `docs/project/status.md`
  y en el presente reporte técnico.

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
- `target_kind` permanece opcional hasta una decisión editorial explícita; no se
  derivará por orden ni heurística;
- una futura carga o backfill debe ser otro bloque auditable y no forma parte de
  esta foundation.
