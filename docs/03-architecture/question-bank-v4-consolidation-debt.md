# Deuda de consolidación — Banco V4, Knowledge, Targeting y Supabase

**Estado:** registro vivo de coordinación arquitectónica.  
**Rama de trabajo:** `reorg-v4-architecture-20260822`.  
**Última base sincronizada conocida:** `master@7be92b655dee4965872963f1ca57d6eb96107599`.  
**Regla:** registrar aquí decisiones diferidas, dependencias y riesgos; este archivo no autoriza runtime, SQL, backfills ni cambios sobre el corpus congelado.

## Estados

- `OPEN`: pendiente y accionable.
- `BLOCKED`: depende de otro cambio o agente.
- `IN_PROGRESS`: trabajo iniciado.
- `DEFERRED`: pospuesto de forma deliberada.
- `CLOSED`: resuelto con evidencia verificable.

## Resumen ejecutivo

La reorganización histórica de V4 ya separa estado operativo de evidencia histórica. `MANIFEST.json`, `items/`, `taxonomy/` y `legacy-processing-register.csv` no fueron modificados por esta reorganización.

La rama está sincronizada con el checkpoint de Codex en `master@7be92b6`: `0028_atomic_v4_batch_import.sql` fue aplicada en producción sin ejecutar el lote; `0029_harden_v4_manifest_reconciliation.sql` está versionada y validada localmente, pero no aplicada en producción. La secuencia `0001–0029` está ocupada.

La arquitectura de `knowledge + targeting` ya tiene estructura física de repositorio: catálogo inicial de fuentes, carpetas canónicas de fuentes, contratos de familia/perfil/OPEC, mapa externo de reactivos, schema de mapas de conocimiento y validación automática integrada a `PR Checks`. La persistencia Supabase correspondiente sigue siendo evolución aditiva de PRD 3.

La estructura de onboarding/knowledge/targeting queda congelada hasta canary y primeras pruebas con stakeholders/early adopters. Antes de esa etapa solo se reabre por corrección bloqueante, seguridad, integridad de datos o incompatibilidad objetiva con una migración ya aplicada.

## Registro

### V4-ARCH-DEBT-001 — Reconciliar documentación tras migración `0028`

- **Estado:** `CLOSED`.
- `master@283207e4ee55571c2fe1e882efe1a59180f98877` publicó `0028_atomic_v4_batch_import.sql`.
- PRD 2 documentó reset `0001–0028`, importación 248/248, idempotencia y rollback locales.
- El checkpoint posterior aplicó `0028` en producción sin ejecutar el lote y añadió `0029_harden_v4_manifest_reconciliation.sql`, validada localmente.
- **Regla futura:** `0001–0029` están ocupadas; releer `supabase/migrations/` y usar `0030` o el siguiente número realmente libre superior.

### V4-ARCH-DEBT-002 — Completar migración de históricos V4 a `history/`

- **Estado:** `CLOSED`.
- Los conjuntos identificados `EXPANSION-*`, `AUDIT-*`, `REAUDIT-*`, `REMEDIATION-*` y `COVERAGE-*` fueron retirados de la raíz y organizados en `history/expansion/`, `history/audits/`, `history/remediation/` y `history/snapshots/`.
- La raíz V4 queda reservada para contrato, manifiesto, registro operacional y carpetas operativas.

### V4-ARCH-DEBT-003 — Corregir referencias a rutas históricas

- **Estado:** `CLOSED` para el lote reorganizado.
- Se ajustaron las referencias relativas entre expansiones, auditorías, remediaciones y snapshots después de los movimientos.
- Las búsquedas de consumidores realizadas no identificaron consumidores runtime/CI externos que dependieran de las rutas históricas movidas.
- Si aparece en el futuro un consumidor no indexado, se tratará como nueva deuda y no como razón para revertir la estructura.

### V4-ARCH-DEBT-004 — Decidir destino de `legacy-processing-register.csv`

- **Estado:** `DEFERRED`.
- Tiene consumidores operativos y de importación, entre ellos `scripts/lib/v4-import-plan.ts`, skills y documentación.
- **Regla:** no moverlo por orden visual. Su reubicación exige actualizar todos los consumidores y ejecutar gates V4/importador en el mismo cambio.

### V4-ARCH-DEBT-005 — Decidir ubicación permanente de `MANIFEST.json`

- **Estado:** `DEFERRED`.
- El manifiesto es la autoridad canónica y su ruta raíz es consumida por scripts, CI y el flujo de importación V4.
- **Decisión actual:** permanece en `content/question-bank-v4/MANIFEST.json`.
- Solo se moverá mediante una migración explícita de rutas con todos los consumidores y gates actualizados.

### V4-ARCH-DEBT-006 — Clarificar `question-bank-v4/sources/` frente a `knowledge-base/`

- **Estado:** `CLOSED`.
- No existen copias reales de fuentes bajo `content/question-bank-v4/sources/`.
- `sources/normative/` y `sources/academic/` conservan únicamente README de compatibilidad porque el contrato V4 congelado todavía referencia esas rutas.
- La única biblioteca canónica de fuentes para V4 y futuros bancos es `content/knowledge-base/`.
- **Regla:** ninguna fuente real se duplica bajo `question-bank-v4/sources/`; allí solo pueden existir índices, punteros, provenance o metadatos derivados de compatibilidad.

### V4-ARCH-DEBT-007 — Inventariar y normalizar el corpus de conocimiento

- **Estado:** `IN_PROGRESS`.
- Ya existe `content/knowledge-base/catalog/source-inventory.json` y la estructura `sources/{normative,academic,technical,guides}`.
- El inventario inicial registró los dos archivos normativos legacy identificados en `content/normative/`: `decreto_1075.md` y `ley_1098.md`.
- Se contrastó la identidad de ambas normas con el Gestor Normativo oficial de Función Pública y el inventario conserva emisor, fechas conocidas y URL oficial.
- Ambas permanecen como `verificationStatus: needs_review`: identidad/procedencia oficial verificada no equivale a vigencia/localizador verificado para cada artículo usado por un reactivo.
- Ya existe el contrato `content/knowledge-base/maps/map.schema.json`, pero no se crean relaciones `active` antes de verificar la fuente.
- **Cierre requerido:** verificar vigencia, localizadores, derechos de conservación y promover de forma controlada las fuentes que correspondan a `knowledge-base/sources/`; después poblar sus mapas de aplicabilidad cuando exista evidencia suficiente.

### V4-ARCH-DEBT-008 — Crear catálogo real de OPEC y mapeo a perfiles

- **Estado:** `IN_PROGRESS`.
- Ya existe el contrato editorial en `content/targeting/opecs/README.md`, su JSON Schema en `catalog.schema.json` y el catálogo canónico vacío `catalog.json`.
- El catálogo vacío es deliberado: no se crean identificadores OPEC ficticios.
- El contrato conserva `sourceSystem`, `externalOpecId`, `familyCode`, `profileCode`, convocatoria, entidad, `positionName`, estado, verificación, evidencia y metadata.
- **Semántica congelada:** perfil = grupo reusable de preparación; `positionName` = denominación oficial concreta de cargo/área; OPEC = oferta concreta. No crear perfiles por disciplina ni nuevas capas `area/specialty/employment_identity` antes de canary salvo necesidad crítica.
- **Cierre requerido:** incorporar OPEC reales y verificadas, mapearlas a perfiles canónicos y validar unicidad/identidad externa.

### V4-ARCH-DEBT-009 — Mapear los 248 reactivos V4 a perfiles/cargos

- **Estado:** `IN_PROGRESS`.
- El corpus congelado no contiene relaciones many-to-many de targeting y no será modificado para agregarlas.
- Ya existen `content/targeting/item-maps/item-target-map.schema.json` y el mapa canónico vacío `content/targeting/item-maps/question-bank-v4.json`.
- El gate valida `itemId` contra `MANIFEST.json`, referencias a familia/perfil/OPEC, targets duplicados y evidencia para mappings `approved`.
- El mapa vacío es deliberado: todavía no se ha realizado la revisión editorial de los 248 reactivos.
- **Cierre requerido:** poblar y revisar editorialmente los 248 reactivos para familia/perfiles y, cuando corresponda, OPEC.
- **Regla:** no duplicar reactivos ni aceptar inferencia final por palabras clave; un clasificador automático solo puede producir candidatos.

### V4-ARCH-DEBT-010 — Implementar targeting/knowledge en Supabase de forma aditiva

- **Estado:** `IN_PROGRESS` por PRD 3 en línea paralela; esta rama no implementa SQL de targeting/knowledge.
- La secuencia `0001–0029` está ocupada. Con el freeze actual, cualquier nueva migración debe usar `0030` o el siguiente número realmente libre superior.
- Alcance esperado: entidades equivalentes a `target_families`, `target_profiles`, `opec_catalog`, `item_target_profiles`, `item_opec_targets`, `knowledge_sources`, `knowledge_source_targets`, `item_source_links`.
- **Regla:** conservar `item_bank`, UUID, vistas seguras y `opec_id` durante la transición; nunca reescribir migraciones aplicadas.
- **Coordinación:** PRD 3 debe tomar los catálogos y mapas de `content/targeting/` y `content/knowledge-base/` como contratos editoriales de entrada, no inventar un catálogo paralelo.

### V4-ARCH-DEBT-011 — Resolver evolución de `editorial_scope`

- **Estado:** `DEFERRED`.
- V4 distingue `general` y `opec_specific`; targeting por perfil puede resolverse externamente.
- Si se propone `profile_specific`, debe aprobarse como evolución contractual completa: contrato, validador, importador, manifiesto y DB. No introducirlo solo en SQL.
- Por freeze de arquitectura, esta decisión se difiere hasta canary salvo necesidad crítica demostrada.

### V4-ARCH-DEBT-012 — Derivar gap analysis desde `temario-base.md`

- **Estado:** `BLOCKED` por `V4-ARCH-DEBT-021`.
- El temario es fuente de planeación, pero la copia actual del repositorio no es idéntica al archivo original aportado.
- **Cierre requerido:** una vez restaurada/verificada la integridad, crear un artefacto derivado separado con unidad temática normalizada, fuente/verificación, cobertura V4, constructo y targeting candidato.
- El archivo fuente restaurado debe permanecer inmutable; el gap analysis vive en otro artefacto.

### V4-ARCH-DEBT-013 — Verificar consumidores y gates de la reorganización

- **Estado:** `IN_PROGRESS`.
- El diff propio del PR frente al `master` sincronizado no modifica los 248 JSON de `items/`, `taxonomy/`, `MANIFEST.json`, `legacy-processing-register.csv`, migraciones Supabase ni runtime.
- Sí incorpora deliberadamente gobernanza adicional: `scripts/validate-knowledge-targeting.ts`, `scripts/validate-knowledge-vocabularies.ts`, el script npm `content:validate:knowledge-targeting` y su ejecución desde `PR Checks`.
- **Cierre requerido:** observar todos los gates sobre el HEAD definitivo inmediatamente antes de merge y confirmar que esas adiciones de validación no introducen cambios funcionales fuera de repositorio/CI.

### V4-ARCH-DEBT-014 — Preservar provenance de `temas.md` / `temas(1).md`

- **Estado:** `CLOSED`.
- Se creó `content/question-bank-v4/history/PROVENANCE.md`.
- Los informes conservan sus nombres históricos; el documento explica su relación funcional con `content/knowledge-base/themes/docentes/temario-base.md` sin afirmar identidad byte a byte que no esté demostrada.

### V4-ARCH-DEBT-015 — Crear índice estable del historial V4

- **Estado:** `CLOSED`.
- Se creó `content/question-bank-v4/history/INDEX.md` con la secuencia expansión → auditoría → remediación → snapshot y la advertencia de que `MANIFEST.json` es la autoridad actual.

### V4-ARCH-DEBT-016 — Gate final antes de integrar la reorganización

- **Estado:** `OPEN`.
- Antes de merge a `master`:
  1. revisar PR de `reorg-v4-architecture-20260822` hacia `master`;
  2. verificar que la rama continúe `behind_by: 0` o resincronizar;
  3. confirmar ausencia de cambios de corpus/contrato runtime no intencionados;
  4. observar `content:validate:v4`, manifest check, knowledge/targeting, docs, tests y CI aplicables sobre el HEAD final;
  5. revisar el diff de renames y enlaces;
  6. emitir handoff actualizado al agente Supabase antes del merge.
- La sincronización con `master@7be92b6` ya dejó `behind_by: 0`; el cierre permanece condicionado a los gates del HEAD congelado.

### V4-ARCH-DEBT-017 — Mapear perfiles históricos al targeting canónico

- **Estado:** `CLOSED` como decisión de gobernanza; el archivado físico queda fuera de alcance.
- `content/profiles/docente/README.md` declara esa ruta como carpeta editorial histórica/puente y reconoce los mismos seis códigos.
- `history/PROVENANCE.md` establece que el trabajo nuevo y la futura persistencia deben usar `content/targeting/profiles/docentes.json` como catálogo canónico.
- Las carpetas legacy no se eliminan hasta revisar sus consumidores en una tarea separada.

### V4-ARCH-DEBT-018 — Continuidad operativa de `0029` y lote V4 fuera del entorno local

- **Estado:** `OPEN`.
- **Responsable lógico:** migración/operación Supabase, no reorganización documental.
- `0028` fue aplicada en producción sin ejecutar el lote V4.
- `0029_harden_v4_manifest_reconciliation.sql` está versionada y validada localmente, pero no aplicada en producción al checkpoint.
- El lote canónico de 248 no fue ejecutado en producción.
- **Cierre requerido:** nuevo preflight sobre el `master` vigente, migration history, snapshot/recuperación, aplicación autorizada de `0029`, resultado del batch si se autoriza, estados de activación, gates de seguridad/E2E y evidencia de rollback/recuperación.

### V4-ARCH-DEBT-019 — Actualizar documento arquitectónico tras la reorganización física

- **Estado:** `CLOSED`.
- `docs/03-architecture/question-bank-knowledge-targeting-architecture.md` refleja `history/` materializado, `INDEX.md`, `PROVENANCE.md`, la Fase 1 completada y targeting/knowledge como evolución aditiva posterior.
- El handoff PRD 3 contiene el checkpoint operativo más reciente de `0028/0029`; no se reabre la arquitectura por ese cambio de estado operacional.

### V4-ARCH-DEBT-020 — Validación automática de catálogos knowledge/targeting

- **Estado:** `CLOSED`.
- `scripts/validate-knowledge-targeting.ts` valida estructura y referencias de familias, perfiles, OPEC, inventario de fuentes, mapas de conocimiento e item maps.
- El gate comprueba, entre otros:
  - `familyCode` existente;
  - `profileCode` perteneciente a la familia declarada;
  - OPEC `active` solo con `verificationStatus: verified`;
  - ausencia de duplicados por identidad externa OPEC;
  - unicidad de `sourceId`;
  - referencias de mapas de conocimiento a fuentes/targets existentes;
  - relación de conocimiento `active` únicamente con fuente `verified` y datos de verificación;
  - `itemId` existente en el `MANIFEST.json` V4;
  - targets de reactivo existentes y no duplicados;
  - mapping `approved` con evidencia editorial.
- El comando `npm run content:validate:knowledge-targeting` está versionado y `PR Checks` lo ejecuta.

### V4-ARCH-DEBT-021 — Restaurar y verificar integridad exacta de `temario-base.md`

- **Estado:** `OPEN` y bloqueante para `V4-ARCH-DEBT-012`.
- Archivo original aportado `temas(3).md`: `94850` bytes, SHA-256 `4dd3e7d1df2af89e4818f77ca244dc26187930a8d7faf19d1c7f05538bc88bb7`, Git blob SHA `f5c90d8393f8dbb7a83794134b27b1a0849de807`.
- Copia actual del repositorio: `95094` bytes, Git blob SHA `2d022f1d66e5d98653178d3d772db210c3aec442`; no coincide tampoco bajo normalizaciones simples LF/CRLF.
- Se confirmó al menos una diferencia sustantiva: después de `5. Tema - Tiempos del PARD (Ley 1888)` la copia contiene una segunda entrada `7. Competencia - Capacidad de Agencia...` que no está allí en el original.
- Evidencia detallada: `content/knowledge-base/themes/docentes/INTEGRITY.md`.
- **Cierre requerido:** sustituir por los bytes exactos del original o documentar expresamente una transformación; para identidad exacta, el Git blob SHA final debe ser `f5c90d8393f8dbb7a83794134b27b1a0849de807`.
- **Regla:** no aplicar parches manuales parciales ni derivar gap analysis de la copia corrupta.

### V4-ARCH-DEBT-022 — Materializar y validar mapas machine-readable de aplicabilidad

- **Estado:** `CLOSED` como contrato arquitectónico.
- Se creó `content/knowledge-base/maps/map.schema.json` para relaciones fuente → `common|family|profile|opec`.
- Se creó `content/targeting/item-maps/item-target-map.schema.json` y el mapa V4 vacío `question-bank-v4.json` para relaciones reactivo → familia/perfil/OPEC.
- `content:validate:knowledge-targeting` valida ambos tipos de mapa contra inventarios/catálogos canónicos.
- No se crean mapas de conocimiento `active` con fuentes `needs_review`, ni mappings de reactivos ficticios para llenar estructura.
- La población real de relaciones continúa bajo `V4-ARCH-DEBT-007`, `008` y `009`; no reabre esta deuda de contrato.

### V4-ARCH-DEBT-023 — Restringir vocabularios de estado en el validador knowledge/targeting

- **Estado:** `CLOSED` como implementación; sujeto al gate final del HEAD bajo `V4-ARCH-DEBT-013/016`.
- `scripts/validate-knowledge-vocabularies.ts` restringe `verificationStatus` de fuentes a `needs_review|verified|rejected` y rechaza valores desconocidos.
- `npm run content:validate:knowledge-targeting` ejecuta tanto el validador estructural como el de vocabularios.
- **Regla PRD 3:** persistencia y backfill deben aceptar únicamente ese vocabulario mientras el contrato permanezca congelado.

### V4-ARCH-DEBT-024 — Congelar el HEAD arquitectónico durante el gate final

- **Estado:** `IN_PROGRESS` hasta observar los gates del HEAD final; el freeze de diseño ya está activo.
- La rama fue resincronizada con `master@7be92b655dee4965872963f1ca57d6eb96107599` y quedó `behind_by: 0` antes de las aclaraciones finales.
- **Regla operativa:** no añadir nuevos cambios de arquitectura/onboarding antes de canary. Desde este punto solo se permiten correcciones exigidas por un gate fallido o por corrección/seguridad/integridad/incompatibilidad crítica demostrada.
- **Cierre requerido:** mantener un único HEAD estable, observar en ese mismo SHA `Question Bank V4 freeze`, `PR Checks` y `Question Bank V4 atomic import`, y solo entonces cerrar `V4-ARCH-DEBT-013/016` o proponer integración.

## Handoff obligatorio al agente de Supabase / PRD 3

Antes de integrar esta rama o fusionar SQL de targeting/knowledge, comunicar como mínimo:

1. la secuencia `0001–0029` está ocupada; releer migraciones y usar `0030` o el siguiente número realmente libre superior;
2. `0028` fue aplicada en producción sin ejecutar el lote V4;
3. `0029` está versionada y validada localmente, pero no aplicada en producción al checkpoint;
4. la reorganización de `history/` no modifica el corpus, `MANIFEST.json`, `legacy-processing-register.csv` ni el runtime;
5. `MANIFEST.json` y el registro operacional permanecen en raíz por sus consumidores;
6. targeting/knowledge es una evolución aditiva y no reemplaza el importador atómico;
7. `content/targeting/profiles/docentes.json` es el catálogo canónico de perfiles; `content/profiles/docente/` es histórico/puente;
8. semántica congelada: perfil reusable → `positionName` oficial → OPEC concreta; no proliferar perfiles por disciplina antes de canary;
9. `content/targeting/opecs/catalog.json` + `catalog.schema.json` definen la interfaz editorial de OPEC y no contienen datos ficticios;
10. `content/targeting/item-maps/question-bank-v4.json` es la interfaz externa para targeting de los 248 reactivos y está vacía hasta revisión editorial;
11. `content/knowledge-base/catalog/source-inventory.json` es inventario de conocimiento; `needs_review` no equivale a fuente verificada;
12. distinguir sin crear nuevas capas: fuente oficial de reglas ≠ orientación de evaluación ≠ material de estudio;
13. `content/knowledge-base/maps/map.schema.json` define el contrato editorial de `knowledge_source_targets`; no existen relaciones activas hasta verificar fuentes;
14. `content:validate:knowledge-targeting` valida catálogos, mapas y vocabularios y debe permanecer verde antes de cualquier import/backfill;
15. `V4-ARCH-DEBT-021` bloquea el gap analysis del temario hasta restaurar su integridad;
16. el freeze de arquitectura/onboarding permanece activo hasta canary salvo defecto crítico de corrección, seguridad, integridad o compatibilidad;
17. cualquier decisión sobre `editorial_scope`, `opec_id`, vistas, RLS o nuevas tablas debe contrastarse con la arquitectura, `prd3-knowledge-targeting-handoff.*` y este registro de deuda.

## Regla de mantenimiento

Cada nueva dependencia, incompatibilidad o decisión diferida debe crear o actualizar una entrada `V4-ARCH-DEBT-###`, con estado, condición de cierre e impacto sobre Supabase cuando corresponda. Una deuda solo se marca `CLOSED` con evidencia verificable.
