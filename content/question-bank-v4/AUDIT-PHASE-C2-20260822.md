# Auditoría adversarial — Fase C2

**Rama:** `v4-phase-c2-selective-20260822`  
**Base:** `68dfae07baaafa59e00fa7a085ac4b903b62aa07`  
**Baseline:** 248

## Veredicto

**C2 cerrada con 0 reactivos nuevos.**

La auditoría se aplicó antes de serializar candidatos. Las cuatro líneas estudiadas fueron detenidas en triage/deduplicación, por lo que no correspondía fabricar candidatos, asignar IDs ni ejecutar ciclos de parcheo.

## Resultados

| Oportunidad | Resultado | Gate bloqueante |
|---|---|---|
| Práctica de recuperación | DISCARD | Duplicación semántica con `DOC-001166` |
| Ejemplos resueltos / carga cognitiva | DISCARD | Proximidad y bajo valor marginal frente a `DOC-001171` |
| Práctica intercalada | DISCARD | Evidencia moderada por condiciones; generalización insuficientemente segura |
| Gestión preventiva del aula | DISCARD | Transferibilidad/contexto y ausencia de una combinación universal single-best-answer |

## Controles adversariales

- No se cambió el escenario para disfrazar un constructo ya existente.
- No se infló `gestion_de_aula`, `resolucion_de_problemas`, `pedagogia` ni ningún tópico por frecuencia baja.
- No se asignó `DOC-001305` a una oportunidad no aprobada.
- No se modificaron reactivos aprobados antiguos.
- No se abrieron tópicos nuevos.
- No se usó `opec_specific` ni `opecId`.
- No hubo `REGENERATE_FROM_ZERO`, porque ningún candidato alcanzó la etapa de auditoría ciega.

## Blind / auditor docente / cross-check OPEC

No aplican a reactivos individuales: no hubo candidatos que superaran el gate previo. Esto evita simular un proceso de auditoría sobre material que debió ser descartado antes de escribir una pregunta.

## Resultado neto

- Candidatos: 0
- APPROVED: 0
- REJECTED: 0
- DISCARD previo: 4
- ABANDON: 0
- IDs consumidos: 0
- Corpus esperado tras C2: 248
