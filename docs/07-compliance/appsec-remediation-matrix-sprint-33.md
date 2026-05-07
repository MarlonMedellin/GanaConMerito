# AppSec Remediation Matrix — Sprint 33

## Objetivo
Convertir los hallazgos de seguridad del control MVP en acciones priorizadas, sin depender del entorno runtime.

## Semaforo general
Amarillo.

## Riesgos P0

### 1. Callback origin trust
Riesgo:
- construccion de origen con headers reenviados no confiables.

Impacto:
- posible manipulacion de redirect/callback si proxy o headers quedan mal configurados.

Remediacion:
- usar origen canonico desde variable de entorno.
- validar contra `AUTH_CALLBACK_ALLOWED_ORIGINS`.
- rechazar origenes desconocidos.

Criterio de cierre:
- callback solo acepta origenes allowlisted.

### 2. Middleware permisivo
Riesgo:
- rutas privadas incluidas en matcher pero sin enforcement real.

Impacto:
- proteccion dependiente de checks downstream.

Remediacion:
- validar sesion o token en middleware.
- redirigir a `/login` si no hay sesion.
- mantener checks server-side como defensa en profundidad.

Criterio de cierre:
- rutas privadas no pasan sin sesion valida.

## Riesgos P1

### 3. Endpoint content validate sin proteccion suficiente
Riesgo:
- abuso de parsing o fuzzing.

Remediacion:
- exigir auth y rol autorizado.
- agregar rate limiting.
- limitar payload.

### 4. Logging sensible
Riesgo:
- errores crudos pueden filtrar contexto sensible.

Remediacion:
- sanitizar error objects.
- registrar errorId y requestId.
- evitar tokens, cookies y secrets.

### 5. CORS sin politica cerrada
Riesgo:
- crecimiento accidental de superficies cross-origin.

Remediacion:
- usar `CORS_ALLOWED_ORIGINS`.
- default cerrado en produccion.

## Riesgos P2

### 6. Dependency audit incompleto
Riesgo:
- auditoria bloqueada por advisory endpoint.

Remediacion:
- ejecutar audit en entorno con acceso.
- registrar salida.
- abrir fixes solo para CVE relevantes.

## Orden recomendado Sprint 33
1. Callback origin allowlist.
2. Middleware private enforcement.
3. Content validate auth + payload limit.
4. Rate limiting P0.
5. Logging sanitization.
6. Dependency audit.

## Criterio de cierre AppSec Sprint 33
- Riesgos P0 corregidos.
- Riesgos P1 documentados con PRs o issues.
- Riesgos P2 aceptados o programados.
