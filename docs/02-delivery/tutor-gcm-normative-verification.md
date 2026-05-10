---
id: DEL-TUTOR-GCM-NORMATIVE-VERIFICATION
name: tutor-gcm-normative-verification
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: delivery
modules: [tutor, product, architecture, compliance]
tags: [tutor-gcm, normativa, source-truth, verification, sprint-22]
last_reviewed: 2026-05-06
---

# Tutor GCM Normative Verification

## Objetivo
Reducir el riesgo normativo del frente Tutor GCM dejando explícito qué parte de la fuente está realmente verificada en repo, qué parte sigue siendo síntesis gobernada y qué falta para promover el estado a `source_verified` sin inventar verdad oficial.

## Alcance
- Revisión documental cruzada del contrato normativo del Tutor GCM.
- Contraste entre fuente de producto, arquitectura y compliance.
- Clasificación honesta del estado normativo actual.

Fuera de alcance:
- cambios en scoring, avance, cierre de sesión o selección de ítems;
- cambios de runtime, Docker, VPS o deploy;
- creación de nuevas features de producto;
- promoción artificial de la fuente a `source_verified`.

## Estado normativo actual del tutor

### Conclusión ejecutiva
Tutor GCM puede considerarse **funcionalmente cerrado**, pero **normativamente no cerrado**.

La fuente de verdad normativa disponible en repo sigue siendo un contrato v1 gobernado con síntesis prudente y guardrails reales. No existe evidencia suficiente en el repositorio para afirmar que el tutor ya opere con fuente normativa oficial completa, verificable y trazable por anexo.

### Decisión del frente normativo
**PASS con WARN**

Motivo:
- el sistema declara correctamente que la fuente sigue no verificada;
- el contrato, el runtime y compliance están alineados para degradar y no inventar reglas;
- siguen faltando anexos oficiales críticos para declarar `source_verified`.


## Taxonomía normativa operativa vigente

| Categoria | Definicion operativa | Uso permitido |
|---|---|---|
| `source_verified` | Existe respaldo oficial cargado en repo y trazable por versión. | Claims normativos fuertes, con referencia explícita. |
| `synthesized_governed_unverified` | Síntesis gobernada con guardrails, sin anexos oficiales suficientes. | Orientación pedagógica general + disclaimers obligatorios. |
| `placeholder` | Marcador de fuente faltante o pendiente de carga oficial. | No usar para fundamentar decisiones normativas. |
| `advisory_only` | Documento orientativo sin autoridad ejecutiva ni normativa. | Contexto operativo/histórico, nunca como verdad normativa final. |

## Clasificación actual por bloque
- Contrato Tutor Truth v1: `synthesized_governed_unverified`.
- Referencias `agreement-source-pending`, `methodological-guide-source-pending`, `test-structure-source-pending`: `placeholder`.
- Guías de operación QA/gobernanza sobre límites del Tutor: `advisory_only` para soporte de proceso (no reemplazan anexos oficiales).
- Estado `source_verified`: **no alcanzado** por falta de anexos oficiales trazables.

## Inventario de evidencia disponible

### Verificado en repo
- `docs/01-product/source-truth/normative-source-truth-v1.md` define el contrato v1 y declara explícitamente estado no verificado.
- `src/lib/tutor/normative-source-truth.ts` carga `synthesized_governed_unverified` y placeholders pendientes para acuerdo, guía metodológica y estructura de prueba.
- `src/lib/tutor/tutor-evidence-builder.ts` inyecta esta fuente al tutor desde servidor.
- `src/types/tutor-turn.ts` formaliza `SourceTruthStatus` con `source_verified`, `synthesized_governed_unverified` y `missing`.
- `docs/03-architecture/runtime-flow-map.md` indica que el tutor debe degradar si falta fuente verificable.
- `docs/07-compliance/server-side-service-role-policy.md` restringe autoridad del tutor y exige degradación ante fuente incompleta.

### Sintetizado pero no verificado
- Resumen de estructura y reglas de evaluación del concurso.
- Resumen funcional, comportamental y de alineación MIPG del perfil aspiracional.
- Alineación normativa general por pregunta (`normativeAlignmentSummary`).
- Relación general entre banco activo, `professional_profiles` y la orientación pedagógica del tutor.

### Faltante
- Acuerdo oficial del concurso cargado en repo y referenciado de forma trazable.
- Guía metodológica oficial cargada en repo y referenciada de forma trazable.
- Estructura oficial de prueba cargada en repo y referenciada de forma trazable.
- Convocatoria específica y manual/perfil de empleo suficientes para respaldar el componente por perfil.
- Evidencia de versionado documental que permita auditar promoción a `source_verified`.

## Brechas reales
1. El repo declara placeholders (`agreement-source-pending`, `methodological-guide-source-pending`, `test-structure-source-pending`) en lugar de anexos oficiales efectivos.
2. La fuente normativa del tutor sigue describiendo síntesis prudentes, no texto oficial cargado ni mapeado por versión.
3. `professional_profiles` aporta contexto operativo, pero no sustituye convocatoria, manual o acuerdo oficial del concurso.
4. No existe evidencia documental por ítem que permita afirmar validación normativa fina de cada pregunta.

## Riesgos abiertos
1. Sobreafirmar capacidad normativa del tutor a partir de una fuente que hoy es solo gobernada y sintética.
2. Confundir cierre funcional del Tutor GCM con cierre normativo total.
3. Presentar resúmenes de concurso, perfil o MIPG como si ya fueran transcripción o respaldo oficial.
4. Permitir que futuros documentos de estado usen lenguaje de cierre normativo sin anexos verificables.

## Consistencia cruzada entre documentos
- `normative-source-truth-v1.md`, `runtime-flow-map.md` y `server-side-service-role-policy.md` quedan alineados en un punto central: el tutor sí tiene contrato y guardrails reales, pero no tiene todavía fuente oficial suficiente para `source_verified`.
- No se encontró evidencia en repo que contradiga el estado `synthesized_governed_unverified`.
- No se encontraron anexos oficiales cargados que justifiquen una promoción del estado.

## Qué no debe afirmarse todavía
- Que Tutor GCM ya está normativamente cerrado.
- Que la fuente normativa ya es oficial, completa o verificada por concurso.
- Que cada perfil/empleo del tutor ya corresponde a convocatoria y manual oficial cargados.
- Que cada pregunta del banco ya fue reconciliada con acuerdo y guía metodológica específicos.

## Pasos concretos para poder pasar a `source_verified`
1. Cargar en el repositorio el acuerdo oficial aplicable al concurso usado por Tutor GCM.
2. Cargar en el repositorio la guía metodológica oficial aplicable.
3. Cargar en el repositorio la estructura oficial de prueba que respalde la interpretación del tutor.
4. Vincular convocatoria, perfiles/empleos y manual aplicable con referencias trazables por versión.
5. Reemplazar placeholders pendientes por referencias documentales reales.
6. Actualizar la clasificación por componente para distinguir qué partes pasan a verificadas y cuáles siguen sintéticas si la evidencia sigue siendo parcial.
7. Rehacer la revisión documental cruzada y solo entonces evaluar promoción a `source_verified`.

## Veredicto final del sprint
- Estado funcional del Tutor GCM: cerrado previamente.
- Estado normativo del Tutor GCM: **PASS con WARN**.
- Motivo del WARN: la fuente sigue en `synthesized_governed_unverified` por falta de anexos oficiales suficientes en repo.
