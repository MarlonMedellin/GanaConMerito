# QA Smoke vs Forensic Policy

## Objetivo
Separar pruebas obligatorias de release de pruebas diagnosticas profundas para reducir flakiness, falsos positivos y tiempos innecesarios en CI.

## Clasificacion de pruebas

### Smoke tests
Pruebas cortas, deterministicas y obligatorias para PR/release.

Deben validar:
- login responde
- rutas privadas redirigen sin sesion
- practica carga para usuario autenticado
- existe pregunta activa
- existen opciones de respuesta
- no hay errores 5xx criticos

No deben depender de:
- screenshots como unica evidencia
- comparacion de todo el texto de la pagina
- timeouts fijos largos
- datos variables de produccion

### Forensic tests
Pruebas diagnosticas profundas, utiles para investigacion y auditoria.

Pueden incluir:
- screenshots
- network logs
- trazas completas
- comparaciones amplias de texto
- reportes JSON extensos
- inspeccion de comportamiento historico

No deben bloquear cada PR salvo decision explicita.

## Gates recomendados

### Gate A — PR obligatorio
- Auth smoke
- Practice smoke
- Build/typecheck
- Test unitario critico

### Gate B — Release obligatorio
- E2E principal autenticado
- idempotencia con senal estable
- cierre de sesion terminal
- dashboard smoke

### Gate C — Nightly/forensic
- suite completa con screenshots
- trazas de red
- reportes de flakiness
- diagnosticos de session API

## Regla de selectors
Toda asercion critica debe usar senales estables:
- `data-testid`
- `questionId`
- payload API
- estado semantico persistido

Evitar:
- `main.innerText` como contrato principal
- copy completo de pantalla
- selectores por clases puramente visuales
- sleeps fijos como criterio de exito

## Criterio de cierre Sprint 33
El gate de idempotencia debe dejar de comparar texto completo de `main` y pasar a comparar una senal estable de pregunta activa.
