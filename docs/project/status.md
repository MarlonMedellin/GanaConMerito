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

Ultima actualizacion: 2026-05-10 — Sprint 43 (Learning Paths + Misconception Signals - Base Implementation).

## Estado general

**Estado:** producto activo con core operativo, Tutor GCM gobernado, capa editorial de normalización rica conectada al banco activo y capa base de señales pedagógicas ya integrada en repo.

**Producto:** login, onboarding, practica y dashboard siguen siendo las superficies activas; Tutor GCM permanece bajo contrato, sin autoridad sobre scoring, avance ni estado de sesión.

**Sprint actual en repo:** Sprint 43 — Learning Paths + Misconception Signals - Base Implementation.

**Siguiente frente natural:** calibración y persistencia de señales pedagógicas del Tutor, sin cambio todavía formalizado como nuevo sprint.

**Sprint anterior cerrado:** Sprint 42 — Rich Ingestion Normalization.

**Rama canonica:** `master`.

**Version declarada en `package.json`:** `0.6.0`.

## Verdad operativa actual

- **Fuente de verdad del producto:** `https://github.com/ProfeMarlonMDE/GanaConMerito`.
- **Copia sincronizada operativa en VPS:** `~/.openclaw/product`.
- **Árbol de deploy:** `/opt/gcm/app`.
- **URL pública canónica:** `https://cnsc.profemarlon.com`.
- **Consola operacional:** `https://cnsc.profemarlon.com/update.html`.
- **Commit actual desplegado y verificado:** `07ceb1a`.
- **Short hash verificado:** `07ceb1a`.

## Sprint 43 — implementación base lista para promoción

### Learning Paths + Misconception Signals - Base Implementation

**Estado:** IMPLEMENTACION BASE LISTA PARA PROMOCION; RUNTIME NO VERIFICADO EN ESTA CORRIDA

Objetivo principal:
- transformar la metadata ya gobernada y normalizada en señales pedagógicas accionables para misconceptions, subáreas débiles y siguiente mejor práctica, sin romper los guardrails operativos del Tutor.

Resultado en repo:
- `src/types/tutor-turn.ts` incorpora `TutorLearningSignal` y `learningSignals` dentro de `userSession`.
- `src/lib/tutor/tutor-evidence-builder.ts` deriva señales trazables desde historial reciente, desempeño y metadata del ítem con fallback conservador.
- `src/lib/tutor/tutor-orchestrator.ts` usa esas señales para enriquecer `recommend_next_practice`, mantener disclaimers no oficiales y priorizar `misconceptionDetected` derivado sobre heurísticas más débiles.
- `src/lib/tutor/tutor.test.ts` cubre la recomendación guiada por señales pedagógicas y preserva guardrails de no revelación y no autoridad operativa.
- La documentación canónica ya deja Sprint 43 como la capa base vigente de learning paths y misconception signals.

Limitación explícita aceptada:
- La detección actual es heurística y depende de la calidad del historial reciente y del feedback disponible.
- Este cierre no incluye promoción a VPS ni verificación del runtime público.

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

El proyecto ya tiene fundación semántica, validación editorial rica y una primera capa de señales pedagógicas trazables para orientar práctica siguiente. El frente natural que sigue es endurecer persistencia, calibración y evaluación real de estas señales sin desplazar la autoridad operativa del sistema.

## Estado normativo

Sprint 22 se mantiene en estado `synthesized_governed_unverified` dado que el sistema todavía no cuenta con anexos oficiales suficientes para promover `source_verified`.
