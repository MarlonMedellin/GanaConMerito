---
id: DEL-SPRINT-43-LEARNING-PATHS
name: sprint-43-learning-paths-misconception-engine-plan
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: delivery
modules: [tutor, taxonomy, pedagogy]
tags: [sprint, tutor, learning-paths, misconceptions]
last_reviewed: 2026-05-10
---

# Sprint 43 — Learning Paths + Misconception Engine

## Objetivo
Usar la metadata ya gobernada y normalizada para transformar al Tutor GCM de un explicador seguro a un orientador pedagógico más útil, capaz de detectar patrones de misconception, priorizar subáreas débiles y sugerir siguiente mejor práctica sin tocar scoring, transición de sesión ni autoridad operativa.

## Alcance
1. Detectar misconceptions a partir de distractores, respuesta del usuario, feedback y metadata disponible.
2. Traducir señales de taxonomía y desempeño en recomendaciones de refuerzo accionables.
3. Construir una capa inicial de learning paths o micro-rutas de práctica, sin convertirla en motor autónomo opaco.
4. Mantener trazabilidad de por qué se recomienda una práctica o se detecta una misconception.

## No alcance
- No mover scoring, selección de ítems ni avance de sesión al LLM.
- No abrir Tutor GCM como chat libre dominante.
- No cerrar todavía el frente normativo `source_verified`.
- No hacer rediseño grande del dashboard o de la experiencia de práctica.
- No introducir recomendaciones que se presenten como autoridad oficial del concurso.

## Archivos probables a tocar
- `src/domain/tutor/question-truth-adapter.ts`
- `src/lib/tutor/tutor-evidence-builder.ts`
- `src/lib/tutor/tutor-orchestrator.ts`
- `src/types/tutor-turn.ts`
- `src/lib/tutor/tutor.test.ts`
- `docs/project/status.md`
- `docs/02-delivery/sprint-log.md`
- `docs/02-delivery/change-log.md`
- `docs/01-product/backlog.md`

## Entregables esperados

### 1. Capa de misconception detection
Detectar al menos:
- distractor elegido coherente con misconception conocida
- error repetido por competencia o subárea
- confusión entre alternativa plausible y criterio evaluado
- mismatch entre nivel cognitivo esperado y patrón de respuesta

### 2. Señales de refuerzo
Agregar campos o sidecars que permitan derivar:
- `misconceptionDetected`
- `weakSubareaSignal`
- `repeatedErrorPattern`
- `recommendedNextPractice`
- `difficultyMismatch`

### 3. Recomendación de siguiente mejor práctica
Generar sugerencias trazables usando como mínimo:
- `area`
- `subarea`
- `competency`
- historial reciente
- distractores o feedback

La recomendación debe ser explicable y degradar con honestidad si no hay evidencia suficiente.

### 4. Guardrails
- No revelar claves antes de tiempo.
- No mutar puntaje ni estado de sesión.
- No presentar la sugerencia como decisión oficial del sistema.
- No inventar rationale normativa no cargada.

## Pruebas obligatorias
- `npm run test:tutor`
- `npm run test:recent-sprints`
- `npm run test:unit`
- `npm run lint`
- `npm run build`

Si el sprint termina en promoción operativa sobre VPS, recordar siempre:
1. actualizar primero la carpeta fuente `~/.openclaw/product`
2. alinear después el deploy tree `/opt/gcm/app`
3. actualizar, reconstruir, reiniciar o verificar Docker según corresponda
4. validar al final en `https://cnsc.profemarlon.com`

## Riesgos
- Sobreinterpretar metadata aún incompleta como si ya fuera señal fuerte.
- Convertir recomendaciones pedagógicas en lógica crítica del sistema.
- Mezclar misconception detection con scoring o avance de sesión.
- Inflar la capacidad del Tutor con copy demasiado fuerte sin evidencia suficiente.

## Criterio de cierre
Sprint 43 puede cerrarse cuando:
- exista detección trazable de misconceptions con fallback honesto
- el Tutor pueda sugerir siguiente mejor práctica sin romper guardrails
- la lógica siga siendo explainable y no autoritativa
- las pruebas de contrato y build queden en verde
