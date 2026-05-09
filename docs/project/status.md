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

Ultima actualizacion: 2026-05-09 — Sprint 40 (Tutor Taxonomy-Aware Item Evidence).

## Estado general

**Estado:** MVP estabilizado operativamente despues del cierre de Sprint 33. El core esta desplegado, Docker construye correctamente, smoke local/publico fue reportado como PASS y la suite UI E2E fue reportada como PASS.

**Producto:** producto activo con core operativo, Tutor GCM gobernado, dashboard con metricas prudentes y contrato de fuente normativa minima explicitamente clasificado como no oficial/verificado.

**Sprint actual:** Sprint 40 — Tutor Taxonomy-Aware Item Evidence.

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

## Sprint 39 — cerrado

### Decoupled Update Runtime Worker

**Estado:** CERRADO CON DESPLIEGUE EJECUTIVO REPORTADO

Validaciones reportadas por operación VPS:
- `~/.openclaw/product` sincronizado a `07ceb1a`.
- `/opt/gcm/app` sincronizado a `07ceb1a`.
- Docker reconstruido con `APP_COMMIT=07ceb1a` y `APP_BUILD_TIME` generado en UTC.
- Contenedor `gcm-app` reiniciado mediante `docker compose up -d gcm-app`.
- Aplicación reportada corriendo en producción bajo la nueva versión.

Entregables de Sprint 39:
- `/api/ops/update` desacoplado por jobs persistentes.
- `/api/ops/update/status` disponible para polling.
- `update.html` migrado a flujo job-based.
- `src/lib/ops/update-jobs.ts` creado para persistencia de jobs/reportes.
- `ops/run-update-job.sh` versionado como worker host-side de referencia.
- Documentación de worker desacoplado creada.

Riesgo residual:
- La instalación/orquestación definitiva del worker host-side en VPS queda como mejora operativa posterior. El cierre de Sprint 39 se acepta por paridad `product/deploy`, rebuild Docker y runtime levantado sobre `07ceb1a`.

## Sprint 40 — activo

### Tutor Taxonomy-Aware Item Evidence

Objetivo principal:
Hacer que Tutor GCM consuma la nueva estructura rica de ítems, taxonomía, perfiles y metadatos pedagógico-psicométricos, sin romper compatibilidad con el banco actual.

Foco inicial:
- Contrato de taxonomía `area -> subarea -> competency`.
- Capa contextual por perfiles sin duplicar ítems.
- Tipos de item rico.
- Extensión compatible de `QuestionTruth`.
- Enriquecimiento de `TutorSupportContract` con afirmación, evidencia, dificultad, nivel cognitivo, distractores y riesgos técnicos.

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

Adicionalmente:
- Sprint 35 y Sprint 36 ejecutados con `npm run test:tutor` en verde.
- Runtime publico/VPS de Sprint 35-37.1 validado en la misma corrida operacional.
- El endpoint `/update.html` quedo operativo con mounts, docker.sock y shell tools disponibles dentro de `gcm-app`.

## Resumen de situación

El proyecto completó la fase crítica de estabilización iniciada en Sprint 33 y actualmente retoma como prioridad el desarrollo pedagógico del Tutor GCM sobre la nueva taxonomía de ítems.

La prioridad actual ya no es estabilización funcional del producto sino integración del Tutor con evidencia pedagógica, psicométrica y taxonómica más rica.

## Estado normativo

Sprint 22 se mantiene en estado `synthesized_governed_unverified` dado que el sistema todavía no cuenta con anexos oficiales suficientes para promover `source_verified`.
