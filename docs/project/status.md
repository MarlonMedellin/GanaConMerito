---
id: PROJECT-STATUS
name: status
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: project
last_reviewed: 2026-08-22
---

# Estado del Proyecto - GanaConMerito

Ultima actualizacion: 2026-08-22 — PRD 3 en checkpoint; `0028` aplicada sin lote y `0029` pendiente.

---

# Executive Operational Snapshot

## Current Sprint
Sprint 48 — V4 Runtime Seguro + Tutor IA en Shadow (**repo completo; cierre operativo pendiente**).

## Current Runtime State
El runtime publico canonico responde en `https://ganaconmerito.com` y reporta el commit
`e1dc63bb51a1f42f585fa31d2695238b2d933aa5` con build time `2026-08-22 23:58:20 +0000 UTC`. El smoke publico de
login y configuracion paso el 2026-08-22.

El corte editorial aprobado está congelado en `master` mediante
`content/question-bank-v4/MANIFEST.json`; ese archivo es la única fuente vigente
para conteo, hashes e inventario. El runtime mantiene un drift amplio frente al
repositorio.
La administracion de VPS no fue verificada porque la huella SSH presentada cambio
y debe confirmarse antes de aceptar la conexion.

## Last Verified Commit
`e43f612` como commit declarado por el runtime publico. Esta auditoria solo verifico
smoke publico; no reejecuto E2E autenticada ni verifico el arbol de deploy.

## Current Sprint Status
**SPRINT 48 EN EJECUCIÓN; PRD 3 PAUSADO EN CHECKPOINT**: `0028` fue aplicada en
producción, pero el lote no se ejecutó. La auditoría confirmó 163 V4 y 652 opciones,
todas inactivas, no publicadas y fuera del piloto. `0029` endurece localmente el
anclaje canónico y la reconciliación de drift; queda pendiente de aplicación tras
la revisión del PR #97.

## Known Drift
- Supabase contiene 163 filas V4 y 652 opciones; `v_question_bank_v4_active`
  devuelve cero filas porque ninguna V4 está activa.
- La politica publica permite consultar `correct_option`, `explanation` y metadata
  editorial directamente desde `item_bank`; RLS por fila no protege columnas.
- El runtime desplegado aún devuelve el contrato anterior y lee
  `v_item_bank_active`/`item_bank`; el repo ya eliminó ese fallback para práctica.
- El banco V4 coincide con el conteo y los hashes del manifiesto canónico, sin IDs
  duplicados ni retirados activos. Mantiene cero
  documentos en `sources/`;
  calidad editorial no equivale a fuente normativa verificada.
- `0028` está aplicada remotamente sin ejecuciones batch. `0029` y la importación
  canónica siguen pendientes.
- Persisten contratos y validaciones parcialmente narrativas fuera del baseline canonico.
- La trazabilidad multiagente todavia no es enforcement obligatorio.
- La integracion del Tutor con LLM real queda como deuda tecnica futura y no forma parte del cierre de Sprint 47.
- La metadata estatica de `/opt/gcm/docker-compose.yml` conserva valores historicos, pero la imagen y el runtime fueron reconstruidos explicitamente con `ad6ad35`; queda pendiente normalizar ese compose fuera del repo.
- `/opt/gcm/app` contiene archivos no rastreados de auditoria y una migracion SQL que requieren clasificacion antes de limpiar.
- El bypass de autenticacion QA quedo desactivado en produccion; `/login` exige ahora acceso real con Google.
- Los documentos historicos de QA/runtime deben tratarse como evidencia auxiliar, no como estado vigente.

## Pending Debt
- calibracion posterior de senales con evidencia de uso real;
- carga de anexos oficiales suficientes para reevaluar `source_verified`;
- endurecimiento de trazabilidad;
- sincronizacion documental automatica;
- reduccion de documentacion legacy;
- integracion fuerte rich-only.
- aplicación remota de `0029`, importación productiva, activación de cohorte y
  ejecución real de OpenRouter shadow pendientes.

## Last Audit
2026-08-22 — repo remoto sincronizado; estructura V4, REST publico de Supabase,
contratos de practica/Tutor y runtime publico canonico auditados. VPS admin no verificado.

---

## Canonical documentation index
- `docs/project/canonical-docs.md` (indice canonico minimo para evitar competencia entre fuentes).
- `docs/archive/legacy-candidates.md` (matriz inicial de candidatos legacy para reduccion documental fase 3).

## Estado general

**Estado:** producto activo con core operativo y beta candidate funcionalmente recorrida. El banco beta, su contrato editorial JSONB y su segmentacion por nucleo estan conectados al runtime. El estado vigente es **candidate**, no release cerrado, porque repo y runtime aun no comparten el mismo commit.

**Producto:** login, onboarding, practica y dashboard siguen siendo las superficies activas; Tutor GCM permanece bajo contrato, sin autoridad sobre scoring, avance ni estado de sesion.

**Bloque actual en repo:** Sprint 48 — V4 Runtime Seguro + Tutor IA en Shadow (en ejecución).

**Estado del bloque actual:** Bloques 0–5 implementados y validados en repo;
aplicación remota, shadow real y E2E pendientes.

**Sprint anterior cerrado:** Sprint 46 — Cierre normativo del Tutor GCM.

**Rama canonica:** `master`.

**Version declarada en `package.json`:** `0.6.0`.

## Sprint 48 — V4 Runtime Seguro + Tutor IA en Shadow

### Estado
**EN EJECUCIÓN — REPO COMPLETO, GATES REMOTOS ABIERTOS**

### Resultado de la preparacion
- PRD integral: `docs/01-product/prd-v4-tutor-ai-openrouter.md`.
- Plan ejecutable: `docs/02-delivery/sprint-48-v4-runtime-secure-tutor-shadow.md`.
- V4 queda decidido como unica fuente predeterminada, sin fallback legacy silencioso.
- OpenRouter queda limitado a shadow, un modelo/endpoint aprobado, salida estructurada,
  ZDR, sin herramientas y con fallback deterministico.
- El P0 de exposicion de respuestas precede importacion, corte V4 e integracion LLM.

### Evidencia y limites
- El corte congelado se deriva del manifiesto V4 y tiene validación estructural y
  cierre editorial agregado. El importador verifica evidencia machine-checkable,
  SHA, hashes y conteo; no se revisaron ítems individuales en este PRD.
- El contraste Supabase fue de lectura publica, no administrativo.
- No se aplicaron migraciones ni se importaron filas en producción; `0028` y el
  lote completo solo se ejecutaron en Supabase local aislado.
- `0020_secure_question_answer_boundary.sql`, contratos pre/post y pruebas de
  seguridad están implementados localmente; no constituyen evidencia de cierre remoto.
- El selector, rutas y UI usan el contrato V4-only en repo, reportan inventario
  vacío sin fallback y separan contexto/enunciado y feedback post-respuesta.
- El Tutor construye expedientes V4 pre/post separados sin normalizador legacy;
  scoring, avance y selección siguen fuera de su autoridad.
- OpenRouter está integrado como shadow opt-in, no visible, con proveedor/modelo
  fijados en `openai/gpt-4o-2024-08-06`/`azure` y métricas minimizadas; falta una
  ejecución shadow en runtime. Una llamada local controlada con clave rotada pasó
  HTTP 200 y JSON Schema estricto; no se verificó VPS ni producción.
- La evaluación local cubre 120 escenarios y fallos mock; no sustituye métricas
  reales de latencia/costo ni E2E sobre una cohorte V4 activa.
- El ensayo PRD 2 reconstruye `0019–0028`, importa 248/248, reejecuta sin
  duplicados y verifica rollback total, permisos y vistas; no activa preguntas.

## Beta Candidate 0.6.0 — snapshot ejecutivo

### Estado
**CANDIDATA A BETA, NO RELEASE CERRADO**

### Evidencia positiva
- HEAD actual de `master`: `b0207e9`.
- Runtime publico y deploy tree verificados en `ad6ad35`.
- E2E autenticado real: 5/5 respuestas correctas, sesion cerrada y dashboard con 5 intentos.
- Supabase: 100 preguntas beta importadas y 100 filas visibles en `v_item_bank_active`.
- Version declarada: `0.6.0`.
- No se identifican PRs o issues abiertos en la auditoria previa.
- Build local y typecheck/lint fueron reportados en PASS en la revision previa de Codex.
- CI formal existe para build, tests, validacion de contenido, smoke de arranque y Docker build.
- Core funcional documentado: login, onboarding, practica, dashboard, banco activo, Tutor GCM con guardrails, trazas y senales pedagogicas.

### Gate que bloquea declararla beta funcional
- Falta alinear `~/.openclaw/product`, `/opt/gcm/app` y la imagen runtime con `b0207e9`.
- QA postdeploy registrado como PASS: smoke local/publico, API E2E y UI Chromium.
- Falta alinear source/deploy/runtime y crear el tag `v0.6.0-beta.1`.

### Criterio de cierre beta recomendado
Declarar `v0.6.0-beta.1` solo cuando `docs/02-delivery/release-checklist.md` quede completo para un commit unico y el runtime publico muestre ese mismo commit.

## Verdad operativa actual

- **Fuente de verdad del producto:** `https://github.com/MarlonMedellin/GanaConMerito`.
- **Copia sincronizada operativa en VPS:** `~/.openclaw/product`.
- **Arbol de deploy:** `/opt/gcm/app`.
- **URL publica canonica:** `https://ganaconmerito.com`.
- **Consola operacional:** `https://ganaconmerito.com/update.html`.
- **HEAD actual del repo revisado:** `b0207e9`.
- **Ultimo commit publico desplegado y verificado:** `ad6ad35`.
- **Estado de paridad repo/runtime:** no alineado; E2E real verificado sobre `ad6ad35`.

## Sprint 47 — mantenimiento menor y saneamiento final

### Estado
**CERRADO EN REPO (DOCUMENTAL, CIERRE CORTO)**

### Resultado ejecutivo
- Se alinea el estado ejecutivo post-Sprint 46 entre `status.md`, `sprint-log.md`, `change-log.md` y `backlog.md`.
- Se corrigen referencias residuales del sprint anterior para que el siguiente frente no compita con la secuencia real ya decidida.
- Se deja Sprint 47 como bloque corto de cierre, sin abrir cambios funcionales, sin claims de runtime nuevos y sin reabrir hardening grande.

### Cierre de Gobernanza (Claim 6)
- **Estado:** CERRADO (2026-05-23)
- **Política de Datos:** Se establece como política final inmutable que el Markdown (`content/items/*.md`) es la única fuente canónica de verdad. El JSON derivado en `content/exports/json/` se define como un artefacto secundario de consumo, excluido explícitamente del control de versiones (`.gitignore`).
- **Implementación y Trazabilidad:** Automatización del flujo MD→JSON con verificación de consistencia mediante SHA-256 (`npm run content:export:json:check`).
- **Evidencia Técnica:** Verificado y consolidado en commit `61e7d06`.

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

## Validacion UX movil — 2026-08-19

**Estado:** VALIDADA EN RUNTIME PUBLICO

- Viewport Playwright: 390x844, sesion autenticada real.
- Rutas verificadas: `/home`, `/practice` y `/dashboard`.
- `scrollWidth` final: 375 px en las tres rutas; no se detecto overflow horizontal.
- Navegacion inferior movil visible dentro del viewport en las tres rutas.
- Se corrigieron hijos de CSS Grid y etiquetas de competencia sin espacios que imponian un ancho mayor al viewport.
- Evidencia adicional: `/opt/gcm/app/artifacts/mobile-audit-fixes`.

## Validacion Tutor y fallback — 2026-08-20

**Estado:** VALIDADA; FALLA DE PROVEEDOR EXTERNO NO SIMULADA

- Runtime publico autenticado: `/practice`, inicio de sesion y panel `Tutor GCM` visibles.
- Accion guiada `Dame una pista`: respuesta orientativa recibida sin revelar la clave.
- Consulta `Dime la respuesta correcta` antes de responder: guardrail activo y respuesta segura.
- Fallback por evidencia insuficiente: PASS en `src/lib/tutor/tutor.test.ts`, con `degraded=true` y mensaje seguro.
- Contrato endpoint sin payload obligatorio: `POST /api/tutor/turn` devuelve `400` sin filtrar informacion.

## Cumplimiento PRD Beta — 2026-08-20

- Beta técnica funcional: PASS.
- Fallback editorial ante caída simulada del endpoint Tutor: PASS en runtime público; la sesión conserva feedback y permite continuar.
- PRD completo al 100%: pendiente de validación humana con perfiles A/B/C, cohorte de 10–20 usuarios y métrica de comprensión.
- Matriz detallada: `docs/02-delivery/prd-beta-compliance.md`.

## Estado normativo

Sprint 22 se mantiene en estado `synthesized_governed_unverified` dado que el sistema todavia no cuenta con anexos oficiales suficientes para promover `source_verified`.
