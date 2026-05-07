# MVP SLO/SLI Policy — Sprint 33

## Objetivo
Definir SLO/SLI minimos para el MVP de GanaConMerito, de modo que el equipo pueda evaluar disponibilidad, latencia, errores y confiabilidad funcional sin confundir metricas de negocio con salud operativa.

## Estado

- Sprint: 33.17
- Rol lider: PM-DevOps
- Estado: PROPOSED
- Runtime validado: no
- Implementacion de metricas: pendiente
- Alcance: login, practica, tutor, dashboard, API critica y release readiness

## Definiciones

### SLI
Indicador medible de nivel de servicio.

Ejemplos:
- porcentaje de respuestas exitosas;
- latencia p95;
- tasa de errores;
- disponibilidad de ruta critica.

### SLO
Objetivo esperado para un SLI durante una ventana de tiempo.

Ejemplo:
- `p95 /api/session/advance < 1500 ms durante 95% de ventanas de 1 hora`.

### Error budget
Margen aceptado de incumplimiento antes de pausar expansion o activar estabilizacion.

## Principios

1. Medir primero rutas criticas del MVP.
2. Separar salud operativa de metricas de aprendizaje/producto.
3. No declarar SLO sin instrumentacion suficiente.
4. Empezar con umbrales prudentes y revisarlos con datos reales.
5. Activar freeze si se agota el error budget P0.
6. No esconder `degraded`; documentarlo.

## Servicios MVP cubiertos

| Servicio | Tipo | Criticidad |
|---|---|---|
| Login/Auth | acceso | P0 |
| Practice | core learning loop | P0 |
| Session Advance | mutacion critica | P0 |
| Tutor GCM | apoyo pedagogico gobernado | P1 |
| Dashboard | retroalimentacion y confianza | P1 |
| Content/Admin | carga editorial | P1/P2 |
| Healthcheck | operacion/release | P0 |

## SLIs minimos

### 1. Availability SLI

**Definicion:** porcentaje de requests exitosos sobre requests totales para rutas criticas.

Formula:

```text
availability = successful_requests / total_requests
```

Rutas P0:
- `/login`
- `/api/auth/public-config`
- `/practice`
- `/api/session/start`
- `/api/session/advance`
- `/api/health` cuando exista

### 2. Error Rate SLI

**Definicion:** porcentaje de respuestas 5xx o errores internos inesperados.

Formula:

```text
error_rate = internal_error_requests / total_requests
```

Errores esperados de validacion 4xx no cuentan como falla SLO si son correctos y consistentes.

### 3. Latency SLI

**Definicion:** latencia p95 por endpoint critico.

Endpoints iniciales:
- `/api/session/start`
- `/api/session/advance`
- `/api/tutor/turn`
- `/api/dashboard/summary`
- `/api/health`

### 4. Auth Success SLI

**Definicion:** porcentaje de callbacks/login completados sin error de flujo.

Formula:

```text
auth_success_rate = successful_auth_flows / total_auth_flows
```

Errores por origen invalido deben medirse aparte como seguridad, no como simple falla funcional.

### 5. Practice Readiness SLI

**Definicion:** porcentaje de sesiones donde una pregunta activa puede cargarse y responderse sin error interno.

Formula:

```text
practice_readiness = successful_practice_sessions / attempted_practice_sessions
```

### 6. Tutor Degradation SLI

**Definicion:** porcentaje de turnos del Tutor GCM que degradan por falta de evidencia, guardrail o error no fatal.

Formula:

```text
tutor_degradation_rate = degraded_tutor_turns / total_tutor_turns
```

La degradacion honesta no es necesariamente falla; se interpreta con contexto.

### 7. Dashboard Contract SLI

**Definicion:** porcentaje de respuestas dashboard que cumplen contrato prudente sin errores internos.

Formula:

```text
dashboard_contract_success = valid_dashboard_responses / dashboard_requests
```

## SLOs iniciales propuestos

| Servicio | SLI | SLO inicial | Ventana | Criticidad |
|---|---|---:|---|---|
| Login/Auth | availability | >= 99% | 7 dias | P0 |
| Public config | availability | >= 99% | 7 dias | P0 |
| Practice page | availability | >= 99% | 7 dias | P0 |
| Session start | p95 latency | < 1500 ms | 24 h | P0 |
| Session advance | p95 latency | < 2000 ms | 24 h | P0 |
| Session advance | error rate | < 1% | 24 h | P0 |
| Tutor turn | p95 latency | < 5000 ms | 24 h | P1 |
| Tutor turn | internal error rate | < 2% | 24 h | P1 |
| Dashboard summary | p95 latency | < 2500 ms | 24 h | P1 |
| Healthcheck | availability | >= 99.5% | 7 dias | P0 |

## Alertas iniciales

### P0 alerts

Activar alerta o rollback review si:

- `/api/health` responde `down` o 503;
- `/practice` anonima queda expuesta sin login;
- `/dashboard` anonima queda expuesta sin login;
- `session_advance_error_rate > 2%` por 15 minutos;
- `session_advance_p95 > 4000 ms` por 15 minutos;
- login falla de forma sostenida por 10 minutos.

### P1 alerts

Activar investigacion si:

- `tutor_turn_p95 > 8000 ms` por 15 minutos;
- `tutor_degradation_rate > 10%` sin causa conocida;
- `dashboard_summary_p95 > 5000 ms` por 15 minutos;
- no ingresan eventos esperados por 10 minutos durante trafico real.

## Error budget operativo

### Regla P0
Si un SLO P0 se incumple dos veces en una semana:

- pausar expansion funcional;
- priorizar fix o rollback;
- documentar causa;
- no cerrar Sprint 33 como estable.

### Regla P1
Si un SLO P1 se incumple de forma recurrente:

- abrir issue de estabilizacion;
- revisar UX y expectativas;
- decidir si queda accepted-risk o fix programado.

## Relacion con metricas de producto

Estas metricas no sustituyen analitica de producto:

- activacion;
- completion;
- retencion;
- tutor assist rate;
- answer submission rate.

Pero si los SLOs P0 fallan, las metricas de producto dejan de ser confiables.

## Instrumentacion requerida

Para adoptar esta politica se requiere:

- `requestId` en logs y responses criticas;
- timestamps por request;
- status code;
- endpoint name;
- latencyMs;
- error code canonico;
- user/session id solo si esta sanitizado o parcialmente enmascarado;
- eventos de degradacion del tutor.

## Seguridad y privacidad

No registrar:

- cookies;
- tokens;
- service role keys;
- prompts completos sensibles;
- datos personales innecesarios;
- respuestas completas de usuarios si no son necesarias para metrica.

## Reporte recomendado

Crear dashboard minimo con:

- disponibilidad P0;
- latencia p95 por endpoint;
- error rate por endpoint;
- tutor degradation rate;
- healthcheck status;
- ultimo commit/runtime observado;
- ultimo deploy time.

## Criterios de aceptacion Sprint 33.17

- servicios MVP cubiertos;
- SLIs definidos;
- SLOs iniciales propuestos;
- alertas P0/P1 definidas;
- error budget operacional definido;
- instrumentacion requerida documentada;
- no se declara cumplimiento hasta tener datos runtime.

## Siguiente sprint pequeno

Sprint 33.18 — convertir rollback en runbook manual en `docs/05-ops/manual-rollback-runbook.md`.
