# Drift Resolution Policy

Status: canonical
Owner: PM-Governance
Last reviewed: 2026-05-10
Related files:
- AGENTS.md
- docs/project/status.md
- docs/project/canonical-docs.md
- docs/05-ops/documentation-trigger-map.md
Update trigger:
- governance
- drift
- documentation

## Objetivo

Definir un protocolo mínimo, advisory y no bloqueante, para manejar contradicciones documentales en Fase 3.1.

## Regla base ante contradicción

1. Identificar los documentos en conflicto.
2. Consultar prioridad en `docs/project/canonical-docs.md`.
3. Aplicar documento de mayor autoridad como referencia vigente.
4. Registrar el drift en `change-log.md`, `status.md` o `legacy-candidates.md` según impacto.

## Cuándo registrar drift conocido

Registrar drift cuando:
- existe diferencia entre documento ejecutivo y documento histórico;
- el ajuste no puede resolverse en la misma entrega sin ampliar alcance;
- el documento conflictivo seguirá visible para otros agentes.

## Cuándo registrar deuda técnica

Registrar deuda técnica cuando:
- la corrección requiere revisión multiarchivo no incluida en la tarea actual;
- hay riesgo de interpretación ambigua pero no contradicción severa inmediata;
- se decide diferir normalización de headers, clasificación o archivo.

## Cuándo corregir inmediatamente

Corregir en la misma entrega cuando:
- hay contradicción severa con `status.md` en estado de sprint o runtime claim;
- un documento afirma verificación sin evidencia mínima;
- la diferencia puede corregirse sin reescritura masiva ni cambio de alcance mayor.

## Tipología de evidencia y contradicción

- **Evidencia negativa**: existe evidencia concreta de que una afirmación es falsa (ej.: test fail, hash no coincide).
- **Falta de evidencia**: no hay pruebas suficientes para sostener una afirmación (ej.: runtime claim sin hash).
- **Drift tolerado**: diferencia reconocida, documentada y acotada temporalmente.
- **Contradicción severa**: conflicto que cambia estado ejecutivo, QA o runtime de forma incompatible con evidencia.

## Estado de enforcement

- Política vigente en modo advisory-heavy.
- No bloquea CI.
- No reemplaza revisión humana.
