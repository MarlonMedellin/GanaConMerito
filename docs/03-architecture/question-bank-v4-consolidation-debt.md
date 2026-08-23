# Deuda de consolidación — Banco V4, Knowledge, Targeting y Supabase

**Estado:** registro vivo de coordinación arquitectónica.  
**Rama de trabajo:** `reorg-v4-architecture-20260822`.  
**Última base sincronizada:** `master@023e94f737ccd95dfe2ac9a093884dd4dc426aac`.  
**Regla:** registrar aquí decisiones diferidas, dependencias y riesgos; este archivo no autoriza runtime, SQL, backfills ni cambios sobre el corpus congelado.

## Estados

- `OPEN`: pendiente y accionable.
- `BLOCKED`: depende de otro cambio o agente.
- `IN_PROGRESS`: trabajo iniciado.
- `DEFERRED`: pospuesto de forma deliberada.
- `CLOSED`: resuelto con evidencia verificable.

## Resumen ejecutivo

La reorganización histórica de V4 ya separa estado operativo de evidencia histórica. `MANIFEST.json`, `items/`, `taxonomy/` y `legacy-processing-register.csv` no fueron modificados por esta reorganización. La migración `0028` del importador atómico ya forma parte de `master` y fue sincronizada a esta rama; targeting/knowledge sigue siendo una evolución posterior y aditiva.

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

- **Estado:** `OPEN`.
- `question-bank-v4/sources/` existe por compatibilidad/índices locales; la biblioteca transversal canónica es `content/knowledge-base/`.
- **Cierre requerido:** inventariar fuentes locales, deduplicar identidades y decidir qué permanece como índice V4 y qué pasa a la biblioteca compartida.
- Una fuente real debe tener una sola identidad canónica; los demás puntos son referencias o mapas.

### V4-ARCH-DEBT-007 — Inventariar y normalizar el corpus de conocimiento

- **Estado:** `OPEN`.
- Falta poblar de forma gobernada `knowledge-base/sources/` con normas, guías, teoría y documentos técnicos.
- **Cierre requerido:** identidad de fuente, tipo, procedencia, vigencia, localizador, licencia/derecho de conservación y mapas de aplicabilidad.

### V4-ARCH-DEBT-008 — Crear catálogo real de OPEC y mapeo a perfiles

- **Estado:** `OPEN`.
- Ya existen familia y perfiles docentes canónicos, pero falta el catálogo de OPEC concretas.
- **Cierre requerido:** definir identidad externa, convocatoria, entidad, cargo, metadata y `profile_code` asociado en `content/targeting/opecs/`.
- Puede avanzarse en repositorio antes de SQL.

### V4-ARCH-DEBT-009 — Mapear los 248 reactivos V4 a perfiles/cargos

- **Estado:** `OPEN`.
- El corpus congelado no contiene aún relaciones many-to-many de targeting.
- **Cierre requerido:** mapa externo revisado editorialmente para familia/perfiles y, cuando corresponda, OPEC.
- **Regla:** no duplicar reactivos ni aceptar inferencia final por palabras clave sin revisión.

### V4-ARCH-DEBT-010 — Implementar targeting/knowledge en Supabase de forma aditiva

- **Estado:** `DEFERRED`.
- La dependencia numérica de `0028` ya está resuelta; el diferimiento actual es arquitectónico/editorial.
- Antes de SQL deben estabilizarse catálogos, mapas y contrato de adopción.
- Alcance esperado: entidades equivalentes a `target_families`, `target_profiles`, `opec_catalog`, `item_target_profiles`, `item_opec_targets`, `knowledge_sources`, `knowledge_source_targets`, `item_source_links`.
- **Regla:** conservar `item_bank`, UUID, vistas seguras y `opec_id` durante la transición; nunca reescribir migraciones aplicadas.

### V4-ARCH-DEBT-011 — Resolver evolución de `editorial_scope`

- **Estado:** `DEFERRED`.
- V4 distingue `general` y `opec_specific`; targeting por perfil puede resolverse externamente.
- Si se propone `profile_specific`, debe aprobarse como evolución contractual completa: contrato, validador, importador, manifiesto y DB. No introducirlo solo en SQL.

### V4-ARCH-DEBT-012 — Derivar gap analysis desde `temario-base.md`

- **Estado:** `OPEN`.
- El temario original se conserva como fuente de planeación, pero es heterogéneo y contiene posibles duplicaciones y referencias por verificar.
- **Cierre requerido:** artefacto derivado separado con unidad temática normalizada, fuente/verificación, cobertura V4, constructo y targeting candidato.
- `temario-base.md` permanece inmutable como fuente original.

### V4-ARCH-DEBT-013 — Verificar consumidores y gates de la reorganización

- **Estado:** `IN_PROGRESS`.
- La comparación actual contra `master` no muestra cambios atribuibles a la reorganización en `items/`, `taxonomy/`, `MANIFEST.json`, `legacy-processing-register.csv`, `src/`, `scripts/` o `supabase/`.
- Falta ejecutar/observar los gates finales sobre un PR de la rama antes de merge.

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
  1. abrir/revisar PR de `reorg-v4-architecture-20260822` hacia `master`;
  2. verificar que la rama continúe `behind_by: 0` o resincronizar;
  3. confirmar ausencia de cambios de corpus/contrato runtime no intencionados;
  4. ejecutar/observar `content:validate:v4`, manifest check, docs, tests y CI aplicables;
  5. revisar el diff de renames y enlaces;
  6. emitir handoff al agente Supabase antes del merge.

### V4-ARCH-DEBT-017 — Mapear perfiles históricos al targeting canónico

- **Estado:** `CLOSED` como decisión de gobernanza; el archivado físico queda fuera de alcance.
- `content/profiles/docente/README.md` declara esa ruta como carpeta editorial histórica/puente y reconoce los mismos seis códigos.
- `history/PROVENANCE.md` establece que el trabajo nuevo y la futura persistencia deben usar `content/targeting/profiles/docentes.json` como catálogo canónico.
- Las carpetas legacy no se eliminan hasta revisar sus consumidores en una tarea separada.

### V4-ARCH-DEBT-018 — Aplicar/verificar `0028` fuera del entorno local

- **Estado:** `OPEN`.
- **Responsable lógico:** migración/operación Supabase, no reorganización documental.
- `0028` está implementada y validada localmente, pero no existe aquí evidencia de aplicación/activación productiva.
- **Cierre requerido:** ambiente, migration history, conteos, resultado del batch, estado de activación, gates de seguridad/E2E y rollback.

### V4-ARCH-DEBT-019 — Actualizar documento arquitectónico tras la reorganización física

- **Estado:** `OPEN`.
- `docs/03-architecture/question-bank-knowledge-targeting-architecture.md` fue escrito cuando la migración histórica estaba en ejecución.
- **Cierre requerido:** reflejar que `history/` ya está materializado, que `0028` está versionada y que SQL de targeting/knowledge empieza solo desde el siguiente número libre posterior.

## Handoff obligatorio al agente de Supabase

Antes de integrar esta rama o iniciar SQL de targeting/knowledge, comunicar como mínimo:

1. `0028` ya pertenece a la secuencia versionada y `0029` es solo candidato condicionado al siguiente número libre;
2. `V4-ARCH-DEBT-018` sigue abierta: validación local no equivale a despliegue productivo;
3. la reorganización de `history/` no modifica el corpus, `MANIFEST.json`, `legacy-processing-register.csv` ni las migraciones;
4. `MANIFEST.json` y el registro operacional permanecen en raíz por sus consumidores;
5. targeting/knowledge es una evolución aditiva y no reemplaza el importador atómico;
6. `content/targeting/profiles/docentes.json` es el catálogo canónico futuro de perfiles; `content/profiles/docente/` es histórico/puente;
7. cualquier decisión sobre `editorial_scope`, `opec_id`, vistas, RLS o nuevas tablas debe contrastarse con la arquitectura y este registro de deuda.

## Regla de mantenimiento

Cada nueva dependencia, incompatibilidad o decisión diferida debe crear o actualizar una entrada `V4-ARCH-DEBT-###`, con estado, condición de cierre e impacto sobre Supabase cuando corresponda. Una deuda solo se marca `CLOSED` con evidencia verificable.
