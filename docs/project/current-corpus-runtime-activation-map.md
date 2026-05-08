---
id: PROJ-CORPUS-ACTIVATION-MAP
name: current-corpus-runtime-activation-map
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: project
modules: [question-bank, editorial]
tags: [corpus, question-bank, runtime, activation]
related:
  - docs/05-ops/question-bank-load-runbook.md
  - docs/database/content-model.md
  - docs/project/reference/estructura-hibrida-taxonomia-perfiles-docente.md
last_reviewed: 2026-05-08
---

# Current Corpus Runtime Activation Map

Este documento sirve como la verdad estática y auditable del banco de preguntas que debe estar activo en el runtime para la versión actual del producto. Cualquier cambio en esta lista debe ser reflejado en `scripts/question-bank-current-corpus.ts` y validado mediante `npm run content:verify:backfill-active`.

## Resumen del Corpus Activo
- **Total de ítems esperados**: 27
- **Estado de validación**: VERDE (validado el 2026-05-02)
- **Fuente de verdad en repo**: `content/items/`
- **Fuente de verdad en runtime**: `public.v_item_bank_active` (Supabase)
- **Regla estructural**: el listado activo sigue una base taxonómica por área; los metadatos de perfil docente, si existen, son una segunda capa editorial y no alteran esta lista de activación.

## Listado de ítems activados

### Competencias Ciudadanas (5)
1. `content/items/competencias_ciudadanas/ciudadanas-participacion-001.md`
2. `content/items/competencias_ciudadanas/ciudadanas-participacion-002.md`
3. `content/items/competencias_ciudadanas/ciudadanas-pluralidad-diversidad-001.md`
4. `content/items/competencias_ciudadanas/ciudadanas-responsabilidad-democratica-001.md`
5. `content/items/competencias_ciudadanas/ciudadanas-responsabilidad-democratica-002.md`

### Gestión (5)
6. `content/items/gestion/gestion-gestion-academica-001.md`
7. `content/items/gestion/gestion-gestion-academica-002.md`
8. `content/items/gestion/gestion-planeacion-institucional-001.md`
9. `content/items/gestion/gestion-seguimiento-mejora-001.md`
10. `content/items/gestion/gestion-seguimiento-mejora-002.md`

### Lectura Crítica (4)
11. `content/items/lectura_critica/lectura-critica-analisis-argumentativo-001.md`
12. `content/items/lectura_critica/lectura-critica-analisis-argumentativo-002.md`
13. `content/items/lectura_critica/lectura-critica-estructura-textual-001.md`
14. `content/items/lectura_critica/lectura-critica-interpretacion-textual-001.md`

### Matemáticas (3)
15. `content/items/matematicas/matematicas-analisis-datos-002.md`
16. `content/items/matematicas/matematicas-resolucion-problemas-001.md`
17. `content/items/matematicas/matematicas-resolucion-problemas-002.md`

### Normatividad (5)
18. `content/items/normatividad/normatividad-convivencia-escolar-001.md`
19. `content/items/normatividad/normatividad-convivencia-escolar-002.md`
20. `content/items/normatividad/normatividad-evaluacion-normativa-001.md`
21. `content/items/normatividad/normatividad-funcion-docente-001.md`
22. `content/items/normatividad/normatividad-inclusion-001.md`

### Pedagogía (5)
23. `content/items/pedagogia/pedagogia-evaluacion-aprendizaje-001.md`
24. `content/items/pedagogia/pedagogia-evaluacion-aprendizaje-002.md`
25. `content/items/pedagogia/pedagogia-inclusion-001.md`
26. `content/items/pedagogia/pedagogia-inclusion-002.md`
27. `content/items/pedagogia/pedagogia-planeacion-aula-001.md`

## Reglas de Gobernanza
- **Reentrada**: Para que un ítem nuevo entre a esta lista, debe ser validado con `npm run content:validate` y cargado a Supabase.
- **Exclusión**: Los ítems no listados aquí se consideran `legacy` o `inactive` y no deben ser servidos por la vista `v_item_bank_active`.
- **Trazabilidad**: Cada release debe incluir una verificación de que el `activeCount` en base de datos coincide con los 27 ítems aquí listados.
- **Estructura editorial**: La activación en runtime sigue leyendo archivos finales desde `content/items/`; `content/profiles/docente/` no es una lista paralela de activación.
