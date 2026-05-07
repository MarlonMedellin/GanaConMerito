# API Contract Standard v1

## Objetivo
Reducir inconsistencias entre endpoints y mejorar observabilidad, resiliencia y QA.

## Problemas detectados
- respuestas heterogeneas
- errores sin tipificacion consistente
- logging no correlacionable
- validacion fragmentada
- falta de request tracing

## Envelope oficial

### Success
```ts
export type ApiSuccess<T> = {
  ok: true;
  data: T;
  meta?: {
    requestId?: string;
    timestamp?: string;
    version?: string;
  };
};
```

### Error
```ts
export type ApiError = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    requestId?: string;
    timestamp?: string;
    version?: string;
  };
};
```

## Convenciones

### RequestId
Cada request debe:
- generar `requestId`
- propagarse en logs
- propagarse en errores
- incluirse en respuestas

### Error codes
Formato:
```text
DOMAIN_REASON
```

Ejemplos:
- AUTH_UNAUTHORIZED
- SESSION_NOT_FOUND
- TUTOR_RATE_LIMITED
- CONTENT_INVALID
- INTERNAL_UNEXPECTED

## Politica de logging

### Permitido
- requestId
- sessionId parcial
- itemId
- duracion
- estado

### Prohibido
- prompts completos sensibles
- secrets
- service role keys
- tokens
- cookies

## Politica de validacion

Toda entrada debe:
- validarse con zod
- rechazarse temprano
- devolver estructura ApiError

## Politica de rate limiting

### Prioridad P0
- /api/tutor/turn
- /api/practice/advance
- /api/content/validate
- /api/content/upload

### Estrategia sugerida
- sliding window
- per-user
- per-IP fallback

## Politica de resiliencia

### No bloquear UX
Procesos secundarios:
- telemetry
- tutor traces
- analytics

pueden degradar sin romper respuesta principal.

## Objetivo Sprint 33
Dejar preparada la migracion gradual hacia contratos consistentes sin romper endpoints actuales.
