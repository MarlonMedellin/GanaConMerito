---
id: DEL-SPRINT-42-RICH-INGESTION
name: sprint-42-rich-ingestion-normalization-plan
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: delivery
modules: [tutor, taxonomy, content]
tags: [sprint, ingestion, taxonomy, tutor]
last_reviewed: 2026-05-09
---

# Sprint 42 — Rich Ingestion Normalization

## Objetivo
Conectar la gobernanza semántica de Sprint 41 con la lectura real del banco de ítems, de modo que la metadata rica pueda validarse, normalizarse y consumirse sin romper compatibilidad con runtime ni inventar semántica ausente.

## Alcance
1. Definir el formato canónico operativo del item rico que el runtime sí podrá leer.
2. Incorporar lectura segura de campos ricos en las consultas del banco activo o su capa adaptadora.
3. Crear pipeline de normalización y validación editorial para lotes o ítems individuales.
4. Generar reportes de errores y cobertura por taxonomía, tags y perfiles.
5. Mantener fallback legacy para que el runtime actual no se rompa si una columna rica no existe o viene vacía.

## No alcance
- No cerrar todavía el frente normativo `source_verified`.
- No abrir Tutor GCM como chat libre ni darle autoridad operativa.
- No mover scoring, selección de ítems o transición de sesión al LLM.
- No hacer rediseño grande de schema si basta con capa de lectura/adaptación.
- No mezclar este sprint con features UX cosméticas o dashboard nuevo.

## Archivos probables a tocar
- `src/lib/tutor/tutor-evidence-builder.ts`
- `src/domain/taxonomy/normalize-item.ts`
- `src/domain/taxonomy/validators.ts`
- `src/domain/taxonomy/schema.ts`
- `src/domain/tutor/question-truth-adapter.ts`
- `scripts/validate-question-bank.ts`
- `src/lib/tutor/tutor.test.ts`
- `docs/project/status.md`
- `docs/02-delivery/sprint-log.md`
- `docs/02-delivery/change-log.md`
- `docs/01-product/backlog.md`

## Entregables esperados

### 1. Formato canónico de item rico
Definir y documentar el shape mínimo operativo con estos grupos:
- identidad: `id`, `slug`, `version`, `estado`
- taxonomía: `area`, `subarea`, `competency`, `nivel_educativo`, `tipo_item`, `nivel_cognitivo`, `dificultad`
- perfil: `targetRole`, `targetPosition`, `applicantProfile`
- contenido: `stem` o `enunciado`, `options`, `correctOption`, `correctExplanation`
- semántica extra: `tags`, `evidenceStatement`, `affirmation`, `technicalRisks`, `distractorRationales`

### 2. Lectura runtime segura
- Expandir la lectura del banco activo solo donde exista soporte real.
- Si una columna rica no existe, usar fallback seguro y trazable.
- No fallar el runtime completo por metadata rica opcional faltante.
- No promover automáticamente a canónico un valor libre no validado.

### 3. Pipeline de normalización
Agregar funciones que detecten y clasifiquen al menos:
- campo faltante
- valor taxonómico no canónico
- tag no permitido
- tag deprecado normalizable
- subárea inexistente
- competencia no canónica
- `targetPosition` o `targetRole` inválidos
- riesgo técnico mal formado
- distractor sin justificación

### 4. Reportes editoriales
Producir una salida verificable con:
- ítems aptos
- ítems aptos con warnings
- ítems rechazados
- faltantes por campo
- cobertura por `area/subarea/competency`
- cobertura por `targetPosition`
- cobertura por categoría de tags

### 5. Compatibilidad backward
Preservar estos flujos:
- legacy item -> normalized rich item
- rich item -> QuestionTruth
- QuestionTruth -> TutorSupportContract

El objetivo es ampliar lectura y validación, no romper el Tutor actual.

## Pruebas obligatorias
- `npm run test:tutor`
- `npm run test:recent-sprints`
- `npm run test:unit`
- `npm run lint`
- `npm run build`

Si el sprint termina en promoción operativa sobre VPS, recordar siempre:
1. actualizar primero la carpeta fuente `~/.openclaw/product`
2. alinear después el deploy tree `/opt/gcm/app`
3. actualizar, reconstruir, reiniciar o verificar Docker según corresponda
4. validar al final en `https://cnsc.profemarlon.com`

## Riesgos
- Que la estructura real del banco activo no tenga todavía todas las columnas ricas esperadas.
- Que se mezclen campos legacy con metadata nueva sin trazabilidad.
- Que una normalización demasiado estricta rompa compatibilidad con items existentes.
- Que el sprint derive en migraciones amplias innecesarias cuando basta con capa de lectura y validación.

## Criterio de cierre
Sprint 42 puede cerrarse cuando:
- el runtime lea de forma segura metadata rica donde exista
- la validación editorial detecte errores reales de taxonomía y tags
- el fallback legacy siga funcionando
- los documentos canónicos reflejen con precisión qué metadata rica ya se consume y cuál sigue pendiente
