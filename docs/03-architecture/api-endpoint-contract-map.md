# API Endpoint Contract Map — Sprint 33

## Objetivo
Inventariar las rutas API conocidas del MVP, su contrato esperado, su nivel de riesgo y su prioridad de migracion hacia el estandar `ApiSuccess<T>` / `ApiError` definido para Sprint 33.

## Fuentes usadas
- `docs/api/contracts.md`
- `api/backend-reliability-audit.md`
- salidas del control MVP Sprint 04 Backend/API
- documentos Sprint 33 de contratos y backlog

## Estado general

- Estado del mapa: repo-only / sin validacion runtime
- Rutas reales esperadas: `src/app/api/**`
- Estado backend previo: `blocked` por alcance operativo anterior
- Objetivo Sprint 33: desbloquear migracion gradual sin romper el frontend

## Convencion de riesgo

| Riesgo | Significado |
|---|---|
| P0 | Ruta critica para seguridad, sesion, estado o costo operativo |
| P1 | Ruta importante para estabilidad, UX o observabilidad |
| P2 | Ruta relevante pero no bloqueante para estabilizacion inmediata |

## Mapa de endpoints

| Endpoint | Metodo | Dominio | Criticidad | Contrato actual observado/documentado | Contrato objetivo Sprint 33 | Accion recomendada |
|---|---|---|---|---|---|---|
| `/api/session/start` | POST | Session | P1 | retorna campos directos de sesion e item | `ApiSuccess<SessionStartData>` / `ApiError` | migrar despues de `advance` |
| `/api/session/advance` | POST | Session | P0 | retorna estado, evaluacion, feedback y next item | `ApiSuccess<SessionAdvanceData>` / `ApiError` + idempotencia | priorizar boundary, requestId e invariant |
| `/api/session/item` | GET | Session | P1 | query params manuales y payload de item | `ApiSuccess<SessionItemData>` / `ApiError` | centralizar validacion de searchParams |
| `/api/tutor/turn` | POST | Tutor | P0 | flujo LLM/orquestador con warnings no fatales | `ApiSuccess<TutorTurnData>` / `ApiError` + rate limit | priorizar rate limit, requestId y logging sanitizado |
| `/api/tutor/traces/summary` | GET | Tutor/Analytics | P1 | agregacion paginada y resumen de trazas | `ApiSuccess<TutorTraceSummaryData>` / `ApiError` | limitar costo y revisar agregacion |
| `/api/content/validate` | POST | Content/Admin | P0 | `{ ok, errors, warnings, parsed? }` | `ApiSuccess<ContentValidationData>` / `ApiError` + auth/rate limit | proteger endpoint antes de expansion |
| `/api/content/upload` | POST | Content/Admin | P0 | `{ ok, itemId?, version?, errors[] }` | `ApiSuccess<ContentUploadData>` / `ApiError` + admin auth | mantener admin, agregar requestId/rate limit |
| `/api/profile/onboarding` | POST/GET | Profile | P1 | onboarding profile validation | `ApiSuccess<OnboardingData>` / `ApiError` | documentar estados y errores |
| `/api/dashboard/summary` | GET | Dashboard | P1 | payload historico/currentSession | `ApiSuccess<DashboardSummaryData>` / `ApiError` | mantener compatibilidad con contrato prudente |
| `/api/auth/public-config` | GET | Auth | P1 | expone config publica Supabase | `ApiSuccess<AuthPublicConfigData>` / `ApiError` | cache no-store y no ampliar campos |
| `/api/auth/callback` | GET | Auth | P0 | callback con origen derivado | redirect controlado + errores seguros | aplicar allowlist de origen |

## Tipos objetivo sugeridos

### SessionStartData
```ts
type SessionStartData = {
  sessionId: string;
  currentState: string;
  mode: string;
  currentItemId?: string;
  hintLevel: number;
  activeArea?: string;
  activeCompetency?: string;
};
```

### SessionAdvanceData
```ts
type SessionAdvanceData = {
  sessionId: string;
  previousState: string;
  currentState: string;
  evaluation: unknown;
  feedbackText?: string;
  hintLevel: number;
  nextItemId?: string;
  shouldTransition: boolean;
};
```

### SessionItemData
```ts
type SessionItemData = {
  itemId: string;
  stem: string;
  options: Array<{
    key: string;
    text: string;
  }>;
  metadata?: Record<string, unknown>;
};
```

### TutorTurnData
```ts
type TutorTurnData = {
  answer: string;
  mode: string;
  intent?: string;
  canRevealCorrectAnswer: boolean;
  sourceTruthStatus?: string;
  warnings?: string[];
};
```

### TutorTraceSummaryData
```ts
type TutorTraceSummaryData = {
  totalTurns: number;
  degradedTurns: number;
  topIntents: Array<{ intent: string; count: number }>;
  topGuardrails: Array<{ guardrail: string; count: number }>;
  recentTurns: unknown[];
};
```

### ContentValidationData
```ts
type ContentValidationData = {
  errors: string[];
  warnings: string[];
  parsed?: unknown;
};
```

### ContentUploadData
```ts
type ContentUploadData = {
  itemId?: string;
  version?: string;
  warnings?: string[];
};
```

### DashboardSummaryData
```ts
type DashboardSummaryData = {
  historical: unknown;
  currentSession: unknown | null;
};
```

### AuthPublicConfigData
```ts
type AuthPublicConfigData = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};
```

## Migracion gradual recomendada

### Fase 1 — libreria compartida
Crear:
- `src/lib/api/contracts.ts`
- `src/lib/api/error-codes.ts`
- `src/lib/api/request-id.ts`

No migrar endpoints aun.

### Fase 2 — endpoints P0
Migrar o envolver gradualmente:
1. `/api/session/advance`
2. `/api/tutor/turn`
3. `/api/content/validate`
4. `/api/content/upload`
5. `/api/auth/callback`

### Fase 3 — endpoints P1
Migrar:
1. `/api/session/start`
2. `/api/session/item`
3. `/api/dashboard/summary`
4. `/api/profile/onboarding`
5. `/api/auth/public-config`
6. `/api/tutor/traces/summary`

## Riesgos de compatibilidad

- El frontend puede esperar respuestas directas sin envelope.
- Algunos endpoints ya usan `{ ok: true/false }`; migrar sin adaptador puede romper cliente.
- Auth callback no necesariamente responde JSON; debe tratarse como flujo redirect y no como API JSON pura.
- `content/validate` y `content/upload` ya usan una forma de `ok/errors`; deben migrarse con cuidado.

## Reglas de migracion

1. No cambiar payload externo sin actualizar cliente/test.
2. Si hay riesgo de ruptura, introducir helpers internos primero.
3. Agregar `requestId` sin alterar datos funcionales.
4. Mantener errores UX-friendly.
5. No exponer detalles internos en `details` para produccion.
6. Documentar cada endpoint migrado con antes/despues.

## Definition of Done Sprint 33.03

- endpoints criticos inventariados;
- prioridad P0/P1 asignada;
- contrato objetivo documentado;
- secuencia de migracion propuesta;
- riesgos de compatibilidad explicitados;
- no se declara validacion runtime.

## Siguiente sprint pequeno

Sprint 33.04 — preparar `src/lib/api/contracts.ts` con tipos base compartidos.
