---
id: PROJECT-STATUS
name: status
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: project
last_reviewed: 2026-05-10
---

# Estado del Proyecto - GanaConMerito

Ultima actualizacion: 2026-05-10 — Sprint 47 (Mantenimiento menor y saneamiento final).

---

# Executive Operational Snapshot

## Current Sprint
Sprint 47 — Mantenimiento menor y saneamiento final.

## Current Runtime State
Runtime publico verificado en `https://cnsc.profemarlon.com` sobre `716ec62`.

## Last Verified Commit
`716ec62`

## Current Sprint Status
Sprint 47 queda **CERRADO EN REPO (CIERRE DOCUMENTAL Y DE TRAZABILIDAD)**; runtime no revalidado en esta corrida.

## Known Drift
- Persisten contratos y validaciones parcialmente narrativas fuera del baseline canonico.
- La trazabilidad multiagente todavia no es enforcement obligatorio.
- La integracion del Tutor con LLM real queda como deuda tecnica futura y no forma parte del cierre de Sprint 47.

## Pending Debt
- calibracion posterior de senales con evidencia de uso real;
- carga de anexos oficiales suficientes para reevaluar `source_verified`;
- endurecimiento de trazabilidad;
- sincronizacion documental automatica;
- reduccion de documentacion legacy;
- integracion fuerte rich-only.

## Last Audit
2026-05-10 — saneamiento final posterior a Sprint 46; runtime no revalidado en esta entrega.

---

## Canonical documentation index
- `docs/project/canonical-docs.md` (indice canonico minimo para evitar competencia entre fuentes).
- `docs/archive/legacy-candidates.md` (matriz inicial de candidatos legacy para reduccion documental fase 3).

## Estado general

**Estado:** producto activo con core operativo, Tutor GCM gobernado, capa editorial de normalizacion rica conectada al banco activo, senales pedagogicas persistidas, learning signals integradas y calibracion/metricas internas basicas verificadas en runtime; cierre normativo documental y saneamiento final de trazabilidad completados en repo sin nuevos claims de runtime.

**Producto:** login, onboarding, practica y dashboard siguen siendo las superficies activas; Tutor GCM permanece bajo contrato, sin autoridad sobre scoring, avance ni estado de sesion.

**Sprint actual en repo:** Sprint 47 — Mantenimiento menor y saneamiento final.

**Estado del sprint actual:** CERRADO EN REPO (CIERRE DOCUMENTAL Y DE TRAZABILIDAD); runtime no revalidado en esta corrida.

**Sprint anterior cerrado:** Sprint 46 — Cierre normativo del Tutor GCM.

**Rama canonica:** `master`.

**Version declarada en `package.json`:** `0.6.0`.

## Verdad operativa actual

- **Fuente de verdad del producto:** `https://github.com/ProfeMarlonMDE/GanaConMerito`.
- **Copia sincronizada operativa en VPS:** `~/.openclaw/product`.
- **Arbol de deploy:** `/opt/gcm/app`.
- **URL publica canonica:** `https://cnsc.profemarlon.com`.
- **Consola operacional:** `https://cnsc.profemarlon.com/update.html`.
- **Commit actual desplegado y verificado:** `716ec62`.
- **Short hash verificado:** `716ec62`.

## Sprint 47 — mantenimiento menor y saneamiento final

### Estado
**CERRADO EN REPO (DOCUMENTAL, CIERRE CORTO)**

### Resultado ejecutivo
- Se alinea el estado ejecutivo post-Sprint 46 entre `status.md`, `sprint-log.md`, `change-log.md` y `backlog.md`.
- Se corrigen referencias residuales del sprint anterior para que el siguiente frente no compita con la secuencia real ya decidida.
- Se deja Sprint 47 como bloque corto de cierre, sin abrir cambios funcionales, sin claims de runtime nuevos y sin reabrir hardening grande.

### Evidencia y limites
- Evidencia positiva: saneamiento de trazabilidad y consistencia canonica en repo.
- Falta de evidencia: no se reejecutaron validaciones locales desde este entorno por ausencia de checkout operativo del repo.
- Runtime: no verificado en esta entrega.

## Sprint 46 — cierre normativo documental del Tutor GCM

### Estado
**CERRADO EN REPO (DOCUMENTAL, ADVISORY-HEAVY)**

### Resultado ejecutivo
- Se consolida la taxonomia normativa operativa para documentos del Tutor con categorias: `source_verified`, `synthesized_governed_unverified`, `placeholder`, `advisory_only`.
- Se explicita jerarquia de autoridad y se reduce competencia entre documentos de Tutor Truth, sprint delivery y referencias historicas.
- Se mantiene `synthesized_governed_unverified` como estado vigente del frente normativo del Tutor por falta de anexos oficiales trazables en repo.
- Se registran placeholders pendientes y drift tolerado sin promocionar claims fuertes sin evidencia.

### Evidencia y limites
- Evidencia positiva: contrato de fuente normativa v1, estado tecnico y guardrails vigentes en repo.
- Falta de evidencia: anexos oficiales de acuerdo, guia metodologica, estructura de prueba y convocatoria/manual vinculados por version.
- Evidencia negativa: no se encontro soporte documental para promover `source_verified`.
- Runtime: no verificado en esta entrega (cambio documental).

## Sprint 45 — cerrado total y verificado en runtime

### Calibracion interna de senales pedagogicas y metricas internas del Tutor

**Estado:** CERRADO TOTAL Y VERIFICADO EN RUNTIME (PASS)

Objetivo principal:
- calibrar de forma inicial las senales pedagogicas existentes del Tutor, hacerlas mas auditables y exponer metricas internas explicables sin introducir scoring, pesos complejos ni autoridad operativa nueva.

Resultado en repo y runtime:
- `TutorLearningSignal` y `TutorTraceSignals` ampliadas con `signalStrength`, `recommendationEvidenceCount`, `evidenceVsInference` y `likelyFalsePositive`.
- `detectLearningSignals` ajustado con umbrales explicitos `strong|weak|insufficient` y evidencia minima para `recommendedNextPractice`.
- `buildTutorTraceSummary` ampliado con metricas internas de cobertura, suficiencia de evidencia, falsos positivos probables, sesiones sin evidencia util y frecuencia de senales.
- Suite documental y de pruebas saneada para dejar `npm test` en verde tras el ajuste de contratos recientes de sprint.
- Fuente `~/.openclaw/product`, deploy `/opt/gcm/app` y runtime publico alineados sobre `fcc40cb`.
- QA runtime smoke, postdeploy, API E2E y UI Playwright reportados en PASS sobre VPS y URL publica.

Guardrails preservados:
- sin scoring nuevo;
- sin mutacion de progreso o sesion;
- sin autoridad automatica del Tutor;
- sin psicometria nueva;
- sin cierre humano reemplazado por el sistema.

Limitacion explicita aceptada:
- La calibracion actual sigue siendo heuristica y dependiente de la calidad del historial y de `trace_signals` persistidos.
- El cierre normativo real del Tutor sigue fuera del alcance de este sprint.

## Sprint 44 — cerrado y verificado en runtime

### Persistencia, calibracion y analytics del Tutor

**Estado:** CERRADO Y VERIFICADO EN RUNTIME (PASS)

Objetivo principal:
- persistir senales utiles del Tutor, exponer analytics descriptivos simples y mantener una calibracion liviana, explicable y auditable sin introducir scoring, pesos complejos ni modelos psicometricos.

Resultado en repo y runtime:
- `trace_signals` persistidas en `tutor_turn_traces` con soporte JSONB e indice GIN.
- Escritura de senales del Tutor integrada en el repositorio de trazas.
- Summary API ampliado con senales de misconception, distribucion de niveles de pista, `misconceptionRate` y `signalLevel`.
- Dashboard card ampliado para lectura operativa descriptiva.
- Pruebas internas, API y UI ejecutadas sobre VPS y runtime publico con resultado PASS reportado.
- Runtime publico verificado en `https://cnsc.profemarlon.com` sobre `54efd43`.

Guardrails preservados:
- sin scoring nuevo;
- sin mutacion de progreso o sesion;
- sin autoridad automatica del Tutor;
- sin psicometria nueva;
- sin cierre humano reemplazado por el sistema.

Limitacion explicita aceptada:
- La integracion del Tutor con LLM real queda registrada como deuda tecnica futura y debera ejecutarse bajo contrato, sin afectar este cierre.

## Sprint 43 — cerrado en repo y verificado en runtime

Sprint 43 — Learning Paths + Misconception Signals - Base Implementation.

### Learning Paths + Misconception Signals - Base Implementation

**Estado:** CERRADO Y VERIFICADO EN RUNTIME (PASS)

Objetivo principal:
- transformar la metadata ya gobernada y normalizada en senales pedagogicas accionables para misconceptions, subareas debiles y siguiente mejor practica, sin romper los guardrails operativos del Tutor.

Resultado en repo:
- Implementacion de `learningSignals`, `tutor-evidence-builder` y orquestacion enriquecida.
- Suite de pruebas de regresion de Sprints 31-43 ejecutada y aprobada (PASS).
- Runtime publico verificado en `cnsc.profemarlon.com` con paridad total de hash.
- `src/types/tutor-turn.ts` incorpora `TutorLearningSignal` y `learningSignals` dentro de `userSession`.
- `src/lib/tutor/tutor-evidence-builder.ts` deriva senales trazables desde historial reciente, desempeno y metadata del item con fallback conservador.
- `src/lib/tutor/tutor-orchestrator.ts` usa esas senales para enriquecer `recommend_next_practice`, mantener disclaimers no oficiales y priorizar `misconceptionDetected` derivado sobre heuristicas mas debiles.
- `src/lib/tutor/tutor.test.ts` cubre la recomendacion guiada por senales pedagogicas y preserva guardrails de no revelacion y no autoridad operativa.
- La documentación canónica ya deja Sprint 43 como capa base de señales pedagógicas ya integrada en repo (learning paths + misconception signals).

Limitacion explicita aceptada:
- La deteccion actual es heuristica y depende de la calidad del historial reciente y del feedback disponible.
- Persisten riesgos de calibracion semantica y editorial.

## Sprint 42 — cerrado en repo

Sprint 42 — Rich Ingestion Normalization — cerrado en repo.

### Rich Ingestion Normalization

**Estado:** CERRADO EN REPO; RUNTIME NO VERIFICADO EN ESA CORRIDA

Resultado en repo:
- `scripts/validate-question-bank.ts` produce validacion editorial clasificatoria y cobertura por taxonomia, `targetPosition` y categorias de tags.
- `src/domain/taxonomy/normalize-item.ts` preserva taxonomia fuente, normaliza tags planos del corpus activo y deja warnings trazables en vez de falsos canonicos.
- `src/domain/taxonomy/validators.ts` separa warnings editoriales legacy de errores estructurales reales.
- `scripts/recent-sprints-contract.test.ts` quedo realineado al estado documental vigente del repo.
- La salida editorial ya distingue `apt`, `apt_with_warnings` y `rejected`.

## Sprint 41 — cerrado en repo

### Semantic Governance Foundation v1

**Estado:** IMPLEMENTACION DE REPO AJUSTADA

Resultado en repo:
- `src/domain/taxonomy/catalogs.ts` gobierna valores canonicos, aliases, deprecaciones y valores prohibidos.
- `src/domain/taxonomy/validators.ts` valida taxonomia y tags con rechazo estricto de desconocidos y soporte deprecado explicito.
- `src/domain/taxonomy/normalize-item.ts` deja de fabricar metadata ausente y la reemplaza por degradacion trazable con `missingTaxonomy` y `governanceWarnings`.
- `src/domain/tutor/question-truth-adapter.ts` preserva el `TutorSupportContract` seguro, incluida `responsePolicy`, mientras integra la gobernanza semantica.

## Resumen de situacion

El proyecto ya tiene fundacion semantica, validacion editorial rica, senales pedagogicas trazables, persistencia de senales del Tutor y calibracion/metricas internas basicas verificadas en runtime.

Estado Sprint 47 (mantenimiento menor y saneamiento final): **CERRADO EN REPO (CIERRE DOCUMENTAL Y DE TRAZABILIDAD)**.

## Estado normativo

Sprint 22 se mantiene en estado `synthesized_governed_unverified` dado que el sistema todavia no cuenta con anexos oficiales suficientes para promover `source_verified`.
