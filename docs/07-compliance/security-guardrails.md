---
id: COMP-SECURITY-GUARDRAILS
name: security-guardrails
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: ops
modules: [auth, data, platform]
tags: [seguridad, guardrails, cumplimiento]
related:
  - GOV-HUMAN-APPROVAL
last_reviewed: 2026-04-23
---

# Security guardrails

## Reglas base
- Ningún secreto en markdown, prompts, logs o fixtures públicos.
- Ningún PAT de GitHub debe guardarse en el repositorio, en `.git/config`, en remotes, en prompts o en salidas pegadas en documentación.
- Para autenticación GitHub, seguir `docs/05-ops/github-authentication-runbook.md`: Fine-grained PAT limitado al repo, permisos mínimos y helper protegido.
- Cambios en auth, permisos, middleware o acceso a datos requieren aprobación humana.
- Toda duda sobre exposición de credenciales se trata como incidente.
- No se asumen controles heredados sin evidencia verificable.

## Zonas sensibles
- `supabase/`
- variables de entorno
- credenciales GitHub, PATs y credential helpers
- auth y middleware
- políticas de acceso a datos

## Respuesta mínima ante riesgo
1. detener cambio
2. documentar hallazgo
3. escalar a humano
4. registrar deuda o issue si aplica
