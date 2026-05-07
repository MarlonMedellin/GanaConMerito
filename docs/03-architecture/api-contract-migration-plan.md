# API Contract Migration Plan — Sprint 33

## Objetivo
Definir una ruta gradual, segura y reversible para migrar los endpoints del MVP hacia el contrato API v1 sin romper clientes existentes ni introducir cambios grandes no verificables.

## Estado

- Sprint: 33
- Estado: PROPOSED
- Tipo: plan de migracion backend/API
- Runtime validado: no
- Implementacion de endpoints: pendiente

## Insumos

- `docs/03-architecture/api-contract-standard-v1.md`
- `docs/03-architecture/api-endpoint-contract-map.md`
- `src/lib/api/contracts.ts`
- `src/lib/api/error-codes.ts`
- `src/lib/api/request-id.ts`
- `api/backend-reliability-audit.md`

## Principios de migracion

1. Migrar por endpoint, no por barrido masivo.
2. Mantener compatibilidad con el frontend existente.
3. Agregar `requestId` antes de cambiar shapes funcionales.
4. No exponer detalles internos en errores de produccion.
5. Priorizar rutas P0 y rutas con riesgo de seguridad/costo.
6. Dejar cada cambio en PR pequeno y verificable.
7. No declarar cierre sin pruebas y runtime posterior.

## Fase 0 — Preparacion compartida

Estado: iniciado.

### Archivos base
- `src/lib/api/contracts.ts`
- `src/lib/api/error-codes.ts`
- `src/lib/api/request-id.ts`

### Criterio de cierre
- Tipos base disponibles.
- Catalogo de errores disponible.
- Utilidad de requestId disponible.
- Ningun endpoint migrado todavia.

## Fase 1 — Boundaries sin romper payloads

Objetivo: incorporar trazabilidad y errores consistentes internamente sin cambiar de inmediato el shape externo exitoso.

### Acciones
- Capturar o generar `requestId` al inicio de cada handler.
- Propagar `requestId` a logs.
- Incluir `requestId` en errores cuando sea seguro.
- Encapsular `request.json()` y parsing de query params con try/catch.
- Convertir errores inesperados a `INTERNAL_UNEXPECTED`.

### Endpoints candidatos
1. `POST /api/session/advance`
2. `POST /api/tutor/turn`
3. `POST /api/content/validate`
4. `POST /api/content/upload`
5. `GET /api/session/item`

### Criterio de cierre
- No cambia respuesta exitosa principal.
- Errores tienen codigo y requestId.
- Logs no contienen secretos.

## Fase 2 — Endpoints P0

Objetivo: estabilizar rutas criticas de estado, costo y seguridad.

### 2.1 `/api/session/advance`

Riesgos:
- mutacion de estado critica;
- idempotencia/concurrencia;
- errores inconsistentes.

Acciones:
- agregar requestId;
- normalizar errores;
- documentar idempotency behavior;
- alinear con ADR de concurrencia;
- mantener contrato actual de exito hasta adaptar frontend.

### 2.2 `/api/tutor/turn`

Riesgos:
- costo operativo;
- guardrails;
- trazabilidad;
- rate limiting.

Acciones:
- agregar requestId;
- registrar `TUTOR_RATE_LIMITED` cuando aplique;
- proteger logs;
- mantener degradacion no fatal de trazas secundarias.

### 2.3 `/api/content/validate`

Riesgos:
- parsing/fuzzing;
- ausencia de auth/rate limit;
- payloads grandes.

Acciones:
- exigir auth/rol si aplica;
- limitar payload;
- agregar rate limiting;
- retornar `CONTENT_INVALID`, `CONTENT_PAYLOAD_TOO_LARGE` o `CONTENT_RATE_LIMITED`.

### 2.4 `/api/content/upload`

Riesgos:
- escritura administrativa;
- parsing atomico;
- respuesta inconsistente.

Acciones:
- preservar admin requirement;
- agregar requestId;
- normalizar errores;
- no cambiar persistencia atomica sin pruebas.

### 2.5 `/api/auth/callback`

Riesgos:
- confianza en origin derivado;
- redirects inseguros.

Acciones:
- aplicar allowlist;
- usar `AUTH_INVALID_CALLBACK_ORIGIN` internamente;
- no convertir a JSON si el flujo requiere redirect;
- log seguro con requestId.

## Fase 3 — Endpoints P1

Objetivo: completar consistencia en rutas importantes.

### Endpoints
- `POST /api/session/start`
- `GET /api/session/item`
- `GET /api/dashboard/summary`
- `GET/POST /api/profile/onboarding`
- `GET /api/auth/public-config`
- `GET /api/tutor/traces/summary`

### Acciones
- normalizar errores;
- documentar payloads;
- agregar requestId;
- revisar cache/no-store donde aplique;
- preservar compatibilidad con dashboard y practica.

## Fase 4 — Envelope completo

Objetivo: migrar respuestas exitosas hacia `ApiSuccess<T>` cuando frontend y tests esten listos.

### Reglas
- no mezclar migracion de shape con cambios de negocio;
- actualizar clientes en el mismo PR o en PR coordinado;
- mantener adapter temporal si hace falta;
- documentar breaking changes si existieran.

## Riesgos de migracion

| Riesgo | Mitigacion |
|---|---|
| Romper frontend por nuevo envelope | migracion por adapter y PR pequeno |
| Duplicar formatos de error temporalmente | definir fase y owner por endpoint |
| Exponer detalles internos en `details` | sanitizar antes de responder |
| Rate limit afectando QA | bypass controlado solo en entorno test |
| Auth callback tratado como JSON | mantener semantica redirect |

## Checklist por endpoint

Antes de marcar un endpoint como migrado:

- [ ] requestId capturado o generado.
- [ ] errores tienen codigo canonico.
- [ ] logs no exponen secrets/tokens/cookies.
- [ ] input validado de forma explicita.
- [ ] respuesta exitosa documentada.
- [ ] compatibilidad frontend validada.
- [ ] test o checklist manual definido.
- [ ] runtime pendiente o validado explicitamente.

## Secuencia recomendada de PRs

1. PR base: helpers compartidos ya creados.
2. PR session advance: errores/requestId sin cambiar exito.
3. PR tutor turn: requestId, logs y rate limit.
4. PR auth callback: allowlist.
5. PR content validate/upload: auth, payload limit y errores.
6. PR P1 endpoints: normalizacion gradual.
7. PR final: envelope completo donde ya haya cliente adaptado.

## Definition of Done Sprint 33.07

- plan gradual documentado;
- fases definidas;
- endpoints P0/P1 ordenados;
- riesgos de compatibilidad explicitos;
- checklist por endpoint creado;
- siguiente sprint tecnico identificado.

## Siguiente sprint pequeno

Sprint 33.08 — criterios de aceptacion de seguridad en `docs/07-compliance/security-acceptance-criteria-sprint-33.md`.
