# Matriz de cumplimiento — PRD Beta Funcional Mínimo

Fecha de revisión: 2026-08-20  
Release base: `v0.6.0-beta.1`; corrección posterior de fallback en código `6926ca9`  
Runtime: `https://cnsc.profemarlon.com`

## Dictamen

**Beta técnica funcional:** PASS.  
**PRD completo al 100%:** PENDIENTE de validación humana y medición de adopción.

## Requisitos verificables

| Requisito | Estado | Evidencia |
|---|---|---|
| Compila, typecheck y tests críticos | PASS | `npm run build`, `npm run typecheck`, `npm run test:unit` |
| Autenticación y recorrido principal | PASS | QA smoke/API/UI y sesión autenticada real |
| Banco Beta mínimo | PASS | 100 items activos; `content:validate` sin errores |
| Respuesta, evaluación y feedback | PASS | API/UI E2E de 5 turnos; feedback editorial visible |
| Tutor contextual con guardrails | PASS | tests Tutor y prueba pública autenticada |
| Fallback cuando falla el Tutor | PASS técnico | fallo inyectado en Playwright; feedback editorial visible y “Siguiente pregunta” disponible |
| Resultados y recomendación | PASS | dashboard histórico/sesión y tests de dashboard |
| UX móvil | PASS | `/home`, `/practice`, `/dashboard` a 390x844 sin overflow |
| Seguridad crítica del recorrido | PASS | producción exige autenticación; no se expone service role |
| QA con perfiles A/B/C del PRD | PENDIENTE | falta ejecución manual o equivalente explícitamente registrada para los tres perfiles |
| Beta cerrada de 10–20 usuarios | PENDIENTE | no existe evidencia de cohortes reales ni respuestas de encuesta |
| Métrica principal de comprensión | PENDIENTE | no hay muestra humana suficiente para calcularla |

## Deuda no bloqueante

La metadata editorial rica de las 100 preguntas todavía tiene campos incompletos o legacy. El banco activo es funcional y validado, pero la deuda limita segmentación y calibración posteriores.

## Regla de cierre

No declarar el PRD completo hasta registrar la cohorte humana, los tres perfiles de QA y la métrica principal definida en las secciones 24–26 del PRD.
