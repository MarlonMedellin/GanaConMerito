# Deuda de consolidación — Banco V4, Knowledge, Targeting y Supabase

**Estado:** registro vivo de coordinación arquitectónica.  
**Rama de trabajo:** `reorg-v4-architecture-20260822`.  
**Última base sincronizada conocida:** `master@023e94f737ccd95dfe2ac9a093884dd4dc426aac`.  
**Regla:** registrar aquí decisiones diferidas, dependencias y riesgos; este archivo no autoriza runtime, SQL, backfills ni cambios sobre el corpus congelado.

## Estados

- `OPEN`: pendiente y accionable.
- `BLOCKED`: depende de otro cambio o agente.
- `IN_PROGRESS`: trabajo iniciado.
- `DEFERRED`: pospuesto de forma deliberada.
- `CLOSED`: resuelto con evidencia verificable.

## Resumen ejecutivo

La reorganización histórica de V4 ya separa estado operativo de evidencia histórica. `MANIFEST.json`, `items/`, `taxonomy/` y `legacy-processing-register.csv` no fueron modificados por esta reorganización. La migración `0028` del importador atómico ya forma parte de `master` y fue sincronizada a esta rama.

La arquitectura de `knowledge + targeting` ya tiene estructura física de repositorio: catálogo inicial de fuentes, carpetas canónicas de fuentes, mapas de familia/perfil/OPEC y contrato machine-readable para OPEC. La persistencia Supabase correspondiente sigue siendo evolución aditiva de PRD 3.

## Registro

### V4-ARCH-DEBT-001 — Reconciliar documentación tras migración `0028`

- **Estado:** `CLOSED`.
- `master@283207e4ee55571c2fe1e882efe1a59180f98877` publicó `0028_atomic_v4_batch_import.sql`.
- PRD 2 documenta reset `0001–0028`, importación 248/248, idempotencia y rollback locales.
- La rama incorporó `0028` y después los ajustes de CI posteriores de `master`.
- **Regla futura:** `0029` es solo un número candidato; antes de crear targeting/knowledge se relee `supabase/migrations/` y se usa el siguiente número realmente libre.

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
- Se verificó que `content/question-bank-v4/sources/academic/` y `normative/` solo contenían `.gitkeep`; no había fuentes reales ni consumidores detectados de esas rutas exactas.
- Se retiraron los placeholders y se creó `content/question-bank-v4/sources/README.md` como capa explícita de compatibilidad/navegación.
- La única biblioteca canónica de fuentes para V4 y futuros bancos es `content/knowledge-base/`.
- **Regla:** ninguna fuente real se duplica bajo `question-bank-v4/sources/`; allí solo pueden existir índices, punteros, provenance o metadatos derivados de compatibilidad.

### V4-ARCH-DEBT-007 — Inventariar y normalizar el corpus de conocimiento

- **Estado:** `IN_PROGRESS`.
- Ya existe `content/knowledge-base/catalog/source-inventory.json` y la estructura `sources/{normative,academic,technical,guides}`.
- El inventario inicial registró los dos únicos archivos normativos legacy identificados en `content/normative/`: `decreto_1075.md` y `ley_1098.md`.
- Ambos permanecen como `verificationStatus: needs_review`; no se consideran fuentes decisivas verificadas.
- **Cierre requerido:** verificar procedencia oficial, vigencia, localizadores, derechos de conservación y promover de forma controlada las fuentes que correspondan a `knowledge-base/sources/`.

### V4-ARCH-DEBT-008 — Crear catálogo real de OPEC y mapeo a perfiles

- **Estado:** `IN_PROGRESS`.
- Ya existe el contrato editorial en `content/targeting/opecs/README.md`, su JSON Schema en `catalog.schema.json` y el catálogo canónico vacío `catalog.json`.
- El catálogo vacío es deliberado: no se crean identificadores OPEC ficticios.
- El contrato conserva `sourceSystem`, `externalOpecId`, `familyCode`, `profileCode`, convocatoria, entidad, cargo, estado, verificación, evidencia y metadata.
- **Cierre requerido:** incorporar OPEC reales y verificadas, mapearlas a perfiles canónicos y validar unicidad/identidad externa.

### V4-ARCH-DEBT-009 — Mapear los 248 reactivos V4 a perfiles/cargos

- **Estado:** `OPEN`.
- El corpus congelado no contiene aún relaciones many-to-many de targeting.
- **Cierre requerido:** mapa externo revisado editorialmente para familia/perfiles y, cuando corresponda, OPEC.
- **Regla:** no duplicar reactivos ni aceptar inferencia final por palabras clave sin revisión.

### V4-ARCH-DEBT-010 — Implementar targeting/knowledge en Supabase de forma aditiva

- **Estado:** `IN_PROGRESS` por PRD 3 en línea paralela; esta rama no implementa SQL.
- La dependencia numérica de `0028` está resuelta.
- Alcance esperado: entidades equivalentes a `target_families`, `target_profiles`, `opec_catalog`, `item_target_profiles`, `item_opec_targets`, `knowledge_sources`, `knowledge_source_targets`, `item_source_links`.
- **Regla:** conservar `item_bank`, UUID, vistas seguras y `opec_id` durante la transición; nunca reescribir migraciones aplicadas.
- **Coordinación:** PRD 3 debe tomar los catálogos de `content/targeting/` y `content/knowledge-base/` como contratos editoriales de entrada, no inventar un catálogo paralelo.

### V4-ARCH-DEBT-011 — Resolver evolución de `editorial_scope`

- **Estado:** `DEFERRED`.
- V4 distingue `general` y `opec_specific`; targeting por perfil puede resolverse externamente.
- Si se propone `profile_specific`, debe aprobarse como evolución contractual completa: contrato, validador, importador, manifiesto y DB. No introducirlo solo en SQL.

### V4-ARCH-DEBT-012 — Derivar gap analysis desde `temario-base.md`

- **Estado:** `BLOCKED` por `V4-ARCH-DEBT-021`.
- El temario es fuente de planeación, pero la copia actual del repositorio no es idéntica al archivo original aportado.
- **Cierre requerido:** una vez restaurada/verificada la integridad, crear un artefacto derivado separado con unidad temática normalizada, fuente/verificación, cobertura V4, constructo y targeting candidato.
- El archivo fuente restaurado debe permanecer inmutable; el gap analysis vive en otro artefacto.

### V4-ARCH-DEBT-013 — Verificar consumidores y gates de la reorganización

- **Estado:** `IN_PROGRESS`.
- El PR no modifica los 248 JSON de `items/`, `taxonomy/`, `MANIFEST.json`, `legacy-processing-register.csv`, migraciones Supabase ni runtime.
- Sí incorpora deliberadamente gobernanza adicional: `scripts/validate-knowledge-targeting.ts`, el script npm `content:validate:knowledge-targeting` y su ejecución desde `PR Checks`.
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

### V4-ARCH-DEBT-017 — Mapear perfiles históricos al targeting canónico

- **Estado:** `CLOSED` como decisión de gobernanza; el archivado físico queda fuera de alcance.
- `content/profiles/docente/README.md` declara esa ruta como carpeta editorial histórica/puente y reconoce los mismos seis códigos.
- `history/PROVENANCE.md` establece que el trabajo nuevo y la futura persistencia deben usar `content/targeting/profiles/docentes.json` como catálogo canónico.
- Las carpetas legacy no se eliminan hasta revisar sus consumidores en una tarea separada.

### V4-ARCH-DEBT-018 — Aplicar/verificar `0028` fuera del entorno local

- **Estado:** `OPEN`.
- **Responsable lógico:** migración/operación Supabase, no reorganización documental.
- `0028` está implementada y validada localmente; producción no fue modificada en PRD 2.
- **Cierre requerido:** ambiente, migration history, conteos, resultado del batch, estado de activación, gates de seguridad/E2E y rollback cuando se autorice despliegue remoto/productivo.

### V4-ARCH-DEBT-019 — Actualizar documento arquitectónico tras la reorganización física

- **Estado:** `CLOSED`.
- `docs/03-architecture/question-bank-knowledge-targeting-architecture.md` refleja `history/` materializado, `INDEX.md`, `PROVENANCE.md`, la Fase 1 completada en la rama, `0028` versionada/validada localmente y targeting/knowledge como evolución aditiva posterior.

### V4-ARCH-DEBT-020 — Validación automática de catálogos knowledge/targeting

- **Estado:** `CLOSED` para los catálogos materializados actualmente.
- `scripts/validate-knowledge-targeting.ts` valida estructura y referencias de familias, perfiles, OPEC e inventario de fuentes.
- El gate comprueba:
  - `familyCode` existente;
  - `profileCode` perteneciente a la familia declarada;
  - OPEC `active` solo con `verificationStatus: verified`;
  - ausencia de duplicados por identidad externa OPEC;
  - unicidad de `sourceId`.
- El comando `npm run content:validate:knowledge-targeting` está versionado y `PR Checks` lo ejecuta.
- Los mapas machine-readable aún no existen; su contrato/validación se separa en `V4-ARCH-DEBT-022` y no mantiene esta deuda artificialmente abierta.

### V4-ARCH-DEBT-021 — Restaurar y verificar integridad exacta de `temario-base.md`

- **Estado:** `OPEN` y bloqueante para `V4-ARCH-DEBT-012`.
- Archivo original aportado `temas(3).md`: `94850` bytes, SHA-256 `4dd3e7d1df2af89e4818f77ca244dc26187930a8d7faf19d1c7f05538bc88bb7`, Git blob SHA `f5c90d8393f8dbb7a83794134b27b1a0849de807`.
- Copia actual del repositorio: Git blob SHA `2d022f1d66e5d98653178d3d772db210c3aec442`; no coincide tampoco bajo normalizaciones simples LF/CRLF.
- Se confirmó al menos una diferencia sustantiva: después de `5. Tema - Tiempos del PARD (Ley 1888)` la copia contiene una segunda entrada `7. Competencia - Capacidad de Agencia...` que no está allí en el original.
- Evidencia detallada: `content/knowledge-base/themes/docentes/INTEGRITY.md`.
- **Cierre requerido:** sustituir por los bytes exactos del original o documentar expresamente una transformación; para identidad exacta, el Git blob SHA final debe ser `f5c90d8393f8dbb7a83794134b27b1a0849de807`.
- **Regla:** no aplicar parches manuales parciales ni derivar gap analysis de la copia corrupta.

### V4-ARCH-DEBT-022 — Materializar y validar mapas machine-readable de aplicabilidad

- **Estado:** `OPEN`.
- `content/knowledge-base/maps/{families,profiles,opecs}/` contiene por ahora contratos/documentación, no mapas JSON poblados.
- **Cierre requerido:** definir schema estable, crear mapas explícitos y extender `content:validate:knowledge-targeting` para exigir que cada referencia apunte a `sourceId`, `familyCode`, `profileCode` u OPEC existentes.
- **Impacto PRD 3:** no backfillear `knowledge_source_targets` desde texto libre; cuando existan mapas, PRD 3 debe consumir el contrato validado.

## Handoff obligatorio al agente de Supabase / PRD 3

Antes de integrar esta rama o fusionar SQL de targeting/knowledge, comunicar como mínimo:

1. `0028` ya pertenece a la secuencia versionada y cualquier nueva migración debe usar el siguiente número realmente libre al momento de crearla;
2. PRD 2 cerró validación local y no modificó producción;
3. la reorganización de `history/` no modifica el corpus, `MANIFEST.json`, `legacy-processing-register.csv` ni las migraciones;
4. `MANIFEST.json` y el registro operacional permanecen en raíz por sus consumidores;
5. targeting/knowledge es una evolución aditiva y no reemplaza el importador atómico;
6. `content/targeting/profiles/docentes.json` es el catálogo canónico de perfiles; `content/profiles/docente/` es histórico/puente;
7. `content/targeting/opecs/catalog.json` + `catalog.schema.json` definen la interfaz editorial de OPEC y no contienen datos ficticios;
8. `content/knowledge-base/catalog/source-inventory.json` es inventario de conocimiento; `needs_review` no equivale a fuente verificada;
9. `content:validate:knowledge-targeting` ya valida los catálogos materializados y debe permanecer verde antes de cualquier import/backfill;
10. `V4-ARCH-DEBT-021` bloquea el gap analysis del temario hasta restaurar su integridad;
11. los mapas de aplicabilidad machine-readable siguen pendientes en `V4-ARCH-DEBT-022`; no inferir `knowledge_source_targets` desde texto libre;
12. cualquier decisión sobre `editorial_scope`, `opec_id`, vistas, RLS o nuevas tablas debe contrastarse con la arquitectura y este registro de deuda.

## Regla de mantenimiento

Cada nueva dependencia, incompatibilidad o decisión diferida debe crear o actualizar una entrada `V4-ARCH-DEBT-###`, con estado, condición de cierre e impacto sobre Supabase cuando corresponda. Una deuda solo se marca `CLOSED` con evidencia verificable.