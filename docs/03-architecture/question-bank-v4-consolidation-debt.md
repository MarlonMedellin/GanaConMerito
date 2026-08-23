# Deuda de consolidación — Banco V4, Knowledge, Targeting y Supabase

**Estado:** registro vivo de coordinación arquitectónica.  
**Rama de trabajo inicial:** `reorg-v4-architecture-20260822`.  
**Regla:** este archivo registra trabajo pendiente o diferido; no autoriza cambios de runtime, SQL, backfills ni modificación del corpus congelado por sí mismo.

## Objetivo

Evitar que la reorganización física del banco V4, la migración a Supabase y la nueva arquitectura `knowledge + taxonomy + targeting` evolucionen como líneas desconectadas. Cada deuda debe tener una condición de cierre verificable y, cuando afecte a otro agente, una nota de coordinación explícita.

## Estados

- `OPEN`: pendiente y accionable.
- `BLOCKED`: depende de otro cambio o agente.
- `IN_PROGRESS`: trabajo iniciado.
- `DEFERRED`: decisión consciente de posponer; no es un error inmediato.
- `CLOSED`: resuelta y verificada.

## Registro

### V4-ARCH-DEBT-001 — Reconciliar documentación tras migración `0028`

- **Estado:** `BLOCKED`.
- **Dependencia:** publicación por el agente de Supabase de `0028`, reservada para el importador V4 atómico.
- **Problema:** parte de la documentación aún describe migraciones `0019`–`0028` en lenguaje prospectivo aunque varias ya estén materializadas.
- **Acción de cierre:** después de publicada `0028`, releer `master`, comprobar la secuencia real de `supabase/migrations/` y actualizar PRD/contratos para separar con claridad:
  - **V4 implementado**;
  - **targeting/knowledge pendiente**.
- **Regla de numeración:** targeting/knowledge no debe asumir `0029`; debe usar `0029` o el siguiente número realmente libre después de volver a inspeccionar `master`.
- **Coordinación externa:** informar siempre al agente de Supabase antes de diseñar la primera migración de targeting/knowledge.

### V4-ARCH-DEBT-002 — Completar migración de históricos V4 a `history/`

- **Estado:** `IN_PROGRESS`.
- **Problema:** la raíz de `content/question-bank-v4/` todavía mezcla estado operativo con `AUDIT-*`, `REAUDIT-*`, `REMEDIATION-*`, `COVERAGE-*` y `EXPANSION-*` históricos.
- **Acción de cierre:** mover por lotes verificables a:
  - `history/audits/`;
  - `history/remediation/`;
  - `history/snapshots/`;
  - `history/expansion/`;
  actualizando enlaces internos y externos.
- **Criterio de cierre:** ningún histórico permanece en raíz salvo excepción documentada por dependencia técnica.

### V4-ARCH-DEBT-003 — Mapear y corregir referencias a rutas históricas

- **Estado:** `IN_PROGRESS`.
- **Problema:** varios históricos se enlazan entre sí mediante rutas relativas desde la raíz.
- **Acción de cierre:** por cada lote movido, buscar referencias por nombre exacto y actualizar los documentos consumidores.
- **Criterio de cierre:** búsquedas de las rutas antiguas no deben devolver consumidores activos, salvo notas históricas que mencionen deliberadamente la ruta anterior.

### V4-ARCH-DEBT-004 — Decidir destino de `legacy-processing-register.csv`

- **Estado:** `DEFERRED`.
- **Problema:** visualmente pertenece a control/trazabilidad, pero actualmente tiene consumidores operativos y de importación, incluyendo `scripts/lib/v4-import-plan.ts` y documentación/skills.
- **Acción de cierre:** definir destino estable (por ejemplo `state/` o un registro operacional específico), actualizar todos los consumidores en el mismo cambio y ejecutar los gates V4.
- **Regla:** no mover el archivo solo por orden visual.

### V4-ARCH-DEBT-005 — Evaluar si `MANIFEST.json` debe permanecer permanentemente en raíz

- **Estado:** `DEFERRED`.
- **Problema:** la arquitectura objetivo introdujo `state/`, pero `MANIFEST.json` es hoy autoridad canónica y su ruta es consumida por scripts/CI.
- **Decisión actual:** permanece en la raíz.
- **Acción de cierre:** o bien documentar la raíz como ubicación permanente, o realizar una migración coordinada de todos los consumidores con gates reproducibles.
- **Regla:** no moverlo durante la reorganización documental ordinaria.

### V4-ARCH-DEBT-006 — Clarificar el rol de `question-bank-v4/sources/` frente a `knowledge-base/`

- **Estado:** `OPEN`.
- **Problema:** existe una carpeta local `sources/` por compatibilidad, mientras la fuente de conocimiento transversal debe vivir en `content/knowledge-base/`.
- **Acción de cierre:** inventariar `sources/`, decidir qué queda como índice/compatibilidad V4 y qué fuente debe migrar o registrarse en `knowledge-base/`, sin duplicar documentos.
- **Criterio:** una fuente real tiene una sola identidad y ubicación canónica; los demás puntos son referencias o mapas.

### V4-ARCH-DEBT-007 — Inventariar y normalizar corpus de conocimiento

- **Estado:** `OPEN`.
- **Problema:** la arquitectura existe, pero falta poblar de forma gobernada `knowledge-base/sources/` con normas, guías, teoría y documentos técnicos.
- **Acción de cierre:** inventario, deduplicación por identidad de fuente, metadatos de vigencia, localizadores y mapas de aplicabilidad.
- **Regla:** no convertir automáticamente el temario original en fuentes verificadas ni en `topics`.

### V4-ARCH-DEBT-008 — Crear catálogo real de OPEC y su mapeo a perfiles

- **Estado:** `OPEN`.
- **Problema:** ya existen familia y perfiles docentes canónicos, pero aún falta el catálogo de OPEC concretas y su relación estable con perfiles/cargos.
- **Acción de cierre:** definir formato de `content/targeting/opecs/`, identidad externa, convocatoria, entidad, cargo y `profile_code` asociado.
- **Dependencia:** puede avanzar documentalmente antes de SQL; la persistencia final depende de la evolución Supabase.

### V4-ARCH-DEBT-009 — Mapear los 248 reactivos V4 a perfiles/cargos

- **Estado:** `OPEN`.
- **Problema:** el corpus congelado no contiene todavía relaciones many-to-many de targeting.
- **Acción de cierre:** construir un mapa externo revisado editorialmente para familia/perfiles y, cuando corresponda, OPEC.
- **Regla:** no inferir perfiles por palabras clave como decisión final y no duplicar reactivos.
- **Dependencia:** el mapa puede existir en repositorio antes de la migración SQL.

### V4-ARCH-DEBT-010 — Implementar targeting/knowledge en Supabase de forma aditiva

- **Estado:** `BLOCKED`.
- **Dependencia:** estabilización y publicación del importador V4 atómico (`0028`) y nueva inspección de la secuencia de migraciones.
- **Alcance esperado:** catálogos/relaciones equivalentes a `target_families`, `target_profiles`, `opec_catalog`, `item_target_profiles`, `item_opec_targets`, `knowledge_sources`, `knowledge_source_targets`, `item_source_links`.
- **Regla:** conservar `item_bank`, UUID, vistas seguras y `opec_id` durante la transición; no reescribir migraciones aplicadas.

### V4-ARCH-DEBT-011 — Resolver evolución de `editorial_scope`

- **Estado:** `DEFERRED`.
- **Problema:** V4 distingue hoy `general` y `opec_specific`; la nueva arquitectura permite targeting a perfiles sin exigir duplicación.
- **Acción de cierre:** decidir si basta con relaciones externas o si un futuro contrato V4.x necesita `profile_specific`.
- **Regla:** no introducir `profile_specific` solo en SQL ni silenciosamente; cualquier cambio exige contrato, validador, importador, manifest y DB coherentes.

### V4-ARCH-DEBT-012 — Convertir `temario-base.md` en insumo trazable de gap analysis sin alterar el original

- **Estado:** `OPEN`.
- **Problema:** el temario original está preservado, pero contiene material heterogéneo, posibles duplicaciones, formulaciones históricas y referencias por verificar.
- **Acción de cierre:** crear un artefacto derivado separado con unidades temáticas normalizadas, fuente/verificación, cobertura V4 y targeting candidato.
- **Regla:** `temario-base.md` permanece inmutable como fuente original; el artefacto derivado no se convierte automáticamente en taxonomía.

### V4-ARCH-DEBT-013 — Verificar consumidores después de cada reorganización física

- **Estado:** `IN_PROGRESS`.
- **Problema:** una ruta puede ser usada por scripts, workflows, documentación o skills aunque el archivo parezca histórico.
- **Acción de cierre:** antes de cada movimiento: búsqueda de consumidores; después del movimiento: comparación de rama, validación V4 y revisión de referencias.
- **Regla:** cualquier archivo con consumidor runtime/CI se pospone o se migra junto con ese consumidor.

### V4-ARCH-DEBT-014 — Preservar provenance del antiguo `temas.md`

- **Estado:** `OPEN`.
- **Problema:** informes históricos de expansión mencionan un `temas.md` usado en el proceso editorial original, mientras la arquitectura actual preserva el insumo docente en `content/knowledge-base/themes/docentes/temario-base.md`.
- **Riesgo:** reemplazar retrospectivamente todas las menciones a `temas.md` haría parecer que los lotes históricos fueron construidos desde una ruta que no existía entonces y degradaría la trazabilidad.
- **Acción de cierre:** crear una nota/índice de provenance que documente la relación entre el insumo histórico y el temario preservado actualmente, indicando qué puede demostrarse y qué no.
- **Regla:** no reescribir afirmaciones históricas para modernizarlas; enlazar la equivalencia/procedencia desde documentación de consolidación.

### V4-ARCH-DEBT-015 — Crear índice estable de historial V4

- **Estado:** `OPEN`.
- **Problema:** al sacar los informes históricos de la raíz mejora la arquitectura, pero disminuye su descubribilidad para agentes y humanos si solo quedan carpetas por tipo.
- **Acción de cierre:** crear un índice cronológico/por fase dentro de `history/` que relacione expansión → auditoría → remediación → snapshot y señale claramente qué documentos son solo históricos.
- **Criterio:** un agente nuevo debe poder reconstruir la evolución editorial sin depender de los nombres de archivo ni de la antigua estructura de raíz.

### V4-ARCH-DEBT-016 — Gate final de reorganización antes de merge

- **Estado:** `OPEN`.
- **Problema:** los movimientos de archivos pueden ser correctos individualmente pero dejar referencias, documentación o consumidores desalineados al acumularse.
- **Acción de cierre:** inmediatamente antes del PR/merge de esta rama:
  1. comparar la rama contra `master`;
  2. confirmar que `items/`, `taxonomy/`, `MANIFEST.json`, `legacy-processing-register.csv`, `src/`, `scripts/` y `supabase/` no cambiaron salvo decisión explícita aprobada;
  3. buscar referencias a antiguas rutas históricas;
  4. ejecutar los gates V4 disponibles;
  5. revisar que los renames no alteraron bytes de los históricos salvo reparaciones documentales de enlace explícitamente registradas;
  6. generar un handoff ejecutivo para el agente de Supabase.
- **Criterio de cierre:** reorganización estructural verificable sin cambios de corpus ni contrato runtime.

### V4-ARCH-DEBT-017 — Mapear perfiles históricos al catálogo de targeting canónico

- **Estado:** `OPEN`.
- **Problema:** documentación histórica de expansión referencia `content/profiles/docente/` y usa perfiles como insumo contextual. La arquitectura actual define la identidad canónica de perfiles en `content/targeting/profiles/docentes.json`.
- **Riesgo:** reemplazar retrospectivamente la ruta histórica ocultaría cómo se produjo el corpus; ignorarla puede llevar a que un agente trate ambos catálogos como fuentes canónicas concurrentes.
- **Acción de cierre:** documentar un mapa de equivalencia/provenance entre los perfiles históricos y los `profile_code` actuales; revisar si `content/profiles/docente/` sigue teniendo consumidores y decidir su retiro, compatibilidad o archivado en una tarea separada.
- **Regla:** para nuevas decisiones de targeting se usa `content/targeting/`; las rutas históricas se conservan solo como evidencia de proceso hasta cerrar esta deuda.
- **Impacto Supabase:** el agente de migración debe usar los códigos canónicos de `content/targeting/profiles/docentes.json`, nunca derivar una segunda tabla de perfiles desde la estructura legacy.

## Handoff obligatorio al agente de Supabase

Antes de integrar esta rama o iniciar SQL de targeting/knowledge, comunicar al agente de Supabase como mínimo:

1. estado de `V4-ARCH-DEBT-001` y número real de última migración publicada;
2. que `0028` está reservada para su importador V4 atómico mientras no informe lo contrario;
3. que la reorganización de `history/` no cambia el corpus ni `MANIFEST.json`;
4. que `legacy-processing-register.csv` y `MANIFEST.json` no se moverán sin migrar consumidores;
5. que targeting/knowledge es una evolución aditiva posterior y no debe invalidar su importador;
6. usar `content/targeting/profiles/docentes.json` como catálogo canónico de perfiles para la evolución futura, no estructuras legacy;
7. cualquier deuda nueva con impacto en contrato, importación, vistas, RLS o esquema.

## Regla de mantenimiento

Cada vez que durante esta reorganización aparezca una dependencia, decisión diferida o incompatibilidad potencial:

- agregar una entrada `V4-ARCH-DEBT-###`;
- indicar estado y condición de cierre;
- señalar si afecta al agente de Supabase;
- cerrar la deuda solo con evidencia verificable en repositorio o gates.
