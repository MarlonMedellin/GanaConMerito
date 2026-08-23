# Remediación de reauditoría adversarial V4 — Fases A y B

**Fecha:** 2026-08-22  
**Rama:** `remediate-v4-phase-a-b-20260822`  
**Base autoritativa:** `audit-v4-phase-a-b-adversarial-20260822`  
**Estado:** CERRADA técnica y editorialmente; sin merge a `master`.

## 1. Resultado ejecutivo

La reauditoría había identificado 18 reactivos `REJECTED`. Los 18 fueron retirados del banco productivo y ninguno de sus IDs fue reutilizado. Se evaluaron las 14 señales inicialmente recomendadas como regenerables; cuatro se descartaron antes de producción por solapamiento o bajo valor diferencial y diez se regeneraron desde cero. Los diez reemplazos superaron fábrica, auditoría ciega/revelada de Docentes y gates compatibles OPEC-General antes de serializarse.

- Activos antes de remediación: **256**.
- REJECTED retirados: **18**.
- Reemplazos nuevos APPROVED: **10**.
- Activos finales: **248**.
- Reemplazos producidos y luego REJECTED: **0**.
- Oportunidades ABANDON/DISCARD: **8**.

## 2. Los 18 REJECTED retirados

`DOC-001206`, `DOC-001218`, `DOC-001220`, `DOC-001222`, `DOC-001225`, `DOC-001227`, `DOC-001228`, `DOC-001230`, `DOC-001232`, `DOC-001246`, `DOC-001249`, `DOC-001250`, `DOC-001251`, `DOC-001252`, `DOC-001253`, `DOC-001254`, `DOC-001255`, `DOC-001290`.

## 3. Disposición y mapping

| ID rechazado | Disposición | Resultado | Nuevo ID |
|---|---|---|---|
| DOC-001206 | REGENERATE_FROM_ZERO | APPROVED | DOC-001295 |
| DOC-001218 | ABANDON | DISCARD por solapamiento con confidencialidad/protección ya cubierta, especialmente DOC-001147 | — |
| DOC-001220 | REGENERATE_FROM_ZERO | APPROVED | DOC-001296 |
| DOC-001222 | ABANDON | DISCARD por solapamiento con continuidad educativa/protección ya cubierta, especialmente DOC-001219 | — |
| DOC-001225 | REGENERATE_FROM_ZERO | APPROVED | DOC-001297 |
| DOC-001227 | REGENERATE_FROM_ZERO | APPROVED | DOC-001298 |
| DOC-001228 | ABANDON | DISCARD por cobertura suficiente de jornada/asignación, especialmente DOC-001184 y DOC-001224 | — |
| DOC-001230 | REGENERATE_FROM_ZERO | APPROVED | DOC-001299 |
| DOC-001232 | REGENERATE_FROM_ZERO | APPROVED | DOC-001300 |
| DOC-001246 | ABANDON | DISCARD: la función básica del Consejo de Estudiantes no agrega suficiente valor diferencial frente a la cobertura vigente | — |
| DOC-001249 | ABANDON | duplicación conceptual con DOC-001243 | — |
| DOC-001250 | REGENERATE_FROM_ZERO | APPROVED | DOC-001301 |
| DOC-001251 | REGENERATE_FROM_ZERO | APPROVED | DOC-001302 |
| DOC-001252 | REGENERATE_FROM_ZERO | APPROVED | DOC-001303 |
| DOC-001253 | ABANDON | duplicación de la oportunidad recuperable de DOC-001250 | — |
| DOC-001254 | ABANDON | duplicación fuerte con DOC-001145 | — |
| DOC-001255 | REGENERATE_FROM_ZERO | APPROVED | DOC-001304 |
| DOC-001290 | ABANDON | duplicación conceptual con DOC-001271 | — |

## 4. Auditoría de los reemplazos

| Nuevo ID | Señal recuperada | Clasificación final | Clave | Auditoría |
|---|---|---|---|---|
| DOC-001295 | procedimiento de evaluación anual docente | `interpretacion_normativa` / `normative_applied` / `apply` | D | APPROVED |
| DOC-001296 | derecho del adolescente a ser escuchado | `interpretacion_normativa` / `normative_applied` / `apply` | A | APPROVED |
| DOC-001297 | definición normativa del horario escolar | `interpretacion_normativa` / `normative_applied` / `apply` | C | APPROVED |
| DOC-001298 | descanso pedagógico dentro de la jornada | `interpretacion_normativa` / `normative_applied` / `apply` | A | APPROVED |
| DOC-001299 | permanencia en establecimientos con dos jornadas | `interpretacion_normativa` / `normative_applied` / `apply` | C | APPROVED |
| DOC-001300 | consulta a Consejo Directivo y Académico | `interpretacion_normativa` / `normative_applied` / `apply` | D | APPROVED |
| DOC-001301 | barrera física en laboratorio | `resolucion_de_problemas` / `case_analysis` / `apply` | C | APPROVED |
| DOC-001302 | acceso a contenido sonoro para estudiante sorda | `decision_pedagogica` / `situational` / `apply` | A | APPROVED |
| DOC-001303 | accesibilidad de evaluación digital | `resolucion_de_problemas` / `case_analysis` / `analyze` | D | APPROVED |
| DOC-001304 | apoyos pedagógicos ante barreras sin diagnóstico definitivo | `interpretacion_normativa` / `normative_applied` / `apply` | A | APPROVED |

Las fuentes de cada reemplazo fueron verificadas nuevamente. Se usaron como soportes decisivos Decreto 3782 de 2007, Ley 1098 de 2006, Decreto 277 de 2025 y Decreto 1421 de 2017 compilado en el Decreto 1075 de 2015, según el constructo de cada reactivo.

## 5. Métricas finales del corpus

- Reactivos activos: **248**.
- Distribución global de claves: **A=76, B=85, C=62, D=25**.
- Racha máxima histórica: **14 respuestas A**, desde `DOC-001032` hasta `DOC-001045`.
- Outliers históricos de longitud bajo heurística clave/mediana de distractores > 1,65: **50**.
- Outliers de esa heurística entre los diez reemplazos: **0**.

No se alteraron reactivos previamente aprobados para maquillar la distribución ni la racha histórica. El riesgo residual de forma pertenece a reactivos históricos fuera del alcance quirúrgico de esta remediación y no constituye autorización para reescribirlos sin una auditoría específica.

## 6. Cobertura y C1

El snapshot canónico de este cierre es `../snapshots/COVERAGE-AFTER-A-B-REMEDIATION-20260822.json` y refleja exactamente 248 reactivos activos.

Se preservó C1 sin expansión adicional:

- activos: `DOC-001292`, `DOC-001293`;
- reclasificados y activos: `DOC-001104`, `DOC-001110`;
- retirados: `DOC-001291`, `DOC-001294`.

No se generó Fase C adicional.

## 7. Control de integridad

- 18/18 REJECTED originales ausentes del banco productivo.
- 0 IDs rechazados reutilizados.
- 8 oportunidades ABANDON/DISCARD no reaparecieron como variantes cosméticas.
- 10/10 reemplazos serializados solo después de `APPROVED`.
- `DOC-001295`–`DOC-001304` son IDs nuevos y secuenciales.
- `legacy-processing-register.csv` registra las **18/18 disposiciones** bajo el batch `DOC-READVERSARIAL-REMEDIATION-20260822`.
- Los informes históricos `../audits/AUDIT-PHASE-A-B-READVERSARIAL-20260822.json` y `../audits/AUDIT-PHASE-A-B-READVERSARIAL-20260822.md` permanecen intactos.
- No se realizó merge a `master` ni a ninguna otra rama.
- No se modificaron `src/`, `scripts/` ni `supabase/`.
- Los workflows escritores temporales fueron retirados del diff final y `pr-checks.yml` fue restaurado a la base autoritativa.
- El workflow `.github/workflows/v4-post-sprint48-qa.yml` queda read-only (`permissions: contents: read`).
- La comparación final contra la base autoritativa contiene **32 archivos exactos**: workflow QA, snapshot, este informe, registro, 18 retiros y 10 reemplazos; sin archivos fuera de alcance.

## 8. QA

El workflow de QA valida el corpus real en modo read-only: esquema, taxonomías, IDs únicos, ausencia de retirados, presencia de reemplazos aprobados, preservación de C1, concordancia con snapshot, distribución de claves, racha máxima, heurística de longitud y control de archivos fuera de alcance.

La ejecución verificable `32602729979` finalizó correctamente sobre el corpus remediado, con `QA_OK` y las métricas canónicas de 248 reactivos. Las operaciones posteriores fueron exclusivamente de cierre administrativo y saneamiento de workflows: incorporación de las 18 filas del registro, retiro de mecanismos temporales de escritura y actualización de este informe; no modificaron los reactivos ni el snapshot previamente validados.
