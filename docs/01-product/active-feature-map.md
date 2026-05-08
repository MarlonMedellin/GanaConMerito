---
id: PROD-ACTIVE-FEATURE-MAP
name: active-feature-map
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: product
modules: [auth, onboarding, practice, dashboard, editorial, ai]
tags: [features, inventory, estado-real, alcance]
related:
  - PROD-BACKLOG
  - DEL-SPRINT-LOG
  - ARCH-ASSISTANT-COMPONENT-SPEC
  - ADR-002-assistant-component-governance
last_reviewed: 2026-05-08
---

# Mapa formal de features activas con estado real

## Objetivo
Mantener inventario explícito de lo que está activo, activo con guardrails, diferido o fuera de alcance para evitar sobreprometer producto.

## Regla de lectura
- **Activo**: existe en runtime/código principal y forma parte del flujo real.
- **Activo con guardrails**: existe y opera, pero con restricciones explícitas.
- **Preparado, no completo**: existe contrato/base técnica, pero faltan fuentes, persistencia, admin o integraciones mayores.
- **Diferido**: fuera del sprint o tratado como deuda técnica.
- **Solo lectura**: visible para consulta, no como frente administrativo vivo.

## Resumen ejecutivo actualizado
- El core activo real es: **login -> onboarding -> práctica -> dashboard**.
- El Tutor GCM está **activo con guardrails** dentro de práctica.
- El Tutor GCM tiene **fuente normativa sintetizada v1**, marcada como `synthesized_governed_unverified`.
- El dashboard tiene **contrato de métricas prudentes** para no vender humo.
- El banco de preguntas está **operativo como corpus activo curado**.
- El banco ya tiene una **estructura editorial definida**: base taxonómica en `content/items/` y segunda capa opcional por perfiles docentes.
- Editorial sigue como **biblioteca documental de solo lectura**.
- `PracticeSession` sigue funcional; su refactor liviano queda planificado, no ejecutado.

## 1. Auth y acceso

### Login con Google
- Estado: **Activo**
- Evidencia: `src/app/login/page.tsx`, `src/components/auth/google-sign-in-button.tsx`, `src/app/api/auth/callback/route.ts`, `src/app/api/auth/public-config/route.ts`
- Alcance real:
  - login vía Google
  - redirect si ya existe sesión
  - fallback runtime de configuración pública Supabase
  - metadata visible de runtime en `/login`

### Protección de rutas autenticadas
- Estado: **Activo con guardrails**
- Evidencia: `src/middleware.ts`, `src/lib/supabase/guards.ts`
- Alcance real:
  - home, onboarding, práctica, dashboard y superficies privadas requieren sesión
  - APIs críticas validan profile/session ownership

### Logout
- Estado: **Activo**
- Evidencia: `src/components/auth/sign-out-button.tsx`
- Validación: E2E online confirma logout y protección post-logout.

## 2. Onboarding

### Perfil inicial del aprendiz
- Estado: **Activo**
- Evidencia: `src/app/(authenticated)/onboarding/page.tsx`, `src/components/onboarding/onboarding-form.tsx`, `src/app/api/profile/onboarding/route.ts`
- Alcance real:
  - selección de perfil profesional/empleo disponible según catálogo actual
  - áreas activas
  - meta activa
  - estilo de feedback

### Personalización avanzada
- Estado: **Diferido**
- Nota: no existe todavía motor profundo de rutas personalizadas por concurso/perfil.

## 3. Práctica

### Inicio de sesión de práctica
- Estado: **Activo**
- Evidencia: `src/components/practice/practice-session.tsx`, `src/app/api/session/start/route.ts`
- Alcance real:
  - crea sesión real backend
  - selecciona ítem inicial
  - respeta onboarding

### Selección de ítems
- Estado: **Activo con rotación controlada**
- Evidencia: `src/domain/item-selection/select-next-item.ts`
- Alcance real:
  - pool de candidatos
  - exclusión de ítems ya usados en sesión
  - exclusión preferente de ítems recientes
  - rotación determinística por usuario/sesión/contexto
  - fallback seguro

### Respuesta y avance de sesión
- Estado: **Activo**
- Evidencia: `src/app/api/session/advance/route.ts`, `advance_session_atomic`
- Alcance real:
  - selección de opción
  - justificación opcional
  - evaluación baseline heurística
  - persistencia de turno y evento
  - siguiente ítem o cierre

### Feedback por respuesta
- Estado: **Activo con guardrails**
- Alcance real:
  - feedback textual
  - `isCorrect`
  - `reasoningScore`
  - `competencyScore`
  - `hintLevel`
  - enlace al dashboard de sesión

### Refactor liviano de PracticeSession
- Estado: **Diferido / planificado**
- Evidencia: `docs/01-product/future-practice-session-light-refactor.md`
- Regla: no ejecutar sin E2E online disponible; no cambiar scoring, avance ni selección.

## 4. Dashboard y métricas

### Dashboard histórico acumulado
- Estado: **Activo con contrato de señal**
- Evidencia: `src/app/(authenticated)/dashboard/page.tsx`, `src/lib/dashboard/summary.ts`, `src/lib/dashboard/summary-metrics.ts`
- Alcance real:
  - precisión
  - intentos
  - razonamiento promedio
  - señal de nivel / nivel estimado según evidencia
  - tendencia solo cuando hay puntos comparables
  - percentil solo si hay dato y señal suficiente
  - fortalezas/refuerzos con umbral mínimo
  - desglose por tema/competencia

### Dashboard por sesión
- Estado: **Activo con contrato de señal**
- Evidencia: `dashboard?sessionId=...`
- Alcance real:
  - separa corrida actual vs histórico acumulado
  - aplica lectura prudente según muestra disponible

### Analytics avanzadas
- Estado: **Diferido**
- Nota:
  - no hay predicción de aprobación
  - no hay probabilidad de ganar
  - no hay comparación real con cohortes externas
  - no hay visualizaciones longitudinales complejas todavía

## 5. Tutor GCM

### Tutor visible dentro de práctica
- Estado: **Activo con guardrails**
- Evidencia: `src/components/tutor/tutor-interface.tsx`, `src/app/api/tutor/turn/route.ts`
- Alcance real:
  - usuario puede consultar dudas sobre la pregunta actual
  - backend deriva evidencia desde servidor
  - cliente solo envía `sessionId`, `itemId` y `message`
  - tutor niega autoridad sobre puntaje, avance o cierre

### Contrato de fuente de verdad v1
- Estado: **Activo con fuente sintetizada no verificada**
- Evidencia: `src/types/tutor-turn.ts`, `src/domain/tutor/contract.ts`, `src/lib/tutor/tutor-evidence-builder.ts`, `src/lib/tutor/normative-source-truth.ts`, `docs/01-product/source-truth/normative-source-truth-v1.md`
- Alcance real:
  - `ContestTruth`
  - `AspirationalProfileTruth`
  - `QuestionTruth`
  - `UserSessionTruth`
  - `TutorTurnResponse`
  - `TutorTurnTrace`
  - `SourceTruthStatus`
  - estado `synthesized_governed_unverified`
  - degradación cuando falta evidencia

### Sincronización post-respuesta
- Estado: **Activo**
- Alcance real:
  - antes de responder no revela clave
  - después de respuesta confirmada puede explicar clave, feedback y distractores
  - `canRevealCorrectAnswer` queda trazable

### Tutor LLM real
- Estado: **Diferido**
- Regla: no conectar LLM real antes de fuente normativa verificada suficiente, persistencia de trazas y QA negativa ampliada.

### Métricas del tutor
- Estado: **Preparado contractualmente, no persistido**
- Nota: falta tabla/escritura de `TutorTurnTrace`.

## 6. Editorial

### Biblioteca editorial web
- Estado: **Activo como solo lectura**
- Evidencia: `src/app/editorial/page.tsx`, `src/app/editorial/[slug]/page.tsx`, `src/app/editorial/download/[slug]/route.ts`
- Alcance real:
  - consulta de documentación canónica vigente
  - descarga de documentos
- Restricción: no es CMS editorial completo.

## 7. Banco de preguntas / contenido

### Corpus activo curado
- Estado: **Activo y gobernado**
- Evidencia: `content/items/**`, scripts de validación/importación, documentación de referencia del banco
- Alcance real:
  - corpus activo de 27 preguntas según documentación vigente
  - validación e importación controlada disponibles
  - estructura editorial primaria por `area`, `subarea` y `competency`
  - metadatos secundarios opcionales por perfil docente en Markdown (`targetRole`, `targetPosition`, `applicantProfile`, `tags`)

### Capa secundaria por perfiles docentes
- Estado: **Activa como convención editorial**
- Evidencia: `content/profiles/docente/**`, `docs/project/reference/estructura-hibrida-taxonomia-perfiles-docente.md`, `docs/project/reference/metadatos-secundarios-perfiles-docente.md`
- Alcance real:
  - organización operativa de lotes, mapas y cobertura por perfil
  - no reemplaza la carpeta canónica de ítems
  - no duplica ítems finales

### Operación editorial del banco
- Estado: **Diferido**
- Alcance fuera del sprint:
  - expansión masiva del corpus
  - workflows administrativos
  - revisión editorial multiusuario
  - adopción completa en runtime de la segunda capa por perfiles si se aprueba su valor operacional

## 8. QA, deploy y trazabilidad

### Build metadata visible
- Estado: **Activo**
- Evidencia: `/login`, `src/lib/build-info.ts`, `scripts/prepare-build-metadata.mjs`

### Baseline QA real
- Estado: **Activo, con oportunidad de consolidación**
- Evidencia: scripts npm y pruebas E2E ejecutadas por Antigravity
- Pendiente:
  - crear `npm test` como agregador estándar
  - CI mínimo en GitHub Actions

### Regla de triple verificación
- Estado: **Activo como norma operativa**
- Regla:
  - `~/.openclaw/product` = `/opt/gcm/app` = runtime visible en `/login`

## 9. Lo que NO debe presentarse como feature completa
- Tutor GCM con LLM real.
- Tutor GCM con fuente normativa oficial verificada.
- Admin de concursos/perfiles/fuentes.
- Predicción de aprobación o probabilidad de ganar.
- Comparación estadística real con otros usuarios.
- CMS editorial completo.
- Analítica avanzada longitudinal.
- Refactor de `PracticeSession` ejecutado.
- Multi-asistente visible.
- Segmentación rígida del banco por carpetas principales de cargo.

## 10. Prioridades derivadas
1. Persistir trazas de Tutor GCM para métricas pedagógicas.
2. Cargar fuentes normativas oficiales para pasar a `source_verified`.
3. Agregar `npm test` y CI mínimo.
4. Evolucionar TutorInterface hacia acciones pedagógicas guiadas.
5. Ejecutar refactor liviano de `PracticeSession` solo con E2E online.
6. Decidir si la segunda capa por perfil debe llegar a contratos activos de lectura en runtime.
