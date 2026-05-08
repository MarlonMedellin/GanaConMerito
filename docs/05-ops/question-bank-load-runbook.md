---
id: OPS-QUESTION-BANK-LOAD
name: question-bank-load-runbook
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: runbook
modules: [question-bank, supabase]
tags: [runbook, banco-de-preguntas, importacion, validacion]
related:
  - OPS-RUNBOOK
  - DEL-QB-LOAD-CLOSE-2026-04-26
  - docs/database/content-model.md
last_reviewed: 2026-05-08
---

# Runbook mínimo — validación e importación controlada del banco

## Objetivo
Dejar repetible la validación local y la recarga controlada del corpus actual del banco sin depender de selección manual de archivos.

## Alcance actual
Este runbook apunta al corpus operativo cerrado en abril de 2026:
- 27 ítems del corpus actual

Fuente del lote controlado:
- `scripts/question-bank-current-corpus.ts`

## Regla estructural del banco
Antes de ejecutar la carga, recordar esta distinción:
- `content/items/` = carpeta canónica de ítems finales
- `content/profiles/docente/` = capa operativa de trabajo editorial por perfil
- la importación actual toma los ítems finales desde `content/items/`
- la segmentación por perfil en el Markdown es secundaria y opcional; no reemplaza `area`, `subarea` ni `competency`

## Preflight local
Desde `/home/ubuntu/.openclaw/product`:

```bash
npm run content:validate
npm run content:smoke:active
```

Resultado esperado:
- ambos comandos con exit code `0`
- `content:validate` devuelve resumen JSON con `scope = current-corpus`, `validatedFiles = 27` y `errorCount = 0`
- `content:smoke:active` devuelve `summary.errorCount = 0`

Si se necesita auditar todo `content/items`:

```bash
npm run content:validate:all
```

## Qué valida hoy el preflight
- campos canónicos obligatorios del frontmatter
- estructura del cuerpo del ítem
- exactamente 4 opciones
- unicidad y consistencia básica de claves editoriales
- catálogo controlado de metadatos secundarios cuando aparezcan:
  - `targetRole`
  - `targetPosition`
  - `applicantProfile`

## Importación controlada del corpus actual
Solo ejecutar cuando exista `SUPABASE_SERVICE_ROLE_KEY` válida en el entorno activo.

```bash
npm run content:import:current
```

Comportamiento:
- importa únicamente el lote definido en `question-bank-current-corpus.ts`
- respeta el orden controlado del lote
- devuelve resumen JSON con `attempted`, `ok` y `failed`
- sale con código `1` si falla al menos un archivo

## Secuencia operativa recomendada
1. Ejecutar `npm run content:validate`
2. Ejecutar `npm run content:smoke:active`
3. Confirmar variables Supabase del entorno real
4. Ejecutar `npm run content:import:current`
5. Guardar evidencia del resumen de salida si la carga fue parte de una operación real
6. Si cambia el corpus aprobado, actualizar primero `question-bank-current-corpus.ts`
7. Si se agregó segmentación por perfil a ítems existentes, verificar que siga siendo solo una segunda capa y no altere la taxonomía base del archivo

## Qué no hace este runbook
- no redefine arquitectura del importador
- no reemplaza futuras decisiones sobre staging, versionado o pipeline avanzado
- no convierte `content/profiles/docente/` en fuente de importación primaria
