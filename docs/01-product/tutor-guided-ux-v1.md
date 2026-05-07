# Tutor GCM — UX guiada v1 (Sprint 16)

## Objetivo
Mejorar la experiencia del Tutor GCM con acciones pedagógicas visibles y rápidas, manteniendo el flujo actual del backend y sin convertir el tutor en chat libre dominante.

## Alcance implementado
- Se mantiene el panel del tutor visible por defecto.
- Se mantiene la opción de minimizar y reabrir.
- Se conserva el textarea libre para consultas abiertas del estudiante.
- Se conserva el botón **Consultar Tutor**.
- Se agregan acciones guiadas visibles como chips/botones:
  - Dame una pista
  - Explícame el enunciado
  - Compara opciones sin revelar
  - Analiza mi justificación
  - Explícame el feedback
  - Recomiéndame qué practicar
- Al pulsar una acción guiada, se envía el prompt pedagógico directamente al flujo actual del tutor (sin cambiar contrato de API).

## Compatibilidad y restricciones
- No se modifica backend (`/api/tutor/turn`) ni orquestador.
- No se mueve scoring, session advance ni verdad de progreso al tutor.
- No se incorpora lógica que revele clave desde frontend antes de responder.

## Data-testid preservados
- `tutor-gcm-panel`
- `tutor-gcm-form`
- `tutor-gcm-message`
- `tutor-gcm-submit`
- `tutor-gcm-open-button`

## Riesgo abierto
- Algunas respuestas más ricas para acciones como "Analiza mi justificación" o "Explícame el feedback" pueden depender de contexto adicional del backend/orquestador. En esta versión se mantiene compatibilidad enviando prompts guiados sobre el contrato actual.
