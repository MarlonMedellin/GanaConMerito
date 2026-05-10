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

Ultima actualizacion: 2026-05-10 — Sprint 42 (Rich Ingestion Normalization).

## Estado general

**Estado:** producto activo con core operativo, Tutor GCM gobernado y capa editorial de normalización rica ya conectada al banco activo en repo.

**Producto:** login, onboarding, practica y dashboard siguen siendo las superficies activas; Tutor GCM permanece bajo contrato, sin autoridad sobre scoring, avance ni estado de sesión.

**Sprint actual en repo:** Sprint 42 — Rich Ingestion Normalization.

**Sprint siguiente preparado:** Sprint 43 — Learning Paths + Misconception Engine.

**Sprint anterior cerrado:** Sprint 41 — Semantic Governance Foundation v1.

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

## Sprint 42 — cerrado en repo

### Rich Ingestion Normalization

**Estado:** CERRADO EN REPO; RUNTIME NO VERIFICADO EN ESTA CORRIDA

Objetivo principal:
- conectar la gobernanza semántica de Sprint 41 con la lectura real del banco activo para validar y normalizar metadata rica sin romper compatibilidad legacy ni inventar semántica ausente.

Resultado en repo:
- `scripts/validate-question-bank.ts` produce validación editorial clasificatoria y cobertura por taxonomía, `targetPosition` y categorías de tags.
- `src/domain/taxonomy/normalize-item.ts` preserva taxonomía fuente, normaliza tags planos del corpus activo y deja warnings trazables en vez de falsos canónicos.
- `src/domain/taxonomy/validators.ts` separa warnings editoriales legacy de errores estructurales reales.
- `scripts/recent-sprints-contract.test.ts` quedó realineado al estado documental vigente del repo.
- La salida editorial ya distingue `apt`, `apt_with_warnings` y `rejected`.

Limitación explícita que queda aceptada:
- La adopción runtime punta a punta de metadata rica sigue dependiendo de disponibilidad real de columnas y contratos activos del banco en producción.
- Este cierre no incluye promoción a VPS ni verificación del runtime público.

## Sprint 43 — preparado

### Learning Paths + Misconception Engine

Objetivo principal:
- convertir la metadata ya gobernada y normalizada en señales pedagógicas accionables para refuerzo, misconceptions y siguiente mejor práctica, sin romper los guardrails del Tutor.

## Sprint 41 — cerrado en repo

### Semantic Governance Foundation v1

**Estado:** IMPLEMENTACION DE REPO AJUSTADA

Resultado en repo:
- `src/domain/taxonomy/catalogs.ts` gobierna valores canónicos, aliases, deprecaciones y valores prohibidos.
- `src/domain/taxonomy/validators.ts` valida taxonomía y tags con rechazo estricto de desconocidos y soporte deprecado explícito.
- `src/domain/taxonomy/normalize-item.ts` deja de fabricar metadata ausente y la reemplaza por degradación trazable con `missingTaxonomy` y `governanceWarnings`.
- `src/domain/tutor/question-truth-adapter.ts` preserva el `TutorSupportContract` seguro, incluida `responsePolicy`, mientras integra la gobernanza semántica.

## Sprint 39 — cerrado

### Decoupled Update Runtime Worker

**Estado:** CERRADO CON DESPLIEGUE EJECUTIVO REPORTADO

Validaciones reportadas por operación VPS:
- `~/.openclaw/product` sincronizado a `07ceb1a`.
- `/opt/gcm/app` sincronizado a `07ceb1a`.
- Docker reconstruido con `APP_COMMIT=07ceb1a` y `APP_BUILD_TIME` generado en UTC.
- Contenedor `gcm-app` reiniciado mediante `docker compose up -d gcm-app`.
- Aplicación reportada corriendo en producción bajo la nueva versión.

## Resumen de situación

El proyecto ya tiene fundación semántica y capa editorial de validación rica en repo. El siguiente frente natural es usar esa metadata para detectar misconceptions, priorizar subáreas débiles y sugerir prácticas de refuerzo sin convertir al Tutor en autoridad operativa.

## Estado normativo

Sprint 22 se mantiene en estado `synthesized_governed_unverified` dado que el sistema todavía no cuenta con anexos oficiales suficientes para promover `source_verified`.

- 2026-05-10: Sprint 43 en progreso. Tutor mantiene `synthesized_governed_unverified` y suma recomendaciones pedagógicas trazables sin mutar scoring/sesión.

Referencia histórica: normalización de ingesta rica con validación editorial y reporte de cobertura.
