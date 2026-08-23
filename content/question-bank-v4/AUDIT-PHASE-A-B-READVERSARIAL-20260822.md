# Reauditoría adversarial V4 — Fases A y B

**Fecha:** 2026-08-22  
**Rama base:** `v4-post-sprint48-expansion`  
**Rama de auditoría:** `audit-v4-phase-a-b-adversarial-20260822`  
**Alcance:** 84 reactivos activos; 54 de Fase A y 30 de Fase B. No se auditó Fase C ni se modificó ningún `items/docentes/DOC-*.json`.

## Metodología

Se aplicó desde cero el auditor canónico `GCM-Adversarial-Item-Auditor-Docentes.md` y, como segunda capa compatible, `GCM-Adversarial-Item-Auditor-OPEC-General.md`. Cada reactivo tuvo pasada ciega previa a revelar clave/tutoría, revisión de contrato, fuente y vigencia, exactitud, constructo, taxonomía, demanda cognitiva, single-best-answer, distractores, pistas de forma, tutor GCM, realismo profesional y duplicación conceptual. Las fuentes normativas materiales se contrastaron con fuentes oficiales vigentes. No se corrigieron reactivos.

## Resultado

| Fase | Auditados | APPROVED | REJECTED |
|---|---:|---:|---:|
| A | 54 | 37 | 17 |
| B | 30 | 29 | 1 |
| **TOTAL** | **84** | **66** | **18** |

### Fase A — APPROVED (37)

DOC-001202, DOC-001203, DOC-001204, DOC-001205, DOC-001207, DOC-001208, DOC-001209, DOC-001210, DOC-001211, DOC-001212, DOC-001213, DOC-001214, DOC-001215, DOC-001216, DOC-001217, DOC-001219, DOC-001221, DOC-001223, DOC-001224, DOC-001226, DOC-001229, DOC-001231, DOC-001233, DOC-001234, DOC-001235, DOC-001236, DOC-001237, DOC-001238, DOC-001239, DOC-001240, DOC-001241, DOC-001242, DOC-001243, DOC-001244, DOC-001245, DOC-001247, DOC-001248

### Fase A — REJECTED (17)

DOC-001206, DOC-001218, DOC-001220, DOC-001222, DOC-001225, DOC-001227, DOC-001228, DOC-001230, DOC-001232, DOC-001246, DOC-001249, DOC-001250, DOC-001251, DOC-001252, DOC-001253, DOC-001254, DOC-001255

### Fase B — APPROVED (29)

DOC-001256, DOC-001257, DOC-001260, DOC-001262, DOC-001263, DOC-001264, DOC-001266, DOC-001267, DOC-001269, DOC-001270, DOC-001271, DOC-001272, DOC-001273, DOC-001274, DOC-001275, DOC-001276, DOC-001277, DOC-001278, DOC-001279, DOC-001280, DOC-001281, DOC-001282, DOC-001283, DOC-001284, DOC-001285, DOC-001286, DOC-001287, DOC-001288, DOC-001289

### Fase B — REJECTED (1)

DOC-001290

## Causas de rechazo agrupadas

> Un mismo reactivo puede aparecer en más de un gate.

| Gate | Reactivos rechazados |
|---|---:|
| Duplicación conceptual | 4 |
| Fuente / vigencia | 0 |
| Single-best-answer | 0 |
| Taxonomía | 7 |
| Demanda cognitiva | 6 |
| Distractores | 3 |
| Pistas lingüísticas / de forma | 7 |
| Rol profesional | 0 |
| Constructo | 4 |
| Dificultad | 1 |

## Hallazgos principales

1. **Patrón de clave explotable en Fase A.** A=4, B=37, C=11, D=2. Existe una racha de **17 respuestas B consecutivas** entre `DOC-001225` y `DOC-001241`. No se cambió ninguna clave; es un defecto del lote que debe remediarse posteriormente sin sacrificar calidad.
2. **Cobertura taxonómica parcialmente inflada.** `DOC-001206`, `DOC-001218`, `DOC-001222`, `DOC-001225`, `DOC-001227`, `DOC-001228` y `DOC-001246` usan competencia/tipo que no describen honestamente la operación evaluada. Predominan tareas normativas o conceptuales etiquetadas como planificación, gestión de aula, decisión pedagógica, `technical_applied` o `reading_analysis`.
3. **Sobreclasificación cognitiva.** `DOC-001220`, `DOC-001227`, `DOC-001228`, `DOC-001230`, `DOC-001232` y `DOC-001246` declaran `analyze`/`judge` cuando la resolución real es principalmente `understand` o `apply`.
4. **Pistas de forma en inclusión A6.** En `DOC-001250`–`DOC-001255` la clave es sistemáticamente la alternativa más larga y matizada. Ejemplos: `DOC-001251` B=31 palabras frente a 14–15 en distractores; `DOC-001253` C=38 frente a 11–22; `DOC-001255` C=31 frente a 13–15. El patrón permite detectar la clave por forma.
5. **Fase B es sustancialmente más sólida como lote.** Distribución A=8, B=8, C=7, D=7; racha máxima=3. Solo `DOC-001290` falla en esta reauditoría, por duplicación conceptual.

## Duplicaciones bloqueantes

- `DOC-001249` ↔ `DOC-001243`: misma decisión evaluativa sobre participación efectiva frente a mecanismos tardíos/unidireccionales o meramente simbólicos.
- `DOC-001253` ↔ `DOC-001250`: misma decisión frente a barrera de movilidad: modificar entorno/logística para participación común, sin segregación ni traslado del costo a la familia.
- `DOC-001254` ↔ `DOC-001145`: duplicación fuerte. Ambos preguntan si un ajuste PIAR ya aprobado/firmado debe mantenerse pese a evidencia de que perdió pertinencia; ambos exigen revisar evidencia y ajustar progresivamente el apoyo.
- `DOC-001290` ↔ `DOC-001271`: misma inferencia causal defectuosa —menor uso/asistencia se atribuye a pérdida de interés sin revisar condiciones alternativas de acceso— con cambio cosmético de biblioteca a tutorías.

## Fuentes y vigencia

No se estableció un rechazo bloqueante por fuente o vigencia. Se verificaron las familias normativas materiales con textos oficiales actuales, entre ellas evaluación de desempeño docente, Código de Infancia/PARD, Decreto 277 de 2025, PRAE, gobierno escolar, inclusión/Decreto 1421 de 2017 y educación inicial/Decreto 1411 de 2022. `DOC-001255` no se rechaza por ausencia de diagnóstico médico: el marco de ajustes razonables permite respuesta pedagógica ante barreras observables; la articulación con certificación/sector salud no convierte el diagnóstico en condición única para empezar apoyos pedagógicos.

## Problemas taxonómicos y de dificultad

La principal deuda es la clasificación honesta del constructo. En varios reactivos de A, etiquetas válidas sintácticamente se usan para representar una operación diferente de la efectivamente exigida. `DOC-001255` además declara dificultad `high`, pero sus tres distractores son formalmente extremos y la clave es mucho más extensa/matizada, reduciendo materialmente la dificultad efectiva.

## Recomendaciones para remediación posterior

1. Regenerar con **IDs nuevos** los 18 rechazados; no reutilizar sus IDs.
2. Antes de regenerar, construir una matriz de constructo real → competencia → tipo → nivel cognitivo para evitar cobertura inflada.
3. Rediseñar los distractores de A6 con longitud, precisión y plausibilidad equivalentes a la clave.
4. Corregir el patrón de posición de Fase A solo mediante nuevos reactivos de calidad; no permutar claves de reactivos existentes de forma mecánica.
5. Mantener un índice semántico de huellas conceptuales para bloquear duplicaciones contra todo V4 antes de serializar.

## Control de integridad

- IDs auditados: **84/84**.
- Fase A: **54/54**.
- Fase B activos: **30/30**.
- IDs duplicados en la auditoría: **0**.
- IDs retirados B tratados como activos: **0** (`DOC-001258`, `DOC-001259`, `DOC-001261`, `DOC-001265`, `DOC-001268` excluidos).
- Fase C auditada: **0**.
- Archivos `items/docentes/DOC-*.json` modificados: **0**.
- `master` modificado: **no**.

El detalle verificable por ID —respuesta ciega, clave declarada, gates y hallazgos bloqueantes— está en `AUDIT-PHASE-A-B-READVERSARIAL-20260822.json`.
