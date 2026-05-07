# ADR-002 — Session Advance Concurrency

## Estado
Propuesto para Sprint 33.

## Contexto
La auditoria de datos identifico riesgo de concurrencia en el avance de sesion, especialmente cuando el siguiente `turn_number` se deriva de patrones tipo `max(turn_number) + 1`.

En escenarios de doble click, retries de red, tabs multiples o ejecuciones concurrentes, el sistema puede crear turnos duplicados, saltos de estado o inconsistencias en la progresion.

## Decision
La progresion de sesion debe tratarse como una transicion atomica con control de concurrencia por `sessionId`.

## Reglas de negocio
- Una sesion solo puede tener un avance activo a la vez.
- El `turn_number` debe ser monotono y unico por sesion.
- Reintentos deben ser idempotentes cuando representen la misma intencion de avance.
- El cierre terminal de sesion debe ser irreversible salvo tarea administrativa explicita.

## Estrategias aceptables

### Opcion A — Lock transaccional por sesion
Usar bloqueo transaccional sobre la fila de sesion antes de calcular y persistir el siguiente turno.

Ventajas:
- simple conceptualmente
- fuerte consistencia

Riesgos:
- puede aumentar lock contention si hay alto trafico

### Opcion B — Counter persistido en sesion
Mantener `current_turn_number` o `next_turn_number` en la sesion y actualizarlo atomicamente.

Ventajas:
- evita escaneo de turnos
- facilita razonamiento

Riesgos:
- requiere migracion y backfill seguro

### Opcion C — Idempotency key
Cada mutacion critica recibe una clave de idempotencia.

Ventajas:
- robusta frente a retries
- util para clientes y QA

Riesgos:
- requiere tabla o storage de idempotency records

## Recomendacion Sprint 33
Aplicar una solucion gradual:

1. Documentar contrato de idempotencia.
2. Agregar test de concurrencia/logica en QA cuando haya entorno.
3. Preparar migracion segura si se adopta counter persistido.
4. Evitar nuevas features que dependan de avance de sesion hasta cerrar este riesgo.

## Invariantes
- `(session_id, turn_number)` debe ser unico.
- no debe existir mas de un turno activo ambiguo.
- el cliente no decide el siguiente `turn_number`.
- el servidor decide avance, cierre y estado terminal.

## Criterio de aceptacion
- decision tecnica aprobada
- migracion o funcion atomica alineada
- prueba de doble avance o retry definida
- documentacion de QA actualizada
