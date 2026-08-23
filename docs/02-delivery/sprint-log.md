---
id: DEL-SPRINT-LOG
name: sprint-log
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: delivery
modules: [core, platform]
tags: [sprint, entrega, seguimiento]
related:
  - PROD-BACKLOG
  - DEL-CHANGE-LOG
  - QUAL-RISK-REGISTER
last_reviewed: 2026-08-22
---

## Document control
- Status: operational
- Owner: PM-Governance
- Last reviewed: 2026-08-11
- Related files: docs/project/status.md, docs/02-delivery/sprint-log.md, docs/02-delivery/change-log.md, docs/project/canonical-docs.md
- Update trigger: governance, delivery, documentation, drift

# Sprint log

## Current delivery state
- **Current operational block**: Sprint 48 — repo completo; aplicación y gates remotos pendientes.
- **Corte editorial congelado y validado**: `content/question-bank-v4/MANIFEST.json`
  gobierna conteo, inventario y hashes en `master`.
- **Public runtime canonico**: `https://ganaconmerito.com`; commit visible `e43f612`, smoke publico PASS el 2026-08-22, sin nueva E2E autenticada.
- **Supabase publico**: 121 filas visibles en `item_bank`: 120 legacy y 1 V4; existe exposicion P0 de clave/explicacion.
- **V4 local**: corpus estructuralmente válido y reconciliado contra el manifiesto;
  1 V4 observado en Supabase.
- **Governance Hardening Roadmap state**: Fase 1 y Fase 2 iniciadas; Fase 3 en ejecucion documental (reduccion y clasificacion), Fases 4-5 futuras.
- **Open risks**:
  - el dry-run del corte V4 reconciliado no reconoce aún evidencia `APPROVED` para
    `DOC-001256`; PRD 2 debe resolver la trazabilidad antes de importar;
  - acceso anonimo directo a claves y explicaciones del banco;
  - runtime desplegado conserva el payload y selector anteriores;
  - V4 gobierna selección, práctica y expediente Tutor solo en repo;
  - fuentes V4 sin documentos verificables;
  - huella SSH del VPS cambio y requiere confirmacion del propietario;
  - HEAD documental posterior al release de codigo debe conservarse separado de la imagen desplegada;
  - la calibracion del Tutor sigue siendo heuristica y requiere evidencia de uso real para refinamiento posterior;
  - trazabilidad multiagente aun advisory y sin enforcement automatico;
  - parte del QA historico sigue narrativo y puede competir con baseline ejecutiva;
  - integracion futura del Tutor con LLM real sigue pendiente como deuda tecnica futura;
  - el frente normativo sigue en `synthesized_governed_unverified` hasta cargar anexos oficiales suficientes.

## Sprint 48 — V4 Runtime Seguro + Tutor IA en Shadow
- **Estado**: EN EJECUCIÓN; BLOQUES 0–5 VALIDADOS EN REPO; APLICACIÓN REMOTA, SHADOW REAL Y E2E PENDIENTES
- **Fecha de definicion**: 2026-08-22
- **Rama canonica**: `master`
- **Objetivo**: cortar la lectura runtime a V4 y ejecutar OpenRouter en shadow con
  contratos pre/post seguros, autoridad deterministica y fallback preservado.

### Orden y gates
1. Cerrar exposicion P0 de claves, explicaciones y metadata privada.
2. Hacer operativa e idempotente la importacion completa del corpus V4 aprobado.
3. Adaptar repositorio, DTO, UI y selector sin fallback legacy.
4. Adaptar el expediente Tutor a todos los campos V4.
5. Integrar un proveedor OpenRouter restringido en shadow.
6. Aprobar evaluacion adversarial y gates de repo/staging.

### Evidencia de preparacion
- Auditoria estructural V4: corpus valido al corte, sin inspeccion de items individuales.
- Contraste REST publico Supabase y lectura de migraciones/contratos de app.
- Smoke publico PASS sobre `e43f612` en `https://ganaconmerito.com`; persiste drift amplio frente al repositorio.
- PRD y plan detallado creados; sin cambios de codigo, DB o deploy.
- Migración `0020`, lecturas server-only, contratos pre/post y suite de seguridad
  implementados; typecheck y pruebas específicas PASS.
- Importador idempotente y migración `0021` implementados; dry-run reproduce el
  conjunto aprobado y deja fuera cualquier lote sin cierre editorial.
- El plan histórico previo queda supersedido para conteo por el manifiesto V4;
  cualquier importación futura debe recalcularse desde ese corte.
- Repositorio server-only, selector V4 exclusivo, contratos pre/post, UI de
  contexto y estado sin inventario implementados; pruebas de frontera PASS.
- Expediente Tutor V4 pre/post implementado sin normalizador legacy; autoridad
  determinística, guardrails, fallback y persistencia de trazas preservados.
- Proveedor OpenRouter shadow opt-in implementado con JSON Schema estricto,
  allowlist/ZDR, salida no visible, fallback y métricas minimizadas; prueba real pendiente.
- Matriz local de 120 escenarios y fallos OpenRouter mock PASS; reporte en
  `docs/04-quality/sprint-48-repo-evaluation-report.md`.

### Limitaciones
- VPS administrativo no verificado por cambio de huella SSH.
- No hay canary, RAG/web, OPEC especifica ni activacion productiva en este sprint.

## Beta Candidate 0.6.0 — cierre documental y preparacion de runtime
- **Estado**: CHECKLIST CERRADO PARA RELEASE DE CODIGO; TAG PENDIENTE
- **Fecha de alineacion**: 2026-08-19
- **Rama canonica**: `master`
- **Commit de codigo release**: `9695d40`
- **Documentación**: commits posteriores al release, sin cambios de código.
- **Runtime publico verificado**: `9695d40` (`2026-08-19T00:00:00-05:00`)
- **Version declarada**: `0.6.0`
- **Objetivo**: dejar una sola lectura ejecutiva del estado beta con gates frescos, paridad de codigo y deuda residual explicita.

### Evidencia de cierre 2026-08-20
- Smoke publico: `/opt/gcm/app/artifacts/qa-smoke-postdeploy-smoke-mt0xrhmp-mzt8se`.
- API E2E 5 turnos: `/opt/gcm/app/artifacts/qa-e2e-api-mt0xs2k0-m767ff`.
- UI Chromium 5 turnos: `/opt/gcm/app/artifacts/qa-ui-e2e-ui-mt0xtcsa-u279gx`.
- Gates locales: banco 100/100 sin errores, typecheck, unitarias, build y validacion documental PASS.

### Entregables principales
- `docs/project/status.md` alinea HEAD actual, ultimo runtime verificado y criterio de cierre beta.
- `docs/05-ops/runtime-and-release.md` declara la regla para no confundir evidencia historica con paridad vigente.
- `docs/01-product/backlog.md`, `docs/04-quality/known-issues.md` y `docs/04-quality/technical-debt-register.md` consolidan pendientes de beta sin abrir frentes grandes.
- `docs/02-delivery/release-checklist.md` conserva la evidencia del cierre de `v0.6.0-beta.1`.

### Evidencia operacional
- Revision documental y auditoria de repo, VPS, Supabase y runtime publico.
- Build, typecheck/lint, tests, validacion de contenido y smoke runtime reportados PASS.
- E2E Playwright autenticada real: 5 turnos, cierre de sesion y dashboard verificado.
- Runtime/deploy tree están alineados al commit de código `9695d40`; la corrida automatizada postdeploy fresca está registrada en el checklist.

### Criterio de cierre
- Triple verificacion source/deploy/runtime sobre un unico commit objetivo.
- `content:validate`, tests, build, smoke runtime, postdeploy y E2E autenticado PASS.
- Tag/release `v0.6.0-beta.1` creado después de evidencia runtime fresca.

## Sprint 47 — mantenimiento menor y saneamiento final
- **Estado**: CERRADO EN REPO (CIERRE DOCUMENTAL Y DE TRAZABILIDAD)
- **Fecha de cierre**: 2026-05-10
- **Rama de promocion**: `master`
- **Objetivo**: cerrar el bloque corto posterior a Sprint 46 corrigiendo inconsistencias residuales de estado, backlog y trazabilidad sin abrir cambios funcionales ni claims nuevos de runtime.

### Entregables principales
- Alineacion final entre `status.md`, `sprint-log.md`, `change-log.md` y `backlog.md`.
- Correccion de referencias residuales del sprint anterior para que la secuencia vigente no compita con planes previos.
- Cierre explicito de Sprint 47 como bloque corto de saneamiento, sin reabrir hardening grande ni nuevos frentes de producto.

### Evidencia operacional
- Cambios solo documentales en repo.
- Validaciones locales no reejecutadas desde este entorno por ausencia de checkout operativo del repo.
- Runtime publico NO revalidado en esta entrega.

### Limitacion aceptada del sprint
- No se cargaron anexos oficiales nuevos ni se promovio el frente normativo a `source_verified`.
- No hubo nueva validacion runtime ni de VPS por tratarse de cierre documental menor.

## Sprint 46 — cierre normativo del Tutor GCM
- **Estado**: CERRADO EN REPO (DOCUMENTAL)
- **Fecha de cierre**: 2026-05-10
- **Rama de promocion**: `master`
- **Objetivo**: cerrar frente normativo del Tutor dejando clasificacion verificable de evidencia y limites de autoridad sin abrir features.

### Entregables principales
- Clasificacion normativa transversal: `source_verified`, `synthesized_governed_unverified`, `placeholder`, `advisory_only`.
- Actualizacion de documentos ejecutivos para evitar claims normativos fuertes sin respaldo.
- Registro explicito de placeholders y drift tolerado en frente Tutor Truth.

### Evidencia operacional
- Cambios solo documentales en repo local.
- `npm run check:doc-triggers`, `npm run lint` y `npm test` ejecutados en esta corrida.
- Runtime publico NO revalidado en esta entrega.

### Limitacion aceptada del sprint
- No se cargaron anexos oficiales nuevos; se conserva estado `synthesized_governed_unverified`.

## Sprint 45 — cerrado total y verificado en runtime
- **Estado**: CERRADO TOTAL Y VERIFICADO EN RUNTIME (PASS)
- **Fecha de cierre y validacion runtime**: 2026-05-10
- **Rama de promocion**: `master`
- **Commit final verificado**: `fcc40cb`
- **Objetivo**: observar la calidad de senales pedagogicas existentes con metricas internas, separacion evidencia/inferencia/recomendacion y umbrales explicitos de suficiencia, sin abrir scoring ni autoridad operativa nueva.

### Entregables principales
- `TutorLearningSignal` y `TutorTraceSignals` ampliadas con `signalStrength`, `recommendationEvidenceCount`, `evidenceVsInference` y `likelyFalsePositive`.
- Calibracion heuristica en `detectLearningSignals` con umbrales explicitos `strong|weak|insufficient` y evidencia minima para `recommendedNextPractice`.
- Analytics agregados en summary de trazas: sesiones sin evidencia util, cobertura/suficiencia de recomendacion, falsos positivos probables, distribucion de intensidad y frecuencia de senales.
- Saneamiento documental minimo para alinear contratos recientes de sprint y dejar `npm test` completamente en verde.
- Runtime validado en VPS y URL publica.
- QA interno, API y UI ejecutados con PASS.

### Evidencia operacional
- `~/.openclaw/product` sincronizado a `fcc40cb`.
- `/opt/gcm/app` sincronizado a `fcc40cb`.
- Docker reconstruido con `APP_COMMIT=fcc40cb` y `APP_BUILD_TIME=2026-05-10T20:23:02Z`.
- Variables cargadas desde `/opt/gcm/env/gcm-app.env`.
- QA runtime smoke: PASS.
- QA postdeploy: PASS.
- QA API E2E: PASS.
- QA UI Playwright: PASS.
- Runtime publico verificado en `https://cnsc.profemarlon.com`.

### Resultado funcional
- El Tutor ya clasifica intensidad de senales con umbrales explicitos y deja mas clara la frontera entre evidencia, inferencia y recomendacion.
- El resumen de trazas ya expone metricas internas utiles para auditar suficiencia, cobertura y ruido probable de las senales pedagogicas.
- El sistema mantiene enfoque read-only y sin mutacion de scoring ni progreso.
- La suite documental y de pruebas quedo saneada para que el cierre no dependa de drift narrativo de sprints previos.

### Guardrails preservados
- sin scoring nuevo;
- sin mutacion de progreso o sesion;
- sin autoridad oficial del Tutor;
- sin psicometria nueva;
- sin reemplazar aceptacion humana por el sistema.

### Limitacion aceptada del sprint
- La calibracion actual sigue siendo heuristica y dependiente de la calidad del historial y de `trace_signals` persistidos.
- El cierre normativo real del Tutor sigue fuera del alcance de este sprint.

## Sprint 44 — Persistencia, calibracion y analytics del Tutor
- **Estado**: CERRADO Y VERIFICADO EN RUNTIME (PASS)
- **Fecha de validacion runtime**: 2026-05-10
- **Rama de promocion**: `master`
- **Commit runtime verificado**: `54efd43`
- **Objetivo**: persistir senales del Tutor, habilitar analytics descriptivos simples y dejar calibracion liviana, auditable y gobernada sin introducir scoring, psicometria compleja ni autoridad automatica.

### Entregables principales
- `trace_signals` persistidas en `tutor_turn_traces`.
- Indice GIN para consulta analitica JSONB.
- `misconceptionRate` y `signalLevel` agregados al summary del Tutor.
- Distribucion de niveles de pista y conteo de misconceptions expuestos en dashboard.
- Runtime validado en VPS y URL publica.
- QA interno, API y UI ejecutados con PASS.

### Evidencia operacional
- `~/.openclaw/product` sincronizado a `54efd43`.
- `/opt/gcm/app` sincronizado a `54efd43`.
- Docker reconstruido con `APP_COMMIT=54efd43`.
- Variables cargadas desde `/opt/gcm/env/gcm-app.env`.
- QA runtime smoke: PASS.
- QA postdeploy: PASS.
- QA API E2E: PASS.
- QA UI Playwright: PASS.
- Runtime publico verificado en `https://cnsc.profemarlon.com`.

### Resultado funcional
- El Tutor ya puede persistir senales trazables y exponer analytics descriptivos simples.
- La calibracion actual permanece explicitamente heuristica y explicable.
- El sistema mantiene enfoque read-only y sin mutacion de scoring.
- La UI del dashboard ya expone senales operativas basicas utiles.

### Limitacion aceptada del sprint
- La revision humana final queda pendiente como aceptacion operativa final.
- La integracion del Tutor con LLM real se registra como deuda tecnica futura.
- No se declara autoridad automatica del Tutor ni personalizacion avanzada.

## Sprint cerrado en repo — Sprint 43: Learning Paths + Misconception Signals - Base Implementation
- **Estado**: CERRADO Y VERIFICADO EN RUNTIME (PASS)
- **Fecha de cierre y despliegue**: 2026-05-10
- **Rama de promocion**: `master`
- **Commit final verificado**: `fee91a4`
- **Objetivo**: usar la metadata ya gobernada y normalizada para detectar misconceptions, priorizar debilidades y sugerir siguiente mejor practica sin romper los guardrails del Tutor.

### Entregables principales
- `src/types/tutor-turn.ts` ampliado con `TutorLearningSignal` y `learningSignals` dentro de `userSession`.
- `src/lib/tutor/tutor-evidence-builder.ts` ampliado con derivacion de senales pedagogicas desde historial reciente, desempeno y metadata del item.
- `src/lib/tutor/tutor-orchestrator.ts` ajustado para enriquecer `recommend_next_practice`, mantener disclaimers no oficiales y priorizar `misconceptionDetected` derivado.
- `src/lib/tutor/tutor.test.ts` ampliado con cobertura especifica de recomendacion guiada por learning signals y preservacion de guardrails.
- `docs/project/status.md`, `docs/02-delivery/change-log.md` y `docs/01-product/backlog.md` alineados con Sprint 43 como implementacion base vigente.

### Evidencia operacional
- `~/.openclaw/product` sincronizado a `fee91a4`.
- `/opt/gcm/app` sincronizado a `fee91a4`.
- Docker reconstruido con `APP_COMMIT=fee91a4`.
- Suite de regresion integral Sprints 31-43: **PASS**.
- Verificacion publica en `https://cnsc.profemarlon.com`: **PASS**.

### Resultado funcional
- El Tutor ya puede adjuntar senales `learningSignals` trazables a la sesion.
- La recomendacion de siguiente practica ya puede usar evidencia reciente y metadata gobernada.
- Se mantiene degradacion honesta cuando no hay evidencia suficiente.
- No se transfiere autoridad oficial, scoring ni mutacion de sesion al Tutor.

### Limitacion aceptada del sprint
- La deteccion actual de misconceptions sigue siendo heuristica y requiere calibracion con uso real.

## Sprint cerrado en repo — Sprint 42: Rich Ingestion Normalization
- **Estado**: CERRADO EN REPO
- **Fecha de cierre**: 2026-05-10
- **Rama de trabajo**: `codex/execute-sprint-42-for-ganaconmerito`
- **Objetivo**: conectar la gobernanza semantica de Sprint 41 con la lectura real del banco activo mediante validacion editorial, cobertura y fallback legacy trazable.

### Resultado funcional
- El pipeline ya distingue `apt`, `apt_with_warnings` y `rejected`.
- La cobertura editorial ya se emite por `area/subarea/competency`, `targetPosition` y categorias de tags.
- Los warnings de taxonomia legacy quedan visibles en vez de convertirse en canon silencioso.
- Los errores estructurales reales siguen pudiendo rechazar items.

## Sprint cerrado en repo — Sprint 41: Semantic Governance Foundation v1
- **Estado**: IMPLEMENTACION AJUSTADA EN REPO
- **Fecha de ajuste**: 2026-05-09
- **Rama de trabajo**: `codex/execute-sprint-41-for-semantic-governance`
- **Objetivo**: consolidar taxonomia canonica, validadores, normalizador legacy gobernado y adaptadores del Tutor sin inventar metadata ausente ni degradar los guardrails ya vigentes.

## Sprint cerrado — Sprint 39: Decoupled Update Runtime Worker
- **Estado**: CERRADO
- **Fecha de cierre**: 2026-05-09
- **Rama principal**: `sprint-39-decoupled-update-runtime-worker`
- **Objetivo**: desacoplar `/update.html` y `/api/ops/update` del ciclo de vida del contenedor `gcm-app` mediante jobs persistentes y polling.

### Evidencia operacional reportada
- `~/.openclaw/product` sincronizado a `07ceb1a`.
- `/opt/gcm/app` sincronizado a `07ceb1a`.
- Docker reconstruido con `APP_COMMIT=07ceb1a`.
- `gcm-app` reiniciado exitosamente mediante `docker compose up -d gcm-app`.
- Runtime reportado en produccion sobre la nueva version.

## Sprint cerrado — Sprint 22: Tutor GCM Normative Source Verification
- Estado historico conservado: `synthesized_governed_unverified` por ausencia de anexos oficiales completos.
