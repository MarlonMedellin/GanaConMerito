# Trace Retention Policy — Sprint 33

## Objetivo
Definir una politica minima de retencion, crecimiento, archivo y limpieza para trazas, eventos y registros de practica del MVP, reduciendo riesgo de bloat, costos, exposicion de datos y degradacion de consultas.

## Estado

- Sprint: 33.20
- Rol lider: PM-Data
- Estado: PROPOSED
- Runtime validado: no
- Implementacion DB: pendiente
- Alcance: `session_turns`, `evaluation_events`, `tutor_turn_traces`, logs analiticos y eventos futuros

## Hallazgo base

La auditoria de base de datos identifico crecimiento no acotado en tablas de alta escritura:

- `session_turns`;
- `evaluation_events`;
- `tutor_turn_traces`;
- futuras tablas de eventos/telemetria.

Tambien identifico riesgo de columnas JSON/text-heavy que pueden aumentar I/O y bloat si no existe politica de retencion.

## Principios

1. Retener lo necesario para aprendizaje, auditoria y mejora del producto.
2. Minimizar datos sensibles y payloads extensos.
3. Separar datos operativos calientes de historicos frios.
4. Evitar borrar datos necesarios para trazabilidad pedagogica o soporte.
5. Archivar antes de borrar cuando haya valor analitico.
6. Documentar cualquier limpieza destructiva.
7. No ejecutar purgas manuales sin backup o aprobacion explicita.

## Clasificacion de datos

| Categoria | Ejemplos | Sensibilidad | Uso principal |
|---|---|---|---|
| Operativo caliente | sesion activa, ultimo turno, feedback reciente | media | UX y continuidad |
| Analitico agregado | conteos, tasas, latencias, niveles de senal | baja/media | dashboard y producto |
| Trazas pedagogicas | tutor turns, guardrails, intent, source status | media | mejora Tutor GCM |
| Respuestas usuario | seleccion, rationale, confidence | media/alta | evaluacion y feedback |
| Logs tecnicos | requestId, latency, error codes | baja/media | debugging |
| Payloads extensos | prompts, respuestas completas, stack traces | alta | solo diagnostico limitado |

## Politica por tabla o dominio

### `session_turns`

Uso:
- continuidad de practica;
- historial de intentos;
- dashboard y metricas.

Retencion propuesta:
- caliente: 90 dias;
- analitica agregada: 12 meses;
- archivo frio: segun decision de producto/compliance.

Accion recomendada:
- mantener registros necesarios para dashboard;
- agregar indices por `session_id`, `profile_id` si aplica, `created_at` y `turn_number`;
- evitar borrar turnos sin preservar agregados.

### `evaluation_events`

Uso:
- evaluacion;
- feedback;
- metricas historicas;
- auditoria de aprendizaje.

Retencion propuesta:
- caliente: 180 dias;
- agregados: 12 a 24 meses;
- archivo frio: opcional.

Accion recomendada:
- definir agregados antes de purgar;
- conservar trazabilidad minima por usuario/sesion si hay uso pedagogico.

### `tutor_turn_traces`

Uso:
- guardrails;
- degradacion;
- mejora de Tutor GCM;
- observabilidad pedagogica.

Retencion propuesta:
- caliente: 30 dias;
- diagnostico extendido: 90 dias;
- agregados anonimizados: 12 meses.

Accion recomendada:
- no guardar prompts completos sensibles por defecto;
- preferir intent, mode, guardrail, sourceTruthStatus, latency y error code;
- truncar texto largo;
- anonimizar o excluir datos personales.

### Logs tecnicos

Uso:
- debugging;
- incident response;
- SLO/SI.

Retencion propuesta:
- hot logs: 7 a 30 dias;
- incident artifacts: hasta cierre de incidente;
- agregados: 12 meses.

Accion recomendada:
- nunca registrar secrets, cookies, tokens, service role key;
- usar `requestId` como correlacion principal.

## Politica de minimizacion

### Permitido
- `requestId`;
- `sessionId` parcial o interno;
- `profileId` si es necesario y protegido;
- `itemId`;
- `intent`;
- `mode`;
- `sourceTruthStatus`;
- `latencyMs`;
- `errorCode`;
- flags de guardrail.

### Evitar o truncar
- rationale completo;
- prompts completos;
- respuesta completa del tutor;
- stack traces;
- headers completos;
- full URL con parametros sensibles.

### Prohibido
- cookies;
- access tokens;
- refresh tokens;
- service role keys;
- connection strings;
- secretos `.env`.

## Estrategia de agregacion

Antes de purgar datos detallados, crear o preservar agregados:

- total turns;
- correct/incorrect count;
- average reasoning score;
- tutor degradation rate;
- guardrail trigger count;
- p95 latency;
- error rate por endpoint;
- activity by day/week.

## Estrategia de archivo

Opciones aceptables:

1. tabla historica con datos minimizados;
2. export seguro a storage privado;
3. agregados anonimizados;
4. snapshot antes de limpieza destructiva.

No usar archivos publicos para trazas crudas.

## Particionamiento futuro

Evaluar particionamiento por fecha para tablas de crecimiento alto:

- `tutor_turn_traces`;
- `evaluation_events`;
- tabla futura de analytics events.

Criterios para activar particionamiento:

- consultas empiezan a degradarse;
- autovacuum insuficiente;
- tabla supera umbral definido de filas o tamano;
- dashboard depende de agregaciones lentas.

## Indices recomendados a evaluar

### `session_turns`

```sql
create index if not exists idx_session_turns_session_turn_desc
on session_turns (session_id, turn_number desc);
```

### `evaluation_events`

```sql
create index if not exists idx_evaluation_events_session_created
on evaluation_events (session_id, created_at desc);
```

### `tutor_turn_traces`

```sql
create index if not exists idx_tutor_turn_traces_session_created
on tutor_turn_traces (session_id, created_at desc);
```

```sql
create index if not exists idx_tutor_turn_traces_created
on tutor_turn_traces (created_at desc);
```

Estos indices son propuestas; requieren validacion real antes de aplicarse.

## Politica de limpieza

### Limpieza manual
Solo permitida si:
- existe backup o snapshot;
- hay query revisada;
- hay criterio de seleccion claro;
- hay aprobacion humana para datos productivos;
- se documenta resultado.

### Limpieza automatizada
Debe:
- ejecutarse por job controlado;
- registrar conteo de filas afectadas;
- ser idempotente;
- evitar locks largos;
- tener limite por batch.

## Ejemplo de job futuro

```sql
-- Ejemplo conceptual; no ejecutar sin validacion.
delete from tutor_turn_traces
where created_at < now() - interval '90 days'
limit 1000;
```

Nota: PostgreSQL no soporta `limit` directo en `delete` estandar de esa forma; usar CTE batch si se implementa.

## Relacion con privacidad

Toda retencion debe considerar:

- finalidad pedagogica;
- minimizacion;
- acceso restringido;
- trazabilidad;
- derecho de eliminacion si aplica;
- no exposicion en logs publicos.

## Politica para incidentes

Si una traza contiene dato sensible por accidente:

1. marcar incidente;
2. identificar alcance;
3. purgar o rotar segun corresponda;
4. evitar copiar el contenido sensible en issues/docs;
5. registrar solo hash, requestId o referencia segura.

## Checklist pre-implementacion

Antes de crear migracion o job de retencion:

- [ ] tabla objetivo identificada;
- [ ] columnas sensibles revisadas;
- [ ] periodo de retencion definido;
- [ ] agregados preservados;
- [ ] estrategia de backup definida;
- [ ] impacto de indices evaluado;
- [ ] batch size definido si borra filas;
- [ ] rollback/recovery documentado;
- [ ] QA/postdeploy plan definido.

## Remediaciones Sprint 33

### TR-P1-01 — No guardar prompts completos por defecto
- Revisar trazas del Tutor GCM.
- Confirmar que se guardan metadatos y no contenido sensible innecesario.

### TR-P1-02 — Indices de consulta reciente
- Evaluar indices por `session_id` y `created_at`.

### TR-P1-03 — Agregados antes de purga
- Definir metricas agregadas necesarias para dashboard y observabilidad.

### TR-P2-01 — Archivo frio
- Definir si se necesita historico mas alla de 12 meses.

## Definition of Done Sprint 33.20

- politica de retencion creada;
- dominios de datos clasificados;
- retenciones iniciales propuestas;
- minimizacion y prohibiciones documentadas;
- estrategia de agregacion/archivo definida;
- indices candidatos documentados;
- no se ejecutan purgas ni migraciones desde esta tarea repo-only.

## Siguiente sprint pequeno

Sprint 33.21 — plan de remediacion de migracion `0008` en `docs/03-architecture/migration-0008-remediation-plan.md`.
