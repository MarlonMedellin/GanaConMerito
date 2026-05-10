---
id: PROJECT-STATUS
name: status
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: project
last_reviewed: 2026-05-09
---

# Estado del Proyecto - GanaConMerito

Ultima actualizacion: 2026-05-09 — Sprint 41 (Semantic Governance Foundation v1).

## Estado general

**Estado:** producto activo con core operativo, Tutor GCM gobernado y base semántica v1 consolidada en repo para evitar drift taxonómico antes de la ingesta rica.

**Producto:** login, onboarding, practica y dashboard siguen siendo las superficies activas; Tutor GCM permanece bajo contrato, sin autoridad sobre scoring, avance ni estado de sesión.

**Sprint actual en repo:** Sprint 41 — Semantic Governance Foundation v1.

**Sprint siguiente preparado:** Sprint 42 — Rich Ingestion Normalization.

**Sprint anterior cerrado:** Sprint 39 — Decoupled Update Runtime Worker.

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

## Sprint 41 — activo en repo, listo para cierre de implementación

### Semantic Governance Foundation v1

**Estado:** IMPLEMENTACION DE REPO AJUSTADA; CIERRE OPERATIVO PENDIENTE DE BUNDLE DE VALIDACION

Objetivo principal:
- consolidar taxonomía canónica, validadores, normalización legacy gobernada y adaptadores compatibles del Tutor sin inventar metadata ausente.

Resultado en repo:
- `src/domain/taxonomy/catalogs.ts` gobierna valores canónicos, aliases, deprecaciones y valores prohibidos.
- `src/domain/taxonomy/validators.ts` valida taxonomía y tags con rechazo estricto de desconocidos y soporte deprecado explícito.
- `src/domain/taxonomy/normalize-item.ts` deja de fabricar metadata ausente y la reemplaza por degradación trazable con `missingTaxonomy` y `governanceWarnings`.
- `src/domain/tutor/question-truth-adapter.ts` preserva el `TutorSupportContract` seguro, incluida `responsePolicy`, mientras integra la gobernanza semántica.
- `src/lib/tutor/tutor.test.ts` cubre rechazo de tags desconocidos, deprecaciones, ausencia explícita de taxonomía y preservación de guardrails.

Limitación explícita que queda aceptada:
- La lectura runtime productiva sigue consumiendo principalmente `area` y `competency`; la adopción punta a punta del resto de metadata gobernada se traslada a Sprint 42.

## Sprint 42 — preparado

### Rich Ingestion Normalization

Objetivo principal:
- llevar la taxonomía y metadata rica ya gobernadas en código hacia la lectura real del banco, la normalización de lotes y la validación editorial por cobertura y errores.

## Sprint 39 — cerrado

### Decoupled Update Runtime Worker

**Estado:** CERRADO CON DESPLIEGUE EJECUTIVO REPORTADO

Validaciones reportadas por operación VPS:
- `~/.openclaw/product` sincronizado a `07ceb1a`.
- `/opt/gcm/app` sincronizado a `07ceb1a`.
- Docker reconstruido con `APP_COMMIT=07ceb1a` y `APP_BUILD_TIME` generado en UTC.
- Contenedor `gcm-app` reiniciado mediante `docker compose up -d gcm-app`.
- Aplicación reportada corriendo en producción bajo la nueva versión.

## Sprint 37.1 — cerrado

### Runtime Parity & Operational Verification

**Estado:** PASS

Validaciones completadas:
- Runtime verified: yes
- Deploy parity: yes
- Docker verified: yes
- Smoke local/publico: PASS
- qa:e2e:api: PASS
- qa:e2e:ui: PASS
- npm run lint: PASS
- npm run build: PASS
- npm run test:recent-sprints: PASS
- npm run test:unit: PASS

## Resumen de situación

El proyecto sale de Sprint 41 con una base semántica más segura en repo y ya puede mover el foco a la normalización real de ingesta, sin vender todavía que toda la metadata rica esté adoptada de punta a punta en runtime.

## Estado normativo

Sprint 22 se mantiene en estado `synthesized_governed_unverified` dado que el sistema todavía no cuenta con anexos oficiales suficientes para promover `source_verified`.


## Sprint 42 — en ejecución

Se implementa normalización de ingesta rica con validación editorial y reporte de cobertura sin romper compatibilidad legacy.
