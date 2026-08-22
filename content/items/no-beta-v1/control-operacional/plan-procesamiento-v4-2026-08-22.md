# Plan de procesamiento V4 · no-beta-v1

**Fecha:** 2026-08-22  
**Rama:** `master`  
**Ámbito:** `content/items/no-beta-v1`

## Objetivo

Cerrar de forma exhaustiva el corpus histórico `no-beta-v1` bajo el contrato editorial V4, sin modificar ni eliminar los archivos legacy y evitando reprocesos.

## Unidad y orden de trabajo

- Unidad: un archivo `.json` legacy por decisión editorial.
- Los `.md`, CSV, reportes y archivos de `control-operacional/` son referencias de proceso; no se tratan como señales de pregunta.
- Orden determinista: ruta lexicográfica.
- Tamaño operativo: lotes de hasta 20 JSON.
- Primero `stand-by-historico/`; después `banco-operacional-previo/`.

## Pipeline obligatorio

`registro de no reproceso → fábrica V4 → auditor adversarial → serialización solo si APPROVED → registro final`

1. Consultar `content/question-bank-v4/legacy-processing-register.csv` por `legacy_id` y `legacy_blob_sha`.
2. Si la entrada ya está registrada con ese SHA, no reprocesarla.
3. Ejecutar `GCM-Master-Question-Factory-Docentes.md`: solo `PRODUCE` o `DISCARD`.
4. Todo `PRODUCE` pasa por `GCM-Adversarial-Item-Auditor-Docentes.md` en dos pasadas.
5. Solo `APPROVED` se serializa en `content/question-bank-v4/items/docentes/` con ID nuevo e inmutable.
6. Todo cierre, incluido `DISCARD`, se registra en `legacy-processing-register.csv`.

## Reglas de calidad

- No migrar ni corregir el reactivo legacy: regenerar desde cero.
- No duplicar constructos ya cubiertos en V4.
- No convertir ejercicios generales de aptitud verbal o matemática en didáctica docente sin una decisión profesional real.
- No forzar perfiles de rector, coordinador, orientador u otra OPEC a `scope: general`.
- Conservar exclusivamente la taxonomía canónica V4.
- Si aparece un vacío taxonómico, reportarlo antes de ampliar: debe ser recurrente, sustantivo, reconocido y fundante para el banco. No crear tópicos ad hoc.
- Los tópicos `indagacion`, `modelizacion`, `argumentacion` y `comprension_lectora` se usan únicamente cuando el constructo real lo exige.

## Criterio de cierre

El corpus queda terminado cuando cada JSON de `stand-by-historico/` y `banco-operacional-previo/` tiene una fila final en `legacy-processing-register.csv` o ya estaba cubierto allí por el mismo `legacy_blob_sha`, y todo reactivo serializado tiene auditoría `APPROVED`.
