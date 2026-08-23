# Expansión V4 — Fase B: alta rentabilidad post-Sprint 48

**Rama:** `v4-post-sprint48-expansion`  
**Fecha:** 2026-08-22  
**Base congelada en `master`:** 224 reactivos aprobados  
**Estado:** **CERRADA Y REAUDITADA — 30/30 APPROVED**  
**Corpus físico de rama:** 254 reactivos.  
**Reauditoría final:** [`REAUDIT-PHASE-B-REMEDIATED-20260822.md`](./history/audits/REAUDIT-PHASE-B-REMEDIATED-20260822.md)

## Regla de aislamiento

`master` permanece congelada en 224 reactivos durante Sprint 48. Ningún reactivo de esta fase debe llegar a `master` por escritura directa. La rama se usa para investigar, producir, auditar y medir expansiones posteriores.

## Microbloques ejecutados

| Bloque | Núcleo | Activos aprobados | Decisión taxonómica |
|---|---|---:|---|
| B1 | Competencias comportamentales profesionales | 8 | nuevo `competencias_comportamentales` |
| B2 | Lectura crítica profesional | 8 | reutiliza `comprension_lectora` |
| B3 | Educación inicial y transición | 6 | nuevo `educacion_inicial_transicion` |
| B4 | Razonamiento cuantitativo, datos y modelización | 8 | nuevo `razonamiento_cuantitativo`; reutiliza `modelizacion` |
| **Total** |  | **30** | **30/30 APPROVED** |

## Trazabilidad de remediación

La primera auditoría (`history/audits/AUDIT-PHASE-B-20260822.md`) rechazó cinco reactivos: `DOC-001258`, `DOC-001259`, `DOC-001261`, `DOC-001265` y `DOC-001268`.

De acuerdo con la regla de IDs inmutables y con la disposición `REGENERATE_FROM_ZERO`:

- esos cinco IDs se retiraron del corpus y no se reutilizan;
- se generaron desde cero `DOC-001286`–`DOC-001290`;
- los cinco nuevos reactivos aprobaron la reauditoría;
- el corpus permanece en 254 archivos porque se retiraron 5 y se incorporaron 5.

## Integridad del lote final

Snapshot: `history/snapshots/COVERAGE-AFTER-PHASE-B-REMEDIATION-20260822.json`.

- `master`: **224** aprobados y congelados.
- rama: **254** aprobados.
- Fase B activa: **30**.
- claves: **A=8, B=8, C=7, D=7**.
- racha máxima de una misma clave: **3**.
- outliers de longitud de clave (>1,65 × mediana de distractores): **0**.
- QA: `.github/workflows/v4-post-sprint48-qa.yml`, solo lectura (`contents: read`).

## Cobertura temática lograda

- `competencias_comportamentales`: 8.
- `comprension_lectora`: 12 en el banco total.
- `educacion_inicial_transicion`: 6.
- `razonamiento_cuantitativo`: 6.
- `modelizacion`: 3 en el banco total.

Las tres ampliaciones taxonómicas de Fase B permanecen justificadas por necesidad editorial real y están documentadas en `taxonomy/README.md`.

## Fuentes rectoras verificadas

### B1 — Competencias comportamentales
- Decreto 3782 de 2007, especialmente artículos 13–17.
- MEN, Guía No. 31 — Guía Metodológica Evaluación Anual de Desempeño Laboral.

### B2 — Lectura crítica profesional
- ICFES, Marco de referencia de Lectura Crítica Saber 11°, Saber TyT y Saber Pro.

### B3 — Educación inicial y transición
- Decreto 1411 de 2022, incorporado al Decreto 1075 de 2015.
- MEN y Universidad de Antioquia, Derechos Básicos de Aprendizaje para el grado Transición.

### B4 — Razonamiento cuantitativo y modelización
- ICFES, Marco de referencia del módulo Razonamiento Cuantitativo.

## Decisión sobre B5

**No se abre B5.** Los cuatro vacíos de alta rentabilidad definidos para Fase B ya fueron cubiertos y auditados. Extender la fase con temas de prioridad inferior convertiría la cuota de volumen en criterio editorial, contrario al contrato V4.

La siguiente expansión debe abrir una **Fase C selectiva**, con un plan independiente y un argumento de cobertura explícito. El próximo ID nunca usado disponible es `DOC-001291`.

## Gates que se heredan a la siguiente fase

1. Auditoría individual antes de serialización.
2. IDs inmutables y no reutilizables.
3. Distribución de claves controlada a nivel de lote, sin imponer una respuesta por posición.
4. Gate de pistas de forma y longitud desde el primer microbloque.
5. Fuentes vigentes y verificables.
6. No crear un tópico nuevo si un valor existente describe honestamente el constructo.
