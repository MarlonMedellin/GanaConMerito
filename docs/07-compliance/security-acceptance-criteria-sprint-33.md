# Security Acceptance Criteria — Sprint 33

## Objetivo
Definir los criterios minimos de aceptacion AppSec para cerrar riesgos P0/P1 del Sprint 33 sin declarar seguridad completa ni cumplimiento total de produccion.

## Estado

- Sprint: 33
- Rol lider: PM-AppSec
- Estado: PROPOSED
- Semaforo: amarillo
- Runtime validado: no
- Alcance: auth callback, middleware privado, endpoints administrativos, rate limiting, logs y dependencias

## Principios

1. Seguridad por defecto.
2. Menor privilegio.
3. Validacion explicita de entradas.
4. Logs sanitizados.
5. Errores no revelan detalles internos.
6. Rutas privadas no dependen de una sola capa de control.
7. Todo hallazgo P0 debe tener fix, PR o aceptacion formal.

## Criterios P0

### P0-01 — Callback origin allowlist

**Riesgo:** origin poisoning o redirects no confiables en flujo de callback.

**Archivos esperados:**
- `src/app/api/auth/callback/route.ts`
- `.env.example`
- `docs/07-compliance/auth-callback-hardening-plan.md`

**Aceptacion funcional:**
- existe variable `AUTH_CALLBACK_ALLOWED_ORIGINS` o equivalente;
- el callback valida origen contra allowlist;
- origen desconocido se rechaza o se normaliza a origen canonico seguro;
- el flujo legitimo de login no queda roto;
- no se confia ciegamente en `x-forwarded-host` o `x-forwarded-proto`.

**Aceptacion de seguridad:**
- no se registra token, cookie ni secret en logs;
- errores de origen invalido usan codigo canonico;
- no se exponen detalles internos al usuario.

**Estado requerido para cerrar:** fixed o accepted-risk documentado.

### P0-02 — Middleware privado con enforcement real

**Riesgo:** rutas privadas pasan por middleware sin enforcement suficiente.

**Archivos esperados:**
- `src/middleware.ts`
- `docs/07-compliance/private-route-middleware-policy.md`

**Aceptacion funcional:**
- rutas privadas sin sesion redirigen a `/login` o son bloqueadas;
- rutas publicas siguen disponibles;
- assets y rutas tecnicas necesarias no se rompen;
- route-level checks se mantienen como defensa en profundidad.

**Aceptacion de seguridad:**
- no se permite acceso anonimo accidental a practica, dashboard o superficies administrativas;
- el middleware no revela informacion sensible sobre existencia de recursos.

**Estado requerido para cerrar:** fixed o accepted-risk documentado.

### P0-03 — Endpoint `content/validate` protegido

**Riesgo:** parsing/fuzzing o abuso de endpoint de validacion.

**Archivos esperados:**
- `src/app/api/content/validate/route.ts`
- `src/lib/api/error-codes.ts`
- `docs/03-architecture/rate-limiting-adr-001.md`

**Aceptacion funcional:**
- requiere usuario autorizado o rol definido;
- define limite de payload;
- retorna errores consistentes ante payload invalido;
- conserva utilidad para administradores/editorial autorizados.

**Aceptacion de seguridad:**
- rate limiting definido o implementado;
- payload excesivo no se procesa completamente;
- errores no devuelven stack traces.

**Estado requerido para cerrar:** fixed o accepted-risk documentado.

## Criterios P1

### P1-01 — Rate limiting P0

**Endpoints:**
- `POST /api/tutor/turn`
- `POST /api/session/advance`
- `POST /api/content/upload`
- `POST /api/content/validate`

**Aceptacion:**
- limites iniciales documentados;
- estrategia usuario/IP definida;
- respuesta de rate limit usa codigo canonico;
- bypass de CI/test queda controlado y no habilitado en produccion por defecto.

### P1-02 — Logs sanitizados

**Aceptacion:**
- no loggear cookies;
- no loggear tokens;
- no loggear service role keys;
- no loggear prompts completos sensibles;
- registrar `requestId` y metadata minima;
- errores inesperados tienen `errorId` o `requestId`.

### P1-03 — CORS cerrado por defecto

**Aceptacion:**
- origenes permitidos declarados por env;
- produccion no usa wildcard amplio;
- errores CORS no exponen detalles internos;
- cambios quedan documentados en `.env.example` si aplica.

### P1-04 — Dependency audit

**Aceptacion:**
- ejecutar audit en entorno con acceso a advisories;
- registrar resultado;
- clasificar vulnerabilidades explotables vs ruido;
- no aplicar upgrades masivos sin criterio.

## Criterios de evidencia

Para cerrar cada item se debe entregar:

- archivo tocado;
- razon del cambio;
- riesgo mitigado;
- pruebas ejecutadas o razon de no ejecucion;
- impacto esperado en runtime;
- riesgo residual.

## Definition of Done AppSec Sprint 33

El frente AppSec del Sprint 33 se considera cerrado si:

- P0-01 esta fixed o formally accepted;
- P0-02 esta fixed o formally accepted;
- P0-03 esta fixed o formally accepted;
- P1-01 tiene implementacion o ADR aceptado;
- P1-02 tiene politica e implementacion parcial minima;
- P1-03 esta definido;
- dependency audit queda ejecutado o explicitamente pendiente por entorno.

## No alcance

- certificacion formal de seguridad;
- pentest externo;
- cumplimiento legal completo;
- hardening de infraestructura fuera del repo;
- rotacion real de secretos desde este chat.

## Siguiente sprint pequeno

Sprint 33.09 — crear `docs/07-compliance/auth-callback-hardening-plan.md`.
