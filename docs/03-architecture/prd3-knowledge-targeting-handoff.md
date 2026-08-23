# Handoff PRD 3 — Knowledge + Targeting

**Estado:** contrato de coordinación entre la consolidación editorial/arquitectónica y la implementación Supabase de PRD 3.  
**Rama de origen:** `reorg-v4-architecture-20260822`.  
**Base sincronizada al freeze:** `master@7be92b655dee4965872963f1ca57d6eb96107599`.  
**PR arquitectónico:** #97, todavía draft y no fusionado.  
**Ejecución paralela:** **AUTORIZADA** en rama independiente. Antes de fusionar cualquier migración/backfill/selector, contrastar este handoff, los contratos editoriales de #97 y la secuencia de migraciones vigente en `master`.

## 1. Frontera V4 vigente después del checkpoint de Codex

La secuencia `0001–0029` ya está ocupada en repositorio.

- `0028_atomic_v4_batch_import.sql` fue aplicada en producción **sin ejecutar el lote V4**.
- Producción quedó con 163 V4 presentes, 85 faltantes, 652 opciones y cero V4 activas/publicadas/en piloto según el checkpoint versionado.
- `0029_harden_v4_manifest_reconciliation.sql` está versionada y validada localmente, pero **no aplicada en producción** al freeze.
- El lote canónico de 248 reactivos **no fue importado en producción** en ese checkpoint.
- PRD 3 continúa abierto.

Evidencia operativa: `docs/04-quality/prd-3-v4-production-checkpoint-2026-08-22.md`.

Preservar:

- `item_bank`;
- UUID existentes;
- los 248 reactivos congelados;
- `content/question-bank-v4/MANIFEST.json`;
- `content/question-bank-v4/legacy-processing-register.csv` mientras tenga consumidores;
- vistas/controles de seguridad V4;
- `item_bank.opec_id` durante la transición;
- migraciones `0001–0029` sin reescritura.

**Regla numérica:** releer siempre `supabase/migrations/` antes de escribir. Con el estado del freeze, una migración nueva de targeting/knowledge debe comenzar en `0030` o superior; nunca reutilizar `0029`.

## 2. Contratos editoriales canónicos

### Familia

`content/targeting/families/docentes.json`

### Perfiles/cargos

`content/targeting/profiles/docentes.json`

Códigos congelados para esta etapa:

- `rector_director_rural`
- `coordinador`
- `docente_aula_preescolar`
- `docente_aula_basica_primaria`
- `docente_aula_secundaria_media`
- `docente_orientador`

`content/profiles/docente/` es histórico/puente y no debe convertirse en un segundo catálogo.

### Semántica simple de targeting congelada

Hasta canary/pruebas con primeros usuarios:

```text
perfil reutilizable → positionName oficial → OPEC concreta
```

- **perfil**: grupo reusable de preparación;
- **`positionName`**: denominación oficial concreta del cargo/área;
- **OPEC**: oferta concreta y trazable.

No crear perfiles por disciplina (`docente_matematicas`, `docente_filosofia`, etc.) mientras `positionName` resuelva esa especificidad. No introducir ahora capas adicionales `area`, `specialty` o `employment_identity`.

### OPEC

- contrato: `content/targeting/opecs/README.md`
- schema: `content/targeting/opecs/catalog.schema.json`
- catálogo: `content/targeting/opecs/catalog.json`

El catálogo está vacío de manera deliberada. No inventar OPEC de ejemplo. Una OPEC debe ser real, trazable y mapear a un perfil canónico.

### Reactivo → targeting

- contrato: `content/targeting/item-maps/README.md`
- schema: `content/targeting/item-maps/item-target-map.schema.json`
- mapa V4: `content/targeting/item-maps/question-bank-v4.json`

El mapa V4 inicia vacío de forma deliberada. Es la vía canónica para añadir targeting a los 248 reactivos sin modificar sus JSON congelados.

### Fuentes de conocimiento

- inventario: `content/knowledge-base/catalog/source-inventory.json`
- biblioteca canónica: `content/knowledge-base/sources/`
- mapas de aplicabilidad: `content/knowledge-base/maps/`
- schema de mapas: `content/knowledge-base/maps/map.schema.json`

`content/question-bank-v4/sources/` es solo capa de compatibilidad/navegación y no una segunda biblioteca.

Una fuente real debe tener una sola identidad canónica. Su aplicabilidad se expresa mediante relaciones, no mediante copias por perfil u OPEC.

El inventario puede registrar identidad y URL oficial sin declarar una fuente completamente verificada. `verificationStatus: needs_review` debe preservarse hasta revisar vigencia/localizador del contenido normativo usado.

No se crean mapas `active` mientras la fuente asociada no tenga `verificationStatus: verified`.

### Rol de fuentes sin nuevas capas de datos

Los agentes deben distinguir:

- norma/Acuerdo/Anexo/OPEC oficial → reglas oficiales en su ámbito;
- matriz/guía/ejes oficiales → orientación de evaluación;
- temario/material académico/técnico → material de estudio y construcción.

Esta distinción es documental. No crear ahora otra taxonomía, tabla o campo de pregunta para representarla.

## 3. Modelo relacional esperado

La implementación puede ajustar nombres técnicos si existe una razón documentada, pero debe conservar estas responsabilidades:

- `target_families`
- `target_profiles`
- `opec_catalog`
- `item_target_profiles`
- `item_opec_targets`
- `knowledge_sources`
- `knowledge_source_targets`
- `item_source_links`

Principio de herencia conceptual al seleccionar una OPEC:

```text
OPEC concreta
  + preguntas propias de la OPEC
  + preguntas del perfil asociado
  + preguntas comunes de la familia
```

No duplicar reactivos para materializar esta herencia.

## 4. Taxonomía y targeting son capas distintas

`domain`, `topic`, `competency`, dificultad y tipo de pregunta describen **qué se evalúa**.

Familia, perfil/cargo y OPEC describen **a quién aplica**.

No crear cargos como `topic` ni usar la taxonomía como sustituto del targeting.

## 5. Relaciones many-to-many

Un reactivo puede aplicar a varios perfiles. Una fuente puede aplicar a múltiples familias/perfiles/OPEC. Una OPEC concreta pertenece a un perfil canónico, pero muchas OPEC pueden compartir perfil.

No asumir una sola columna de perfil por pregunta como modelo final.

## 6. Corpus V4 congelado

No añadir campos de targeting a los 248 JSON congelados para resolver PRD 3.

El mapeo debe implementarse externamente mediante `content/targeting/item-maps/` y tablas relacionales hasta que exista una evolución contractual explícita de V4.

No introducir `profile_specific` dentro de `editorial_scope` únicamente desde SQL. V4 continúa con el contrato vigente hasta una evolución coordinada de contrato, validador, importador, manifiesto y DB.

## 7. Backfill

No inferir relaciones definitivas por coincidencia de palabras clave.

Un clasificador automático puede producir mappings `candidate`, pero una relación canónica debe pasar por revisión editorial. En el contrato actual, `approved` exige evidencia.

Los 248 reactivos todavía no tienen cerrado su mapa many-to-many por perfil/OPEC. `question-bank-v4.json` permanece vacío hasta iniciar esa revisión.

## 8. Gate de catálogos, mapas y vocabularios

La rama arquitectónica incorpora:

```text
npm run content:validate:knowledge-targeting
```

El comando ejecuta `scripts/validate-knowledge-targeting.ts` y `scripts/validate-knowledge-vocabularies.ts`, y está conectado a `PR Checks`.

Valida:

- `familyCode` existente;
- pertenencia `profileCode → familyCode`;
- unicidad de identidad externa OPEC;
- `active => verificationStatus=verified` para OPEC;
- unicidad de `sourceId`;
- vocabulario de fuentes `needs_review|verified|rejected`;
- mapas de conocimiento contra inventario/familias/perfiles/OPEC;
- una relación de conocimiento `active` solo si la fuente está `verified` y la relación tiene `verifiedAt` + `verifiedBy`;
- `itemId` de los item maps contra los IDs del `MANIFEST.json` V4;
- destinos de familia/perfil/OPEC existentes;
- targets duplicados dentro de un mapping;
- `approved` de reactivo con evidencia editorial.

PRD 3 debe ejecutar este gate antes de consumir/importar catálogos o mappings editoriales.

Además, `npm run content:inventory:v4-sources` recorre los 248 reactivos y genera un inventario determinista de sus `source.reference`; ese inventario es materia prima para normalizar `source.reference → sourceId → item_source_links`, nunca autorización automática para promover una referencia textual a fuente canónica.

## 9. Temario docente — advertencia de integridad

`content/knowledge-base/themes/docentes/temario-base.md` **no debe utilizarse todavía como entrada automática de gap analysis o backfill**.

Se comprobó que la copia actual del repositorio no es byte a byte idéntica al archivo original aportado:

- original `temas(3).md`: 94.850 bytes; SHA-256 `4dd3e7d1df2af89e4818f77ca244dc26187930a8d7faf19d1c7f05538bc88bb7`; Git blob SHA `f5c90d8393f8dbb7a83794134b27b1a0849de807`;
- copia actual del repositorio: 95.094 bytes; Git blob SHA `2d022f1d66e5d98653178d3d772db210c3aec442`.

Además se confirmó al menos una duplicación accidental en la copia: una segunda entrada `7. Competencia - Capacidad de Agencia...` aparece después de `5. Tema - Tiempos del PARD`, donde no existe en el original.

La restauración íntegra está pendiente bajo `V4-ARCH-DEBT-021`. No derivar persistencia, targeting ni cobertura automática desde esa copia hasta cerrar la deuda.

## 10. Producción

Este handoff **no autoriza nuevas escrituras productivas**.

El checkpoint anterior sí aplicó `0028` en producción sin ejecutar el lote. `0029` y el lote V4 permanecen pendientes. Cualquier aplicación remota/productiva posterior requiere autorización explícita del propietario y un preflight nuevo sobre el `master` vigente.

## 11. Deudas que PRD 3 debe conocer

Consultar `docs/03-architecture/question-bank-v4-consolidation-debt.md`.

Especialmente:

- `V4-ARCH-DEBT-007` — normalización/verificación de knowledge sources;
- `V4-ARCH-DEBT-008` — catálogo OPEC real;
- `V4-ARCH-DEBT-009` — poblar y revisar el mapa 248 reactivos → perfiles/OPEC;
- `V4-ARCH-DEBT-011` — posible evolución futura de `editorial_scope`;
- `V4-ARCH-DEBT-018` — continuidad operativa de `0029`/lote fuera del entorno local;
- `V4-ARCH-DEBT-021` — integridad exacta del temario base.

La deuda de crear contratos machine-readable y validación para mapas de reactivos/fuentes queda resuelta mediante los schemas y `content:validate:knowledge-targeting`.

## 12. Freeze de arquitectura/onboarding

Con este checkpoint se congela la estructura de onboarding/knowledge/targeting hasta la fase canary y primeras pruebas con stakeholders/early adopters.

Antes de canary solo se reabre por una causa estrictamente necesaria:

1. defecto de corrección que impida el flujo previsto;
2. vulnerabilidad o ruptura de frontera de seguridad;
3. riesgo demostrable de pérdida/corrupción de datos;
4. incompatibilidad objetiva con una migración ya aplicada que no admita solución compatible.

Preferencias de modelado, nuevos niveles, renombres o mayor granularidad se difieren hasta tener evidencia de uso real.

## 13. Regla de coordinación

PRD 3 puede continuar en rama independiente sobre el `master` vigente. Debe releer `master` antes de empezar porque puede haber avanzado después de este freeze.

Si #97 aún no está fusionado, PRD 3 debe leer este handoff directamente desde `reorg-v4-architecture-20260822` y evitar editar los mismos contratos editoriales. Antes de fusionar SQL o backfills, debe contrastar sus decisiones contra #97.

Si PRD 3 necesita cambiar alguno de estos contratos, no debe crear silenciosamente una semántica paralela. Debe documentar el bloqueo y solicitar reapertura del freeze únicamente si cumple uno de los criterios estrictos de la sección anterior.
