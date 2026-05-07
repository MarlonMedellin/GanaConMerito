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
last_reviewed: 2026-05-04
---

# Sprint log

## Sprint cerrado — Sprint 20: Auditoría Runtime Tutor GCM
- **Estado**: CERRADO CON PASS (LIMITACIÓN EN ONBOARDING)
- **Fecha**: 2026-05-07
- **Commit en master/runtime validado**: `9cd7ce44ab60ff7f24a996c244244239bb5f3b97`
- **Short hash runtime**: `9cd7ce4`
- **Objetivo**: auditar la integridad funcional y pedagógica del Tutor GCM en el entorno de producción, verificando el cumplimiento de guardrails y la persistencia de sesión post-despliegue.

### Entregado
- `docs/02-delivery/tutor-gcm-sprint-20-runtime-audit.md` (Reporte de auditoría detallado).
- `artifacts/qa/tutor-gcm-latest-sprints-report.json` (Evidencia JSON sanitizada).
- `artifacts/qa/tutor-gcm-sprint-20-evidence.png` (Evidencia visual sanitizada).

### Validaciones Ejecutadas
- [x] Integridad de Commit: el runtime muestra `9cd7ce4`.
- [x] Persistencia de sesión: el estado autenticado se mantiene tras inyección de cookies.
- [x] Guardrail Pre-Respuesta: el tutor rechaza revelar la clave antes de que el usuario responda.
- [x] Explicación Post-Respuesta: el tutor explica la clave registrada tras la validación del ítem.
- [x] Dashboard: operativo y navegable.

### Riesgos y Notas Operativas
- **Bypass Onboarding**: se utilizó bypass a nivel de DB para estabilizar la prueba automatizada. El flujo UI de onboarding no fue validado de punta a punta.
- **Seguridad**: se reporta exposición de secretos en logs de terminal previos. Se recomienda la rotación de `SUPABASE_SERVICE_ROLE_KEY`.

## Sprint cerrado — Sprint 13: Fuente de verdad normativa sintetizada v1
- **Estado**: CERRADO CON WARN EXPLICITO
- **Fecha**: 2026-05-04
- **Base**: `88f997c232dcf2cb1958642e9055e26f0805778d`
- **Objetivo**: cerrar una fuente de verdad normativa mínima y gobernada para Tutor GCM, evitando construir un sistema gigante y evitando inventar reglas no verificadas.

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
- Motivo: los adjuntos normativos previos expiraron y no se cargaron de nuevo acuerdos/guías oficiales completos.
- Criterio: el Tutor GCM puede usar la síntesis para orientación general, pero debe degradar si se le pide una regla normativa específica no cargada.

### Guardrails preservados
- No se conectó LLM real.
- No se tocó scoring.
- No se tocó avance de sesión.
- No se tocó cierre de sesión.
- No se tocaron migraciones Supabase.
- No se tocó VPS ni Docker.
- No se ejecutó el refactor de `PracticeSession`; solo quedó planificado.

## Sprint cerrado — Sprint 12: Métricas confiables y útiles v1
- **Estado**: CERRADO CON PASS/WARN MENOR ACEPTADO
- **Fecha**: 2026-05-04
- **PR**: #6
- **Commit en master/runtime validado**: `64d78def1d8dd4f98ec9ae5ba55a3fed97e4e4ba`
- **Short hash runtime**: `64d78de`
- **Build time validado**: `2026-05-04T03:24:21Z`
- **Objetivo**: fortalecer el contrato, lógica y presentación de métricas para que el dashboard sea prudente, simple y accionable sin vender conclusiones fuertes con poca evidencia.

### Entregado
- `MetricSignalLevel` y `MetricInterpretation` incorporados al contrato de evaluación.
- `buildDashboardSummaryMetrics` devuelve nivel de señal, descripción, acción recomendada y flags de confiabilidad.
- Fortalezas, refuerzos, percentil y tendencia quedan condicionados por evidencia suficiente.
- Dashboard histórico y por sesión ajustados con copy prudente.
- E2E online reportado como PASS/WARN menor sobre producción.

### Guardrails preservados
- No se tocó scoring.
- No se tocó avance de sesión.
- No se tocó Tutor GCM.
- No se inventaron percentiles ni promesas de resultado.
- No se ocultaron datos: se calificó su confiabilidad.

## Sprint cerrado — Sprint 11: Tutor GCM sincronización post-respuesta y trazabilidad operativa v1
- **Estado**: CERRADO CON PASS
- **Fecha**: 2026-05-03
- **PR**: #5
- **Commit en master/runtime validado**: `1dc454291b22bff41b95125fcbd68e373d8f578a`
- **Objetivo**: corregir el estado post-respuesta del Tutor GCM para permitir explicación de clave, feedback y distractores solo después de respuesta confirmada server-side.

### Entregado
- `buildTutorEvidence` resuelve el turno respondido por `sessionId + itemId`.
- Evidencia post-respuesta complementa `session_turns` con `evaluation_events`.
- `canRevealCorrectAnswer` queda en `false` antes de responder y `true` después de respuesta confirmada.
- El tutor puede explicar feedback, clave registrada y distractores después de responder.
- E2E online Sprint 11 reportado como PASS.

## Sprint cerrado — Sprint 10: Tutor GCM fuente de verdad y contrato pedagógico v1
- **Estado**: CERRADO CON PASS/WARN MENOR ACEPTADO
- **Fecha**: 2026-05-03
- **PR**: #4
- **Commit en master/runtime validado**: `7a380328af9fcb974c9ab6497b35380ce9bd06ed`
- **Objetivo**: implementar la base contractual del Tutor GCM para que opere con fuente de verdad gobernada, modos pedagógicos, evidencia server-side y degradación honesta.

### Entregado
- Contratos `ContestTruth`, `AspirationalProfileTruth`, `QuestionTruth`, `UserSessionTruth`, `TutorTurnResponse` y `TutorTurnTrace`.
- Modos `current_question`, `contest_preparation` y `performance_analysis`.
- Intenciones pedagógicas v1.
- `tutor-evidence-builder` server-side.
- Guardrails de autoridad y fuente insuficiente.
- `/api/tutor/turn` mantiene payload mínimo desde cliente.

### No alcance
- LLM real.
- Admin de fuente de verdad.
- Embeddings.
- Persistencia real de `TutorTurnTrace`.
- Fuente normativa completa.

## Sprint cerrado — Rotación controlada de selección de ítems
- **Estado**: CERRADO
- **PR**: #3
- **Objetivo**: evitar que nuevas sesiones inicien siempre con la misma pregunta para el mismo usuario.
- **Entregado**: pool de candidatos, exclusión de ítems recientes, rotación determinística y fallback seguro.

## Sprint cerrado — Humanización UX de etiquetas técnicas
- **Estado**: CERRADO
- **PR**: #2
- **Objetivo**: eliminar slugs crudos en UI como `gestion · lectura_de_indicadores`.
- **Entregado**: helper `formatTechnicalLabel`, `formatAreaCompetency`, dashboard y práctica humanizados.

## Sprint cerrado — Fix de login / Supabase runtime public config
- **Estado**: CERRADO
- **PR**: #1
- **Objetivo**: corregir bloqueo de login por ausencia de variables públicas Supabase en el browser bundle.
- **Entregado**: fallback runtime de configuración pública Supabase y login operativo.

---

## Sprint cerrado — Sprint 9: Integración funcional mínima gobernada de Tutor GCM
- **Estado**: CERRADO OPERATIVAMENTE
- **Fecha**: 2026-05-02
- **Commit funcional/deploy verificado**: `8ec0ee7`
- **Commit documental operativo previo**: `da3a8e66c4ce5d38fcf138725c81575836c7dfdd`
- **Objetivo**: integrar al Tutor GCM en la UX de práctica de forma visible y útil pero estrictamente gobernada, sin abrir chat libre ni transferir autoridad al LLM.

### Comprometido
- componente UI `TutorInterface` premium
- API Route `/api/tutor/turn` autenticada
- orquestador con guardrails de autoridad y contexto de tema
- integración en `PracticeSession` sin romper el core
- cierre operativo con source, deploy y runtime alineados

### Entregado
- Hecho: `src/components/tutor/tutor-interface.tsx` implementado.
- Hecho: `src/app/api/tutor/turn/route.ts` implementado con sesión autenticada y contexto derivado del servidor.
- Hecho: integración en `PracticeSession` verificada con build reportado como exitoso.
- Hecho: `TutorOrchestrator` mantenido dentro de guardrails: sin scoring, sin avance y sin cierre de sesión.
- Hecho: cliente reducido a payload mínimo permitido (`sessionId`, `itemId`, `message`) para evitar inyección de contexto operativo sensible.
- Hecho: triple verificación operativa reportada: `~/.openclaw/product` = `/opt/gcm/app` = runtime visible sobre `8ec0ee7`.
- Hecho: runtime visible reportado en `:3000/login` con `buildTime=2026-05-02T20:21:39Z`.

### Guardrails preservados
- Tutor GCM no es chat libre.
- Tutor GCM no decide scoring.
- Tutor GCM no decide avance.
- Tutor GCM no decide cierre de sesión.
- Tutor GCM no decide verdad operativa del sistema.
- El backend no confía en `currentTopic`, `itemsCompleted`, `currentScore` ni señales críticas enviadas por frontend.
- El contexto autorizado se deriva desde servidor y sesión propia.

### No alcance
- integración con proveedor LLM real
- expansión editorial/question-bank
- cambios de scoring
- cambios de avance o cierre de sesión
- nuevas migraciones o cambios de schema

### Criterio de cierre cumplido
- [x] Tutor GCM visible en práctica.
- [x] Ruta `/api/tutor/turn` autenticada y gobernada.
- [x] Contexto crítico derivado desde servidor.
- [x] Core sin cambios funcionales fuera del alcance autorizado.
- [x] Source, deploy y runtime reportados como alineados sobre `8ec0ee7`.
- [x] Documentación viva alineada con cierre operativo.

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
- [x] Triple verificación confirmada sobre `c7ec88c`.
- [x] Saneamiento de ruido efímero en fuente canónica completado.
- [x] Evidencia de QA fresca persistida en VPS.
- [x] Drift documental corregido y sincronizado con Git.

## Sprint cerrado — Sprint 7: Reapertura selectiva de editorial / question-bank
- **Estado**: CERRADO
- **Fecha**: 2026-05-02
- **Commit documental de cierre**: `c7ec88c`
- **Objetivo**: reabrir de forma selectiva y gobernada el frente editorial/question-bank, validando el corpus activo y reduciendo drift entre repo, documentación y runtime esperado.

### Entregado
- `docs/project/current-corpus-runtime-activation-map.md` con el listado de 27 ítems activos.
- Actualización documental de `status`, `backlog` y `change-log` para reflejar el banco activo gobernado.
- Validación reportada del corpus activo sin drift entre DB y repo.
- Mantenimiento del core sin cambios funcionales ni regresiones reportadas.

### No alcance
- expansión del corpus por encima de 27 ítems
- cambios de UI del core
- integración visible adicional de Tutor GCM
- nuevas migraciones o cambios de schema de Supabase

## Sprint cerrado — Sprint 6: Disciplina operativa de release y runtime
- **Estado**: CERRADO
- **Fecha**: 2026-05-02
- **Commit funcional**: `deb265c`
- **Commit documental de cierre**: `c8309f6`
- **Objetivo**: endurecer el proceso de release, asegurar triple verificación y reducir drift entre fuente, deploy y runtime.

### Entregado
- checklist formal de release en `docs/02-delivery/release-checklist.md`
- actualización de versión a `0.6.0`
- saneamiento de permisos Git en VPS para pulls limpios
- deploy validado con triple verificación `Source = Deploy = Runtime`
- verificación visible de `commit` y `buildTime` en `/login`
- cierre documental consolidado en `status`, `sprint-log` y `change-log`

### No alcance
- nuevas features funcionales del producto
- reapertura de editorial/question-bank
- integración visible adicional de Tutor GCM
- cambios de schema o migraciones de Supabase

## Sprint cerrado — Sprint 5: Tutor GCM: base técnica gobernada
- **Estado**: CERRADO FUNCIONALMENTE
- **Fecha**: 2026-05-02
- **Commit funcional**: `5e918a5`
- **Objetivo**: diseñar e implementar la infraestructura mínima gobernada para Tutor GCM sin darle autoridad sobre negocio.

### Entregado
- contrato v1 del turno implementado (`TutorInput`, `TutorOutput`, `TutorTrace`)
- reglas de autoridad explícitas en `src/domain/tutor/contract.ts`
- orquestador con fallback y validación en `src/lib/tutor/tutor-orchestrator.ts`
- QA negativa validando rechazo de acciones no autorizadas
- build del core sin regresiones

### No alcance
- integración real con proveedor LLM
- UI conversacional visible para usuario final
- autoridad sobre scoring, avance o cierre de sesión

## Sprint cerrado — Sprint 4: Productización del core
- **Estado**: CERRADO
- **Fecha**: 2026-05-02
- **Commit funcional**: `304f950`
- **Commit documental de cierre**: `ef13a4f`
- **Objetivo**: endurecer el core, mejorar UX móvil y retirar superficies no prioritarias del flujo principal.

### Entregado
- `AppNav` reducido a `Inicio / Práctica / Métricas`
- biblioteca/editorial fuera de la navegación principal del usuario
- componentes `LoadingState`, `EmptyState` y `ErrorState`
- mejoras de continuidad en `Home` y endurecimiento de flujo en `Practice`
- versión declarada `0.5.0`
- build validado y `test:dashboard` verde en fuente canónica
- validación de runtime/E2E reportada sobre VPS para el runtime funcional del sprint

### No alcance
- implementación funcional de `Tutor GCM`
- reapertura de editorial como producto de usuario final
- cambios de migraciones o schema de Supabase
- cambios estructurales nuevos de arquitectura fuera del hardening del sprint

---

## Historial operativo anterior

### Sprint 3 - Normalización operativa final y preparación del frente de asistentes
- **Estado**: CERRADO FORMAL Y OPERATIVAMENTE
- **Fecha de cierre efectiva**: 2026-05-01
- **Deploy triple-verificado**: `701ebcf`
- **buildTime visible validado**: `2026-05-01T18:25:50Z`
- **Resultado**: worktree residual resuelto, mapa de features activas consolidado, ADR-002 aprobado con guardrails y checklist de deploy aplicada.

### Sprint 2 - Maduración operativa del producto
- **Estado**: CERRADO OPERATIVAMENTE
- **Fecha de cierre efectiva**: 2026-05-01
- **Resultado**: navegación/auth consolidada, onboarding endurecido, QA postdeploy validada, gobernanza inicial de asistentes formalizada y regla de verdad runtime documentada.

### Sprint 1 - Gobernanza mínima y baseline operable del producto
- **Estado**: CERRADO
- **Resultado**: baseline inicial de práctica/dashboard/sesiones, QA semántica y banco de preguntas operativo inicial documentado.
