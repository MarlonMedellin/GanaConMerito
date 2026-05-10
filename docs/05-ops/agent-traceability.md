# Agent Traceability Policy

Status: canonical
Owner: PM-Governance
Last reviewed: 2026-05-10

## Objetivo

Definir una base mínima de trazabilidad multiagente para GanaConMerito.

La meta inicial es:
- reducir ambigüedad;
- identificar autoría operativa;
- identificar entorno;
- registrar validaciones ejecutadas.

## Metadata recomendada

| Campo | Recomendación |
|---|---|
| Agent | Obligatorio |
| Via | Obligatorio |
| Contributor | Obligatorio |
| Environment | Obligatorio |
| Validation | Obligatorio |
| Runtime verified | Cuando aplique |
| Shell | Recomendado |
| Timezone | Recomendado |

## Formato recomendado

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

## Entornos reconocidos

| Entorno | Descripción |
|---|---|
| GitHub SaaS | Cambios vía GitHub/API |
| WSL | Windows Subsystem for Linux |
| VPS | Trabajo directo en servidor |
| Local Linux | Linux local |
| Local macOS | macOS local |

## Vías reconocidas

| Via | Significado |
|---|---|
| chatgpt | Coordinación desde ChatGPT |
| codex-owner | Codex autenticado como owner |
| codex-marlonmedellin | Codex contributor |
| antigravity | Flujo Google Antigravity |

## Estado actual

- advisory;
- no bloqueante;
- sin enforcement automático.

## Evolución futura

- hooks de commit;
- templates obligatorios;
- validación CI;
- enforcement selectivo.
