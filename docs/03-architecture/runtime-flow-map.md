---
id: ARCH-RUNTIME-FLOW-MAP
name: runtime-flow-map
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: architecture
modules: [auth, onboarding, practice, dashboard, tutor, deploy]
tags: [runtime, flow, architecture, qa]
last_reviewed: 2026-05-06
---

# Runtime flow map — GanaConMerito

## Objetivo
Documentar el flujo real de runtime para que desarrollo, QA y agentes automaticos no dependan de suposiciones sobre el producto.

## Principio operativo
Un flujo solo se considera real cuando existe en codigo, esta conectado al backend y puede validarse en runtime. Las propuestas futuras se documentan aparte.

## 1. Login y sesion

```text
Usuario -> /login -> Google OAuth -> Supabase Auth -> /api/auth/callback -> perfil -> ruta autenticada
```

### Componentes
- `src/app/login/page.tsx`
- `src/components/auth/google-sign-in-button.tsx`
- `src/app/api/auth/callback/route.ts`
- `src/app/api/auth/public-config/route.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/guards.ts`

### Reglas
- El cliente no debe asumir que las variables publicas Supabase fueron embebidas en build.
- El fallback `/api/auth/public-config` puede entregar configuracion publica de Supabase en runtime.
- Las rutas privadas dependen de sesion y perfil autenticado.

## 2. Onboarding

```text
Sesion autenticada -> /onboarding -> learning_profile -> practica habilitada
```

### Componentes
- `src/app/(authenticated)/onboarding/page.tsx`
- `src/components/onboarding/onboarding-form.tsx`
- `src/app/api/profile/onboarding/route.ts`

### Reglas
- El perfil profesional/empleo seleccionado es la base de personalizacion inicial.
- La personalizacion avanzada por concurso/perfil sigue como deuda tecnica.

## 3. Inicio de practica

```text
/practice -> /api/session/start -> selectNextItem -> session + current item -> PracticeSession
```

### Componentes
- `src/components/practice/practice-session.tsx`
- `src/app/api/session/start/route.ts`
- `src/domain/item-selection/select-next-item.ts`

### Reglas
- El backend selecciona el item.
- La seleccion usa pool de candidatos, exclusion de recientes y rotacion deterministica.
- El frontend no decide dificultad, scoring ni siguiente item.

## 4. Respuesta y avance

```text
Usuario responde -> /api/session/advance -> advance_session_atomic -> evaluation_events -> next item o cierre
```

### Componentes
- `src/app/api/session/advance/route.ts`
- `src/domain/item-selection/select-next-item.ts`
- `session_turns`
- `evaluation_events`

### Reglas
- Se persiste opcion seleccionada y justificacion.
- El scoring oficial ocurre server-side.
- El Tutor GCM no modifica scoring, avance ni cierre.

## 5. Tutor GCM

```text
PracticeSession -> TutorInterface -> /api/tutor/turn -> requireOwnedSession -> buildTutorEvidence -> TutorOrchestrator -> respuesta gobernada
```

### Componentes
- `src/components/tutor/tutor-interface.tsx`
- `src/app/api/tutor/turn/route.ts`
- `src/lib/tutor/tutor-evidence-builder.ts`
- `src/lib/tutor/normative-source-truth.ts`
- `src/lib/tutor/tutor-orchestrator.ts`
- `src/domain/tutor/contract.ts`

### Reglas
- El cliente solo envia `sessionId`, `itemId` y `message`.
- La evidencia se deriva server-side.
- Antes de responder, el tutor no revela clave.
- Despues de respuesta confirmada, puede explicar clave, feedback y distractores.
- Si falta fuente normativa verificable, debe degradar o referirse solo a lo disponible.
- El flujo actual verifica contrato y guardrails del estado normativo, no la existencia de una carga oficial completa.

### Estado normativo documentado del flujo
- `contest`, `aspirationalProfile` y `question` se construyen con soporte tecnico real en repo.
- El estado cargado por defecto es `synthesized_governed_unverified`.
- Los identificadores `agreement-source-pending`, `methodological-guide-source-pending` y `test-structure-source-pending` implican ausencia de anexos oficiales suficientes en esta fuente.
- El runtime no debe presentarse como respaldo de `source_verified` mientras esos pendientes sigan abiertos.

## 6. Dashboard

```text
/dashboard -> buildDashboardSummary -> buildDashboardSummaryMetrics -> UI con nivel de senal
```

### Componentes
- `src/app/(authenticated)/dashboard/page.tsx`
- `src/lib/dashboard/summary.ts`
- `src/lib/dashboard/summary-metrics.ts`

### Reglas
- No vender probabilidad de aprobar.
- No presentar percentiles o tendencias sin evidencia suficiente.
- Mostrar datos con prudencia y nivel de senal.

## 7. Logout y proteccion post-logout

```text
SignOutButton -> Supabase signOut -> /login -> intento de ruta privada -> redirect login
```

### Reglas
- El logout debe limpiar estado de sesion.
- `/practice` y `/dashboard` deben redirigir si no hay sesion valida.

## 8. Deploy y runtime

```text
GitHub master -> ~/.openclaw/product -> /opt/gcm/app -> docker build -> /login commit/buildTime
```

### Regla de cierre
Un deploy solo se considera cerrado cuando coinciden:

```text
~/.openclaw/product = /opt/gcm/app = runtime visible en /login
```

## 9. QA minima por flujo

- Login anonimo redirige correctamente.
- Login autenticado mantiene sesion.
- Practice responde al menos 3 preguntas.
- Tutor no revela clave antes de responder.
- Tutor explica post-respuesta despues de evidencia server-side.
- Dashboard muestra metricas prudentes.
- Logout protege rutas privadas.
- Runtime muestra commit esperado.

## 10. Riesgos vivos

- Fuente normativa real todavia no esta cargada desde documentos oficiales completos.
- `TutorTurnTrace` aun no se persiste.
- `PracticeSession` concentra demasiada responsabilidad visual y de orquestacion cliente.
- Falta CI minimo obligatorio.
