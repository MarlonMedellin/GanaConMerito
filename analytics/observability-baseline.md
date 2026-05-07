# Observability Baseline (MVP)

## Product events
- activation_started / activation_completed
- practice_session_started
- practice_question_presented
- practice_answer_submitted / practice_answer_evaluated
- tutor_turn_requested / tutor_turn_completed / tutor_turn_degraded
- error_captured
- latency_captured

## Funnel tracking
1. activation_started
2. activation_completed
3. practice_session_started
4. practice_answer_submitted
5. practice_answer_evaluated (terminal)

## Required payload dimensions
- userId, sessionId, traceId, route
- topic, competency, itemId
- latencyMs, status, errorCode

## Operational alerts
- degraded tutor rate > 5% (15m)
- p95 tutor turn latency > 4000ms (15m)
- evaluation error rate > 2% (15m)
- activation completion drop > 20% WoW
- zero events ingested for >10m (pipeline outage)

## Structured logging policy
- JSON logs only (one event per line)
- Include correlation keys: requestId, traceId, sessionId, userId
- Never log secrets or full PII
- Emit warn/error with serialized exception stack
