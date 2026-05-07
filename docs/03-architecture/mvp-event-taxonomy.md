# MVP Event Taxonomy — Sprint 33

## Objetivo
Consolidar una taxonomia minima de eventos accionables para medir activacion, practica, Tutor GCM, errores, degradacion y salud operacional del MVP sin crear analitica inflada ni recolectar datos sensibles innecesarios.

## Estado

- Sprint: 33.23
- Rol lider: PM-Observability
- Estado: PROPOSED
- Runtime validado: no
- Implementacion de eventos: pendiente
- Alcance: contrato de eventos MVP, naming, payload minimo, privacidad y criterios de instrumentacion

## Principios

1. Medir comportamiento accionable, no curiosidad.
2. Separar eventos de producto de logs tecnicos.
3. No guardar secretos, tokens, cookies ni service role keys.
4. No capturar prompts completos ni respuestas completas del usuario por defecto.
5. Usar `requestId` para correlacion tecnica.
6. Usar `sessionId`, `itemId` y `profileId` solo si son necesarios y seguros.
7. Preferir valores discretos y enumerados sobre texto libre.
8. Todo evento debe tener dueño, proposito y uso esperado.

## Convencion de nombres

Formato:

```text
<domain>.<action>
```

Ejemplos:

```text
auth.login_started
practice.session_started
practice.answer_submitted
tutor.turn_requested
tutor.guardrail_triggered
dashboard.summary_viewed
system.error_captured
```

## Metadata comun

Todo evento debe poder incluir:

```ts
type EventMeta = {
  eventName: string;
  eventVersion: "v1";
  timestamp: string;
  requestId?: string;
  sessionId?: string;
  profileId?: string;
  environment?: "local" | "preview" | "production";
  appVersion?: string;
  commitSha?: string;
};
```

## Campos prohibidos

No incluir en eventos:

- cookies;
- access tokens;
- refresh tokens;
- service role keys;
- connection strings;
- headers completos;
- full URL con query sensible;
- prompts completos;
- respuesta completa del tutor;
- rationale completo del usuario salvo decision explicita;
- datos personales innecesarios.

## Dominios de eventos

| Dominio | Proposito | Criticidad |
|---|---|---|
| `auth` | medir acceso y fallas de login | P0 |
| `practice` | medir core loop de practica | P0 |
| `session` | medir transiciones de estado | P0 |
| `tutor` | medir uso, guardrails y degradacion | P1 |
| `dashboard` | medir consumo de retroalimentacion | P1 |
| `content` | medir validacion/carga editorial | P1/P2 |
| `system` | medir errores, health y performance | P0/P1 |

## Eventos P0

### `auth.login_started`

**Cuando:** usuario inicia flujo de login.  
**Uso:** medir intentos de acceso.  
**Payload minimo:**

```ts
{
  provider: "google";
  nextPath?: string;
}
```

### `auth.login_completed`

**Cuando:** callback completa sesion y perfil bootstrap.  
**Uso:** medir exito de acceso.  
**Payload minimo:**

```ts
{
  provider: "google";
  result: "success";
}
```

### `auth.login_failed`

**Cuando:** login/callback falla.  
**Uso:** detectar problemas de auth.  
**Payload minimo:**

```ts
{
  provider: "google";
  errorCode: string;
  phase: "callback" | "profile_bootstrap" | "session_exchange" | "origin_validation";
}
```

### `practice.session_started`

**Cuando:** se crea o reanuda una sesion de practica.  
**Uso:** medir activacion.  
**Payload minimo:**

```ts
{
  sessionId: string;
  mode: string;
  area?: string;
  competency?: string;
  itemId?: string;
  resumed: boolean;
}
```

### `practice.item_viewed`

**Cuando:** una pregunta activa queda visible.  
**Uso:** medir disponibilidad del core loop.  
**Payload minimo:**

```ts
{
  sessionId: string;
  itemId: string;
  turnNumber?: number;
}
```

### `practice.answer_submitted`

**Cuando:** usuario envia respuesta.  
**Uso:** medir engagement y completion del core loop.  
**Payload minimo:**

```ts
{
  sessionId: string;
  itemId: string;
  selectedOption: "A" | "B" | "C" | "D";
  responseTimeMs?: number;
  confidenceSelfReport?: number;
}
```

No incluir rationale completo por defecto.

### `session.advance_completed`

**Cuando:** backend completa transicion de avance.  
**Uso:** medir confiabilidad de estado.  
**Payload minimo:**

```ts
{
  sessionId: string;
  itemId: string;
  previousState: string;
  currentState: string;
  nextItemId?: string;
  shouldTransition: boolean;
}
```

### `session.advance_failed`

**Cuando:** falla avance de sesion.  
**Uso:** alerta P0.  
**Payload minimo:**

```ts
{
  sessionId?: string;
  itemId?: string;
  errorCode: string;
  retryable?: boolean;
}
```

## Eventos P1

### `tutor.turn_requested`

**Cuando:** usuario solicita ayuda al Tutor GCM.  
**Uso:** medir uso del tutor.  
**Payload minimo:**

```ts
{
  sessionId: string;
  itemId?: string;
  mode: string;
  intent?: string;
  canRevealCorrectAnswer: boolean;
}
```

### `tutor.turn_completed`

**Cuando:** tutor responde o degrada de forma controlada.  
**Uso:** medir calidad operacional del tutor.  
**Payload minimo:**

```ts
{
  sessionId: string;
  itemId?: string;
  mode: string;
  intent?: string;
  sourceTruthStatus?: string;
  degraded: boolean;
  latencyMs?: number;
}
```

### `tutor.guardrail_triggered`

**Cuando:** un guardrail impide revelar clave, scoring o accion no autorizada.  
**Uso:** medir seguridad pedagogica.  
**Payload minimo:**

```ts
{
  sessionId: string;
  itemId?: string;
  guardrail: string;
  intent?: string;
  canRevealCorrectAnswer: boolean;
}
```

### `tutor.turn_failed`

**Cuando:** tutor falla por dependencia o error inesperado.  
**Uso:** alerta P1.  
**Payload minimo:**

```ts
{
  sessionId?: string;
  itemId?: string;
  errorCode: string;
  degraded: boolean;
}
```

### `dashboard.summary_viewed`

**Cuando:** usuario ve dashboard/resumen.  
**Uso:** medir consumo de feedback.  
**Payload minimo:**

```ts
{
  sessionId?: string;
  signalLevel?: "no_signal" | "low_signal" | "emerging_signal" | "usable_signal";
  hasCurrentSession: boolean;
}
```

### `dashboard.summary_failed`

**Cuando:** dashboard falla.  
**Uso:** detectar ruptura de feedback.  
**Payload minimo:**

```ts
{
  sessionId?: string;
  errorCode: string;
}
```

### `content.validation_completed`

**Cuando:** validacion de markdown termina.  
**Uso:** medir calidad editorial/admin.  
**Payload minimo:**

```ts
{
  errorsCount: number;
  warningsCount: number;
  valid: boolean;
}
```

### `content.upload_completed`

**Cuando:** carga editorial se completa.  
**Uso:** auditoria editorial.  
**Payload minimo:**

```ts
{
  itemId?: string;
  version?: string;
  warningsCount?: number;
}
```

## Eventos de sistema

### `system.error_captured`

**Cuando:** se captura error inesperado.  
**Uso:** debugging y SLO.  
**Payload minimo:**

```ts
{
  endpoint?: string;
  errorCode: string;
  statusCode?: number;
  retryable?: boolean;
}
```

### `system.latency_captured`

**Cuando:** se mide latencia de endpoint u operacion.  
**Uso:** SLI/SLO.  
**Payload minimo:**

```ts
{
  endpoint: string;
  operation?: string;
  latencyMs: number;
  statusCode?: number;
}
```

### `system.rate_limited`

**Cuando:** rate limiting bloquea solicitud.  
**Uso:** seguridad y capacidad.  
**Payload minimo:**

```ts
{
  endpoint: string;
  limitKeyType: "user" | "ip" | "global";
  errorCode: string;
}
```

### `system.healthcheck_completed`

**Cuando:** healthcheck semantico termina.  
**Uso:** release readiness.  
**Payload minimo:**

```ts
{
  status: "ok" | "degraded" | "down" | "unknown";
  failedChecks?: string[];
  degradedChecks?: string[];
}
```

## Metricas derivadas

### Activacion

```text
activationRate = practice.session_started / auth.login_completed
```

### Submission rate

```text
answerSubmissionRate = practice.answer_submitted / practice.item_viewed
```

### Completion proxy

```text
sessionAdvanceSuccessRate = session.advance_completed / (session.advance_completed + session.advance_failed)
```

### Tutor assist rate

```text
tutorAssistRate = tutor.turn_requested / practice.item_viewed
```

### Tutor degradation rate

```text
tutorDegradationRate = tutor.turn_completed[degraded=true] / tutor.turn_completed
```

### Evaluation error rate

```text
evaluationErrorRate = session.advance_failed / practice.answer_submitted
```

### Dashboard usage rate

```text
dashboardUsageRate = dashboard.summary_viewed / practice.session_started
```

## Reglas de versionado

Cada evento debe incluir `eventVersion`.

Cambios compatibles:
- agregar campos opcionales;
- ampliar enum documentado con fallback;
- mejorar descripcion.

Cambios incompatibles:
- renombrar evento;
- eliminar campo requerido;
- cambiar significado de campo;
- cambiar tipo de dato.

Para cambios incompatibles:
- crear `v2`;
- mantener lectura de `v1` durante transicion;
- documentar fecha de deprecacion.

## Politica de privacidad

### Minimizar
No enviar texto libre si basta con enum, conteo o flag.

### Truncar
Si un preview es necesario, limitarlo y no usarlo como metrica primaria.

### Separar
Los logs tecnicos y eventos de producto no deben mezclar datos sensibles.

### Redactar
Cualquier payload con riesgo debe pasar por sanitizacion previa.

## Prioridad de instrumentacion Sprint 33

### P0
- `auth.login_failed`
- `practice.session_started`
- `practice.item_viewed`
- `practice.answer_submitted`
- `session.advance_completed`
- `session.advance_failed`
- `system.error_captured`
- `system.latency_captured`

### P1
- `tutor.turn_requested`
- `tutor.turn_completed`
- `tutor.guardrail_triggered`
- `dashboard.summary_viewed`
- `system.rate_limited`
- `system.healthcheck_completed`

### P2
- `content.validation_completed`
- `content.upload_completed`
- eventos editoriales avanzados;
- eventos de UX detallada.

## Checklist antes de agregar evento

- [ ] el evento responde una pregunta accionable;
- [ ] el nombre sigue `<domain>.<action>`;
- [ ] tiene `eventVersion`;
- [ ] no incluye secretos;
- [ ] no incluye texto libre innecesario;
- [ ] define campos requeridos y opcionales;
- [ ] tiene metrica derivada o uso esperado;
- [ ] queda documentado en esta taxonomia.

## Definition of Done Sprint 33.23

- taxonomia de eventos MVP creada;
- eventos P0/P1 definidos;
- payloads minimos documentados;
- metricas derivadas definidas;
- privacidad y versionado documentados;
- implementacion queda pendiente para sprint tecnico posterior.

## Siguiente sprint pequeno

Sprint 33.24 — matriz de deuda tecnica accionable en `docs/technical-debt/sprint-33-actionable-debt-matrix.md`.
