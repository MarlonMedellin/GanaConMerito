# Agent Traceability Policy

Status: canonical
Owner: PM-Governance
Last reviewed: 2026-05-10
Related files:
- AGENTS.md
- docs/02-delivery/change-log.md
- docs/02-delivery/sprint-log.md
Update trigger:
- governance
- commits
- operational-logging

---

# Objetivo

Definir una base mínima de trazabilidad multiagente para GanaConMerito.

La meta no es auditoría perfecta todavía.
La meta inicial es:

- reducir ambigüedad;
- identificar autoría operativa;
- identificar entorno;
- identificar validaciones ejecutadas;
- reducir pérdida de contexto entre agentes.

---

# Problema actual

Actualmente existe trazabilidad parcial:

- algunos commits incluyen trailers;
- algunos PRs documentan runtime;
- algunos cierres documentales identifican agente;
- otros cambios no dejan evidencia suficiente.

Esto genera:

- drift operativo;
- imposibilidad de reconstruir decisiones;
- inconsistencias documentales;
- baja auditabilidad.

---

# Metadata mínima recomendada

Todo cambio relevante debería registrar:

| Campo | Obligatorio recomendado |
|---|---|
| Agent | Sí |
| Via | Sí |
| Contributor | Sí |
| Environment | Sí |
| Shell | Recomendado |
| Timezone | Recomendado |
| Validation | Sí |
| Runtime verified | Cuando aplique |

---

# Formato recomendado de commit

```text
feat(scope): summary

Agent: PM-Dev
Via: chatgpt
Contributor: Marlon Arcila
Environment: GitHub SaaS
Shell: bash
Timezone: UTC
Validation: npm run test
```

---

# Entornos reconocidos

| Entorno | Descripción |
|---|---|
| GitHub SaaS | Cambio realizado vía GitHub/API |
| WSL | Desarrollo desde Windows Subsystem for Linux |
| VPS | Trabajo operativo directo en servidor |
| Local Linux | Entorno Linux local |
| Local macOS | Entorno macOS local |

---

# Vías reconocidas

| Via | Significado |
|---|---|
| chatgpt | Coordinación desde ChatGPT |
| codex-owner | Codex autenticado como owner |
| codex-marlonmedellin | Codex contributor |
| antigravity | Flujo Google Antigravity |

---

# Regla de evidencia

No declarar:

- runtime verificado;
- release validado;
- QA aprobado;
- sprint cerrado;
- deploy sincronizado;

sin dejar evidencia mínima.

---

# Fases futuras

## Fase actual
- advisory
- no bloqueante

## Futuro posible
- hooks de commit
- PR templates obligatorios
- validación CI
- enforcement selectivo
- reportes automáticos de sesión
