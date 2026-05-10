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


## Legacy conflict handling

Cuando un documento histórico contradice uno canónico:
- prevalece el documento canónico según `canonical-docs.md`;
- el histórico se preserva, pero se etiqueta como `historic`, `superseded` o `legacy-reference` según corresponda;
- registrar deuda técnica si la normalización completa excede alcance de la entrega.

Preservar contradicción (drift tolerado) cuando:
- el valor es puramente histórico y ya está contextualizado con header y bloque ejecutivo;
- corregirlo implicaría reescritura histórica no necesaria.

Marcar `superseded` cuando:
- existe reemplazo canónico claro y el uso actual puede inducir decisiones erróneas.

Corregir inmediatamente cuando:
- el documento legacy realiza claims actuales de runtime, release o estado ejecutivo sin evidencia;
- la contradicción cambia interpretación operativa en el presente.

Estado: advisory-only, sin enforcement bloqueante.


## Archive transition handling

Mover a archive cuando:
- el documento ya está clasificado y contextualizado como no ejecutivo;
- existe reemplazo canónico explícito;
- la trazabilidad histórica se preserva con header y referencia cruzada.

NO mover todavía cuando:
- faltan referencias canónicas claras;
- el documento sigue siendo consultado para auditoría operativa reciente;
- hay riesgo alto de romper navegación documental actual.

Mantener visible cuando:
- su valor histórico es alto y aún aporta contexto de decisiones.

Conservar contradicción histórica cuando:
- está claramente marcada como histórica y no induce claims actuales.

Preservar trazabilidad:
- mantener archivo íntegro (sin borrado);
- registrar en `archive-ready-queue.md` y `legacy-candidates.md`;
- actualizar `change-log.md` al ejecutar migración futura.
