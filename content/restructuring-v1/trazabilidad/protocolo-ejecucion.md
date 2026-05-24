# Protocolo de Ejecución y Trazabilidad

## Objetivo

Evitar reprocesos y asegurar que cada cambio hecho sobre `content/restructuring-v1/` sea:

1. técnicamente defendible
2. documentalmente rastreable
3. reversible a nivel de decisión editorial
4. verificable por lote

## Reglas obligatorias

### 1. No borrar originales en `content/items/stand-by`
- Toda reubicación inicial es por copia, no por reemplazo.
- El original se conserva hasta cierre completo de la reestructuración.

### 2. No mover sin trazabilidad
- Ningún archivo puede copiarse a `content/restructuring-v1/` sin quedar registrado en una bitácora de lote.
- Toda fila de bitácora debe incluir:
  - `sourcePath`
  - `targetPath`
  - `batchId`
  - `decisionType`
  - `classificationConfidence`
  - `contentChange`
  - `reviewStatus`
  - `notes`

### 3. Diferenciar claramente las fases
- `migracion`: copia tal cual desde `stand-by`, sin cambiar contenido.
- `ajuste`: modificación del contenido psicométrico-editorial.
- `descarte`: exclusión explícita, con motivo trazable.

### 4. No mezclar clasificación con corrección
- Primero se ubica el ítem en la nueva estructura.
- Después se corrige el contenido.
- Si se corrige antes de clasificar, debe quedar justificado como excepción.

### 5. No usar `por_confirmar` como cajón permanente
- `por_confirmar` es una ubicación temporal de trabajo.
- Todo ítem allí debe recibir segunda pasada posterior.

### 6. No declarar listo sin evidencia suficiente
- Un ítem en `restructuring-v1` no se considera listo para banco final solo por haber sido copiado.
- Debe pasar por revisión psicométrico-editorial posterior.

### 7. Todo lote debe cerrar con manifiesto
- Cada lote debe registrar:
  - número de archivos procesados
  - rutas exactas afectadas
  - tipo de operación
  - riesgos abiertos
  - pendientes explícitos

## Estados de revisión para trazabilidad

- `copied_pending_review`
- `copied_high_confidence`
- `needs_profile_confirmation`
- `needs_psychometric_revision`
- `ready_for_content_revision`
- `discard_candidate`
- `discarded`

## Tipos de operación

- `copy_only`
- `copy_and_reclassify`
- `content_adjustment`
- `status_correction`
- `discard_registration`

## Regla de no reproceso

Si una acción ya fue hecha, no se repite en un lote posterior sin dejar constancia de:

- por qué se reabrió
- qué cambió respecto del lote anterior
- cuál fue el criterio nuevo

## Criterio de calidad mínima para continuar

Antes de pasar a una nueva fase, cada lote debe dejar:

- bitácora actualizada
- manifiesto actualizado
- archivos destino creados o ajustados
- pendientes explícitos

## Cierre esperado

La reestructuración se considerará bien ejecutada solo cuando exista una cadena completa:

`source original -> ruta intermedia propuesta -> lote de migración -> revisión psicométrica -> decisión final`
