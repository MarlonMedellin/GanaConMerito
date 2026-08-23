# Canary Readiness checkpoint — 2026-08-23

Base auditada: `master@7be92b655dee4965872963f1ca57d6eb96107599`.

## Gobierno vigente

- Arquitectura congelada: `perfil reusable → positionName oficial → OPEC concreta`.
- No se modifican migraciones, 248 reactivos V4, `MANIFEST.json`, taxonomía ni PR #97.
- `CAN-002` conserva el último checkpoint productivo conocido como evidencia histórica; debe revalidarse antes de fijar Candidate SHA.
- `CAN-003` es un **SECURITY verification gate / posible drift productivo**. El contrato versionado en `0020` y `0022` revoca acceso cliente a superficies con verdad; el gate consiste en comprobar que el entorno candidato conserva ese contrato.
- `CAN-004` permanece **MAJOR / CANARY-GATING** hasta demostrar reanudación sin pérdida ni duplicación sobre runtime canary.

## Cambios aislados en rama QA

La rama `qa/canary-readiness-20260822` añade exclusivamente runtime y QA:

- catálogo canary server-only que acepta únicamente OPEC `verified`;
- selección visible `perfil reusable → positionName → OPEC` sin datos ficticios;
- validación server-side de compatibilidad OPEC/perfil;
- selección de reactivos con prioridad OPEC concreta y fallback a contenido general;
- reanudación de la última sesión activa tras recarga;
- recuperación explícita ante autenticación expirada;
- `requestId`, latencia, status y error code en rutas core canary, sin registrar datos personales innecesarios.

## Gates pendientes antes de Candidate SHA

1. Typecheck, unit tests, build y content validation verdes.
2. Confirmar que los perfiles reusables canónicos existen en el entorno de datos; los perfiles legacy por disciplina no se consideran equivalentes.
3. Cargar al runtime canary únicamente OPEC reales y verificadas.
4. Revalidar el estado productivo de V4; no reutilizar cifras del checkpoint anterior como estado actual.
5. Verificar en el entorno candidato que `anon/authenticated` no leen superficies con clave o explicaciones pre-respuesta.
6. E2E de reanudación: responder, recargar, continuar y comprobar que no aparece nuevamente un reactivo persistido.
7. E2E crítico de 5 turnos, dashboard, Tutor y móvil sobre el mismo SHA candidato.

## Estado GO/NO-GO

`NO-GO` permanece vigente hasta cerrar los gates anteriores. La implementación en rama QA no equivale a validación local, canary ni producción.
