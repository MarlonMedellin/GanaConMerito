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
last_reviewed: 2026-05-07
---

# Sprint log

## Sprint activo — Sprint 33: Stabilization, Governance and Runtime Confidence
- **Estado**: ACTIVO
- **Fecha de apertura**: 2026-05-07
- **Rama de trabajo**: `sprint-33-stabilization-governance`
- **Objetivo**: remediar hallazgos P0/P1 del control MVP y estabilizar backend/API, QA, seguridad, datos y release sin abrir expansion funcional.

### Entregado parcialmente
- `docs/02-delivery/sprint-33-stabilization-plan.md` creado.
- `docs/03-architecture/api-contract-standard-v1.md` creado.
- `docs/06-governance/runtime-release-rollback-policy.md` creado.
- `docs/06-governance/qa-smoke-vs-forensic-policy.md` creado.
- `docs/03-architecture/rate-limiting-adr-001.md` creado.
- `docs/03-architecture/session-concurrency-adr-002.md` creado.
- `docs/07-compliance/appsec-remediation-matrix-sprint-33.md` creado.
- `docs/project/status.md` actualizado para declarar Sprint 33 como sprint activo.

### Validaciones ejecutadas
- [x] Revision de `AGENTS.md` en rama de trabajo.
- [x] Creacion documental por GitHub API.
- [x] Alineacion inicial de status operativo.
- [ ] Validacion runtime publica.
- [ ] Ejecucion de tests locales o CI.
- [ ] Implementacion de codigo backend/API.
- [ ] Correccion real del gate QA de idempotencia.

### Riesgos y notas operativas
- **Sin runtime**: esta apertura se ejecuto solo con acceso al repo; no declara validacion en `https://cnsc.profemarlon.com`.
- **Sin codigo productivo**: los cambios iniciales son documentales y de gobernanza.
- **Backend/API**: sigue pendiente desbloquear cambios reales en `src/app/api/**`.
- **QA**: sigue pendiente reemplazar assertions fragiles basadas en texto completo de pagina.
- **AppSec**: P0/P1 priorizados, pero aun no corregidos en codigo.

---

## Sprint cerrado — Sprint 22: Tutor GCM Normative Source Verification
- **Estado**: CERRADO CON PASS CON WARN
- **Fecha**: 2026-05-06
- **Base en master**: `a056da2e69bf302473609e7192e36dc76132383b`
- **Objetivo**: reducir riesgo normativo del Tutor GCM dejando clasificacion honesta entre contrato verificado, sintesis no verificada y faltantes reales para `source_verified`, sin tocar runtime ni backend critico.

### Entregado
- `docs/02-delivery/tutor-gcm-normative-verification.md` creado como reporte canonico del frente normativo.
- Alineacion documental de `docs/01-product/source-truth/normative-source-truth-v1.md`, `docs/03-architecture/runtime-flow-map.md` y `docs/07-compliance/server-side-service-role-policy.md`.
- Actualizacion de `status`, `sprint-log`, `change-log` y `backlog` para dejar trazabilidad ejecutiva del estado normativo real.

### Validaciones Ejecutadas
- [x] Revision documental cruzada de producto, arquitectura y compliance.
- [x] Confirmacion en repo del estado tecnico `synthesized_governed_unverified`.
- [x] Confirmacion de placeholders pendientes para acuerdo, guia metodologica y estructura de prueba.
- [x] Confirmacion de que el tutor degrada y no se presenta como `source_verified`.
- [ ] Verificacion de nuevos anexos oficiales en repo.
- [ ] Cierre normativo total del Tutor GCM.

### Riesgos y Notas Operativas
- **Cierre funcional vs. cierre normativo**: Sprint 21 sigue cerrando el frente funcional; Sprint 22 no convierte eso en cierre normativo.
- **Fuente oficial faltante**: no hay evidencia suficiente en repo para acuerdo, guia metodologica, estructura de prueba y soporte de convocatoria/manual.
- **Decision vigente**: el frente normativo queda en **PASS con WARN**, no en PASS pleno.

## Sprint cerrado — Sprint 21: Tutor GCM Final Runtime Closure
- **Estado**: CERRADO CON PASS CON WARN
- **Fecha**: 2026-05-06
- **Base en master**: `400c7e33e2467e1cadb110b09b2ff7f70ee99a95`
- **Commit/runtime publico observado**: `9cd7ce44ab60ff7f24a996c244244239bb5f3b97`
- **Short hash runtime**: `9cd7ce4`
- **Build time runtime**: `2026-05-06T23:08:12Z`
- **Objetivo**: cerrar funcionalmente Tutor GCM con evidencia publica verificable y documentacion viva alineada, sin abrir cambios de producto ni tocar infraestructura.

### Entregado
- `docs/02-delivery/tutor-gcm-final-runtime-closure.md` creado como reporte canonico de cierre funcional.
- Actualizacion documental de `status`, `sprint-log`, `change-log` y `backlog`.
- Contraste explicito entre observacion publica actual y evidencia QA sanitizada previa.

### Validaciones Ejecutadas
- [x] `/login` publico responde `200` y expone metadata visible de commit/build.
- [x] `/practice` y `/dashboard` sin sesion redirigen `307 -> /login`.
- [x] Evidencia sanitizada previa confirma Tutor GCM visible en practica.
- [x] Evidencia sanitizada previa confirma acciones guiadas visibles.
- [x] Evidencia sanitizada previa confirma guardrail pre-respuesta.
- [x] Evidencia sanitizada previa confirma explicacion post-respuesta.
- [ ] PASS explicito del resumen visual de trazas en dashboard desde esta revision.
- [ ] Logout fresco del mismo usuario validado dentro de esta corrida.

### Riesgos y Notas Operativas
- **Bypass Onboarding**: se mantiene como workaround controlado de QA; no documentarlo como flujo estandar.
- **Normativa**: la fuente sigue en `synthesized_governed_unverified`; el cierre funcional del tutor no equivale a cierre normativo total.
- **Dashboard Tutor**: el dashboard general queda respaldado por evidencia previa, pero el resumen visual de trazas no se marca PASS explicito sin evidencia aislada adicional.

## Sprint cerrado — Sprint 20: Auditoría Runtime y Consolidación Tutor GCM
- **Estado**: CERRADO CON PASS (LIMITACIÓN EN ONBOARDING)
- **Fecha**: 2026-05-07
- **Commit en master/runtime validado**: `9cd7ce44ab60ff7f24a996c244244239bb5f3b97`
- **Short hash runtime**: `9cd7ce4`
- **Objetivo**: auditar la integridad funcional/pedagógica en producción y consolidar el frente Tutor GCM (copy, intents y UX de textarea) sin tocar el backend crítico.

### Entregado
- `docs/02-delivery/tutor-gcm-sprint-20-runtime-audit.md` (Reporte de auditoría detallado).
- `artifacts/qa/tutor-gcm-latest-sprints-report.json` (Evidencia JSON sanitizada).
- `artifacts/qa/tutor-gcm-sprint-20-evidence.png` (Evidencia visual sanitizada).
- `TutorInterface`: acciones guiadas alineadas con intents actuales y preservación de borrador en textarea (validado localmente).
- `tutor.test.ts`: cobertura adicional para mapeo de copy guiado -> intent esperado.

### Validaciones Ejecutadas
- [x] Integridad de Commit: el runtime muestra `9cd7ce4`.
- [x] Persistencia de sesión: el estado autenticado se mantiene tras inyección de cookies.
- [x] Guardrail Pre-Respuesta: el tutor rechaza revelar la clave antes de que el usuario responda.
- [x] Explicación Post-Respuesta: el tutor explica la clave registrada tras la validación del ítem.
- [x] Dashboard: operativo y navegable.

### Riesgos y Notas Operativas
- **Bypass Onboarding**: se utilizó bypass a nivel de DB para la prueba automatizada. El flujo UI de onboarding no fue validado de punta a punta.
- **Seguridad**: se reporta exposición de secretos en logs previos. Se recomienda la rotación de `SUPABASE_SERVICE_ROLE_KEY`.

## Sprint cerrado — Sprint 13: Fuente de verdad normativa sintetizada v1
- **Estado**: CERRADO CON WARN EXPLICITO
- **Fecha**: 2026-05-04
- **Base**: `88f997c232dcf2cb1958642e9055e26f0805778d`
- **Objetivo**: cerrar una fuente de verdad normativa minima y gobernada para Tutor GCM, evitando construir un sistema gigante y evitando inventar reglas no verificadas.

### Entregado
- `docs/03-architecture/runtime-flow-map.md` creado.
- `docs/07-compliance/server-side-service-role-policy.md` creado.
- `docs/01-product/source-truth/normative-source-truth-v1.md` creado.
- `src/lib/tutor/normative-source-truth.ts` creado.
- `src/types/tutor-turn.ts` extendido con `SourceTruthStatus` y campos de trazabilidad normativa.
- `src/lib/tutor/tutor-evidence-builder.ts` conectado a la fuente normativa sintetizada.
- `docs/01-product/future-practice-session-light-refactor.md` creado como sprint futuro, no ejecutado.

### Estado de fuente
- Estado actual: `synthesized_governed_unverified`.
- Motivo: los adjuntos normativos previos expiraron y no se cargaron de nuevo acuerdos/guias oficiales completos.
- Criterio: el Tutor GCM puede usar la sintesis para orientacion general, pero debe degradar si se le pide una regla normativa especifica no cargada.

### Guardrails preservados
- No se conecto LLM real.
- No se toco scoring.
- No se toco avance de sesion.
- No se toco cierre de sesion.
- No se tocaron migraciones Supabase.
- No se toco VPS ni Docker.
- No se ejecuto el refactor de `PracticeSession`; solo quedo planificado.

## Continuidad planificada desde Sprint 14
- La fuente de verdad del producto es `https://github.com/ProfeMarlonMDE/GanaConMerito`.
- Todas las fuentes de trabajo deben promover cambios por Pull Request hacia `master`.
- Despues del merge se debe actualizar `~/.openclaw/product`, luego `/opt/gcm/app`, luego Docker en el VPS OCI.
- Las pruebas relevantes deben validarse en `https://cnsc.profemarlon.com`.
- Las diferencias de hash entre `master` y ramas de sprint no bastan por si solas para declarar drift.
- La continuidad nominal de roadmap queda en Sprint 14, Sprint 15 y Sprint 16.

## Sprint cerrado — Sprint 12: Metricas confiables y utiles v1
- **Estado**: CERRADO CON PASS/WARN MENOR ACEPTADO
- **Fecha**: 2026-05-04
- **PR**: #6
- **Commit en master/runtime validado**: `64d78def1d8dd4f98ec9ae5ba55a3fed97e4e4ba`
- **Short hash runtime**: `64d78de`
- **Build time validado**: `2026-05-04T03:24:21Z`
- **Objetivo**: fortalecer el contrato, logica y presentacion de metricas para que el dashboard sea prudente, simple y accionable sin vender conclusiones fuertes con poca evidencia.

### Entregado
- `MetricSignalLevel` y `MetricInterpretation` incorporados al contrato de evaluacion.
- `buildDashboardSummaryMetrics` devuelve nivel de senal, descripcion, accion recomendada y flags de confiabilidad.
- Fortalezas, refuerzos, percentil y tendencia quedan condicionados por evidencia suficiente.
- Dashboard historico y por sesion ajustados con copy prudente.
- E2E online reportado como PASS/WARN menor sobre produccion.

### Guardrails preservados
- No se toco scoring.
- No se toco avance de sesion.
- No se toco Tutor GCM.
- No se inventaron percentiles ni promesas de resultado.
- No se ocultaron datos: se califico su confiabilidad.

## Sprint cerrado — Sprint 11: Tutor GCM sincronizacion post-respuesta y trazabilidad operativa v1
- **Estado**: CERRADO CON PASS
- **Fecha**: 2026-05-03
- **PR**: #5
- **Commit en master/runtime validado**: `1dc454291b22bff41b95125fcbd68e373d8f578a`
- **Objetivo**: corregir el estado post-respuesta del Tutor GCM para permitir explicacion de clave, feedback y distractores solo despues de respuesta confirmada server-side.

### Entregado
- `buildTutorEvidence` resuelve el turno respondido por `sessionId + itemId`.
- Evidencia post-respuesta complementa `session_turns` con `evaluation_events`.
- `canRevealCorrectAnswer` queda en `false` antes de responder y `true` despues de respuesta confirmada.
- El tutor puede explicar feedback, clave registrada y distractores despues de responder.
- E2E online Sprint 11 reportado como PASS.

## Sprint cerrado — Sprint 10: Tutor GCM fuente de verdad y contrato pedagogico v1
- **Estado**: CERRADO CON PASS/WARN MENOR ACEPTADO
- **Fecha**: 2026-05-03
- **PR**: #4
- **Commit en master/runtime validado**: `7a380328af9fcb974c9ab6497b35380ce9bd06ed`
- **Objetivo**: implementar la base contractual del Tutor GCM para que opere con fuente de verdad gobernada, modos pedagogicos, evidencia server-side y degradacion honesta.

### Entregado
- Contratos `ContestTruth`, `AspirationalProfileTruth`, `QuestionTruth`, `UserSessionTruth`, `TutorTurnResponse` y `TutorTurnTrace`.
- Modos `current_question`, `contest_preparation` y `performance_analysis`.
- Intenciones pedagogicas v1.
- `tutor-evidence-builder` server-side.
- Guardrails de autoridad y fuente insuficiente.
- `/api/tutor/turn` mantiene payload minimo desde cliente.

### No alcance
- LLM real.
- Admin de fuente de verdad.
- Embeddings.
- Persistencia real de `TutorTurnTrace`.
- Fuente normativa completa.

## Sprint cerrado — Rotacion controlada de seleccion de items
- **Estado**: CERRADO
- **PR**: #3
- **Objetivo**: evitar que nuevas sesiones inicien siempre con la misma pregunta para el mismo usuario.
- **Entregado**: pool de candidatos, exclusion de items recientes, rotacion deterministica y fallback seguro.

## Sprint cerrado — Humanizacion UX de etiquetas tecnicas
- **Estado**: CERRADO
- **PR**: #2
- **Objetivo**: eliminar slugs crudos en UI como `gestion · lectura_de_indicadores`.
- **Entregado**: helper `formatTechnicalLabel`, `formatAreaCompetency`, dashboard y practica humanizados.

## Sprint cerrado — Fix de login / Supabase runtime public config
- **Estado**: CERRADO
- **PR**: #1
- **Objetivo**: corregir bloqueo de login por ausencia de variables publicas Supabase en el browser bundle.
- **Entregado**: fallback runtime de configuracion publica Supabase y login operativo.

---

## Sprint cerrado — Sprint 9: Integracion funcional minima gobernada de Tutor GCM
- **Estado**: CERRADO OPERATIVAMENTE
- **Fecha**: 2026-05-02
- **Commit funcional/deploy verificado**: `8ec0ee7`
- **Commit documental operativo previo**: `da3a8e66c4ce5d38fcf138725c81575836c7dfdd`
- **Objetivo**: integrar al Tutor GCM en la UX de practica de forma visible y util pero estrictamente gobernada, sin abrir chat libre ni transferir autoridad al LLM.

### Comprometido
- componente UI `TutorInterface` premium
- API Route `/api/tutor/turn` autenticada
- orquestador con guardrails de autoridad y contexto de tema
- integracion en `PracticeSession` sin romper el core
- cierre operativo con source, deploy y runtime alineados

### Entregado
- Hecho: `src/components/tutor/tutor-interface.tsx` implementado.
- Hecho: `src/app/api/tutor/turn/route.ts` implementado con sesion autenticada y contexto derivado del servidor.
- Hecho: integracion en `PracticeSession` verificada con build reportado como exitoso.
- Hecho: `TutorOrchestrator` mantenido dentro de guardrails: sin scoring, sin avance y sin cierre de sesion.
- Hecho: cliente reducido a payload minimo permitido (`sessionId`, `itemId`, `message`) para evitar inyeccion de contexto operativo sensible.
- Hecho: triple verificacion operativa reportada: `~/.openclaw/product` = `/opt/gcm/app` = runtime visible sobre `8ec0ee7`.
- Hecho: runtime visible reportado en `:3000/login` con `buildTime=2026-05-02T20:21:39Z`.

### Guardrails preservados
- Tutor GCM no es chat libre.
- Tutor GCM no decide scoring.
- Tutor GCM no decide avance.
- Tutor GCM no decide cierre de sesion.
- Tutor GCM no decide verdad operativa del sistema.
- El backend no confia en `currentTopic`, `itemsCompleted`, `currentScore` ni senales criticas enviadas por frontend.
- El contexto autorizado se deriva desde servidor y sesion propia.

### No alcance
- integracion con proveedor LLM real
- expansion editorial/question-bank
- cambios de scoring
- cambios de avance o cierre de sesion
- nuevas migraciones o cambios de schema

### Criterio de cierre cumplido
- [x] Tutor GCM visible en practica.
- [x] Ruta `/api/tutor/turn` autenticada y gobernada.
- [x] Contexto critico derivado desde servidor.
- [x] Core sin cambios funcionales fuera del alcance autorizado.
- [x] Source, deploy y runtime reportados como alineados sobre `8ec0ee7`.
- [x] Documentacion viva alineada con cierre operativo.

## Sprint cerrado — Sprint 8: Runtime confiable, QA postdeploy y disciplina operativa verificable
- **Estado**: CERRADO
- **Fecha**: 2026-05-02
- **Commit funcional auditado**: `c7ec88c`
- **Objetivo**: auditar y endurecer la confiabilidad operativa del runtime con evidencia real, manteniendo release discipline y gates de QA postdeploy sobre `:3000`.

### Evidencia validada
- `~/.openclaw/product` en `c7ec88c`.
- `/opt/gcm/app` en `c7ec88c`.
- `/login` visible en runtime mostrando `commit=c7ec88c` y `buildTime=2026-05-02T18:40:22Z`.
- `qa:smoke:postdeploy` verde.
- `qa:e2e:api` verde.
- `qa:e2e:ui` verde.

### Criterio de cierre cumplido
- [x] Triple verificacion confirmada sobre `c7ec88c`.
- [x] Saneamiento de ruido efimero en fuente canonica completado.
- [x] Evidencia de QA fresca persistida en VPS.
- [x] Drift documental corregido y sincronizado con Git.

## Sprint cerrado — Sprint 7: Reapertura selectiva de editorial / question-bank
- **Estado**: CERRADO
- **Fecha**: 2026-05-02
- **Commit documental de cierre**: `c7ec88c`
- **Objetivo**: reabrir de forma selectiva y gobernada el frente editorial/question-bank, validando el corpus activo y reduciendo drift entre repo, documentacion y runtime esperado.

### Entregado
- `docs/project/current-corpus-runtime-activation-map.md` con el listado de 27 items activos.
- Actualizacion documental de `status`, `backlog` y `change-log` para reflejar el banco activo gobernado.
- Validacion reportada del corpus activo sin drift entre DB y repo.
- Mantenimiento del core sin cambios funcionales ni regresiones reportadas.

### No alcance
- expansion del corpus por encima de 27 items
- cambios de UI del core
- integracion visible adicional de Tutor GCM
- nuevas migraciones o cambios de schema de Supabase

## Sprint cerrado — Sprint 6: Disciplina operativa de release y runtime
- **Estado**: CERRADO
- **Fecha**: 2026-05-02
- **Commit funcional**: `deb265c`
- **Commit documental de cierre**: `c8309f6`
- **Objetivo**: endurecer el proceso de release, asegurar triple verificacion y reducir drift entre fuente, deploy y runtime.

### Entregado
- checklist formal de release en `docs/02-delivery/release-checklist.md`
- actualizacion de version a `0.6.0`
- saneamiento de permisos Git en VPS para pulls limpios
- deploy validado con triple verificacion `Source = Deploy = Runtime`
- verificacion visible de `commit` y `buildTime` en `/login`
- cierre documental consolidado en `status`, `sprint-log` y `change-log`

### No alcance
- nuevas features funcionales del producto
- reapertura de editorial/question-bank
- integracion visible adicional de Tutor GCM
- cambios de schema o migraciones de Supabase

## Sprint cerrado — Sprint 5: Tutor GCM: base tecnica gobernada
- **Estado**: CERRADO FUNCIONALMENTE
- **Fecha**: 2026-05-02
- **Commit funcional**: `5e918a5`
- **Objetivo**: disenar e implementar la infraestructura minima gobernada para Tutor GCM sin darle autoridad sobre negocio.

### Entregado
- contrato v1 del turno implementado (`TutorInput`, `TutorOutput`, `TutorTrace`)
- reglas de autoridad explicitas en `src/domain/tutor/contract.ts`
- orquestador con fallback y validacion en `src/lib/tutor/tutor-orchestrator.ts`
- QA negativa validando rechazo de acciones no autorizadas
- build del core sin regresiones

### No alcance
- integracion real con proveedor LLM
- UI conversacional visible para usuario final
- autoridad sobre scoring, avance o cierre de sesion

## Sprint cerrado — Sprint 4: Productizacion del core
- **Estado**: CERRADO
- **Fecha**: 2026-05-02
- **Commit funcional**: `304f950`
- **Commit documental de cierre**: `ef13a4f`
- **Objetivo**: endurecer el core, mejorar UX movil y retirar superficies no prioritarias del flujo principal.

### Entregado
- `AppNav` reducido a `Inicio / Practica / Metricas`
- biblioteca/editorial fuera de la navegacion principal del usuario
- componentes `LoadingState`, `EmptyState` y `ErrorState`
- mejoras de continuidad en `Home` y endurecimiento de flujo en `Practice`
- version declarada `0.5.0`
- build validado y `test:dashboard` verde en fuente canonica
- validacion de runtime/E2E reportada sobre VPS para el runtime funcional del sprint

### No alcance
- implementacion funcional de `Tutor GCM`
- reapertura de editorial como producto de usuario final
- cambios de migraciones o schema de Supabase
- cambios estructurales nuevos de arquitectura fuera del hardening del sprint

---

## Historial operativo anterior

### Sprint 3 - Normalizacion operativa final y preparacion del frente de asistentes
- **Estado**: CERRADO FORMAL Y OPERATIVAMENTE
- **Fecha de cierre efectiva**: 2026-05-01
- **Deploy triple-verificado**: `701ebcf`
- **buildTime visible validado**: `2026-05-01T18:25:50Z`
- **Resultado**: worktree residual resuelto, mapa de features activas consolidado, ADR-002 aprobado con guardrails y checklist de deploy aplicada.

### Sprint 2 - Maduracion operativa del producto
- **Estado**: CERRADO OPERATIVAMENTE
- **Fecha de cierre efectiva**: 2026-05-01
- **Resultado**: navegacion/auth consolidada, onboarding endurecido, QA postdeploy validada, gobernanza inicial de asistentes formalizada y regla de verdad runtime documentada.

### Sprint 1 - Gobernanza minima y baseline operable del producto
- **Estado**: CERRADO
- **Resultado**: baseline inicial de practica/dashboard/sesiones, QA semantica y banco de preguntas operativo inicial documentado.


## Sprint activo — Sprint 36: Tutor hint ladder and misconception feedback
- **Estado**: EN CURSO
- **Fecha de apertura**: 2026-05-08
- **Rama de trabajo**: `sprint-36-tutor-hint-ladder-misconception-feedback`
- **Objetivo**: mejorar calidad pedagógica del tutor con pistas progresivas y feedback estructurado sin revelar respuestas correctas.
- **Validaciones iniciales**: contrato TutorSupportContract/guardrails/fallback de Sprint 35 y no regresión básica en pruebas de tutor.
