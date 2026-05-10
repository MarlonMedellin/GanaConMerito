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

Ultima actualizacion: 2026-05-10 — Sprint 44 (Persistencia, calibración y analytics del Tutor).

---

# Executive Operational Snapshot

## Current Sprint
Sprint 44 — Persistencia, calibración y analytics del Tutor.

## Current Runtime State
Runtime público verificado en `https://cnsc.profemarlon.com` sobre `54efd43`.

## Last Verified Commit
`54efd43`

## Current Sprint Status
Sprint 44 está **AMPLIAMENTE COMPLETADO**, con runtime verificado en VPS y URL pública. Queda pendiente revisión humana final como paso de aceptación, no como bloqueo técnico de runtime.

## Known Drift
- Persisten diferencias entre documentación histórica Sprint 33 y estado operativo Sprint 44.
- Persisten contratos y validaciones parcialmente narrativas.
- La trazabilidad multiagente todavía no es enforcement obligatorio.
- La integración del Tutor con LLM real queda como deuda técnica futura y no forma parte del cierre de Sprint 44.

## Pending Debt
- revisión humana final de Sprint 44;
- integración futura del Tutor con LLM real bajo contrato;
- endurecimiento de trazabilidad;
- sincronización documental automática;
- reducción de documentación legacy;
- integración fuerte rich-only.

## Last Audit
2026-05-10 — validación runtime VPS Sprint 44 y cierre documental operativo.

---

## Canonical documentation index
- `docs/project/canonical-docs.md` (índice canónico mínimo para evitar competencia entre fuentes).
- `docs/archive/legacy-candidates.md` (matriz inicial de candidatos legacy para reducción documental fase 3).

## Estado general

**Estado:** producto activo con core operativo, Tutor GCM gobernado, capa editorial de normalización rica conectada al banco activo, señales pedagógicas persistidas y analytics descriptivos básicos verificados en runtime.

**Producto:** login, onboarding, practica y dashboard siguen siendo las superficies activas; Tutor GCM permanece bajo contrato, sin autoridad sobre scoring, avance ni estado de sesión.

**Sprint actual en repo:** Sprint 44 — Persistencia, calibración y analytics del Tutor.

**Estado del sprint actual:** AMPLIAMENTE COMPLETADO; runtime verificado; revisión humana final pendiente.

**Sprint anterior cerrado:** Sprint 43 — Learning Paths + Misconception Signals - Base Implementation.

**Rama canonica:** `master`.

**Version declarada en `package.json`:** `0.6.0`.

## Verdad operativa actual

- **Fuente de verdad del producto:** `https://github.com/ProfeMarlonMDE/GanaConMerito`.
- **Copia sincronizada operativa en VPS:** `~/.openclaw/product`.
- **Árbol de deploy:** `/opt/gcm/app`.
- **URL pública canónica:** `https://cnsc.profemarlon.com`.
- **Consola operacional:** `https://cnsc.profemarlon.com/update.html`.
- **Commit actual desplegado y verificado:** `54efd43`.
- **Short hash verificado:** `54efd43`.

## Sprint 44 — ampliamente completado y verificado en runtime

### Persistencia, calibración y analytics del Tutor

**Estado:** AMPLIAMENTE COMPLETADO; RUNTIME VERIFICADO; REVISIÓN HUMANA FINAL PENDIENTE

Objetivo principal:
- persistir señales útiles del Tutor, exponer analytics descriptivos simples y mantener una calibración liviana, explicable y auditable sin introducir scoring, pesos complejos ni modelos psicométricos.

Resultado en repo y runtime:
- `trace_signals` persistidas en `tutor_turn_traces` con soporte JSONB e índice GIN.
- Escritura de señales del Tutor integrada en el repositorio de trazas.
- Summary API ampliado con señales de misconception, distribución de niveles de pista, `misconceptionRate` y `signalLevel`.
- Dashboard card ampliado para lectura operativa descriptiva.
- Pruebas internas, API y UI ejecutadas sobre VPS y runtime público con resultado PASS reportado.
- Runtime público verificado en `https://cnsc.profemarlon.com` sobre `54efd43`.

Guardrails preservados:
- sin scoring nuevo;
- sin mutación de progreso o sesión;
- sin autoridad automática del Tutor;
- sin psicometría nueva;
- sin cierre humano reemplazado por el sistema.

Limitación explícita aceptada:
- La revisión humana final queda pendiente como validación de aceptación.
- La integración del Tutor con LLM real queda registrada como deuda técnica futura y deberá ejecutarse bajo contrato, sin afectar este cierre.

## Sprint 43 — cerrado en repo y verificado en runtime

### Learning Paths + Misconception Signals - Base Implementation

**Estado:** CERRADO Y VERIFICADO EN RUNTIME (PASS)

Objetivo principal:
- transformar la metadata ya gobernada y normalizada en señales pedagógicas accionables para misconceptions, subáreas débiles y siguiente mejor práctica, sin romper los guardrails operativos del Tutor.

Resultado en repo:
- Implementación de `learningSignals`, `tutor-evidence-builder` y orquestación enriquecida.
- Suite de pruebas de regresión de Sprints 31-43 ejecutada y aprobada (PASS).
- Runtime público verificado en `cnsc.profemarlon.com` con paridad total de hash.
- `src/types/tutor-turn.ts` incorpora `TutorLearningSignal` y `learningSignals` dentro de `userSession`.
- `src/lib/tutor/tutor-evidence-builder.ts` deriva señales trazables desde historial reciente, desempeño y metadata del ítem con fallback conservador.
- `src/lib/tutor/tutor-orchestrator.ts` usa esas señales para enriquecer `recommend_next_practice`, mantener disclaimers no oficiales y priorizar `misconceptionDetected` derivado sobre heurísticas más débiles.
- `src/lib/tutor/tutor.test.ts` cubre la recomendación guiada por señales pedagógicas y preserva guardrails de no revelación y no autoridad operativa.
- La documentación canónica ya deja Sprint 43 como la capa base vigente de learning paths y misconception signals.

Limitación explícita aceptada:
- La detección actual es heurística y depende de la calidad del historial reciente y del feedback disponible.
- Persisten riesgos de calibración semántica y editorial.

## Sprint 42 — cerrado en repo

### Rich Ingestion Normalization

**Estado:** CERRADO EN REPO; RUNTIME NO VERIFICADO EN ESA CORRIDA

Resultado en repo:
- `scripts/validate-question-bank.ts` produce validación editorial clasificatoria y cobertura por taxonomía, `targetPosition` y categorías de tags.
- `src/domain/taxonomy/normalize-item.ts` preserva taxonomía fuente, normaliza tags planos del corpus activo y deja warnings trazables en vez de falsos canónicos.
- `src/domain/taxonomy/validators.ts` separa warnings editoriales legacy de errores estructurales reales.
- `scripts/recent-sprints-contract.test.ts` quedó realineado al estado documental vigente del repo.
- La salida editorial ya distingue `apt`, `apt_with_warnings` y `rejected`.

## Sprint 41 — cerrado en repo

### Semantic Governance Foundation v1

**Estado:** IMPLEMENTACION DE REPO AJUSTADA

Resultado en repo:
- `src/domain/taxonomy/catalogs.ts` gobierna valores canónicos, aliases, deprecaciones y valores prohibidos.
- `src/domain/taxonomy/validators.ts` valida taxonomía y tags con rechazo estricto de desconocidos y soporte deprecado explícito.
- `src/domain/taxonomy/normalize-item.ts` deja de fabricar metadata ausente y la reemplaza por degradación trazable con `missingTaxonomy` y `governanceWarnings`.
- `src/domain/tutor/question-truth-adapter.ts` preserva el `TutorSupportContract` seguro, incluida `responsePolicy`, mientras integra la gobernanza semántica.

## Resumen de situación

El proyecto ya tiene fundación semántica, validación editorial rica, señales pedagógicas trazables, persistencia de señales del Tutor y analytics descriptivos básicos verificados en runtime. El frente natural que sigue es revisión humana final de Sprint 44, cierre normativo real del Tutor y preparación futura del LLM real bajo contrato.

## Estado normativo

Sprint 22 se mantiene en estado `synthesized_governed_unverified` dado que el sistema todavía no cuenta con anexos oficiales suficientes para promover `source_verified`.
