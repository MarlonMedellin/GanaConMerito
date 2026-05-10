Status: advisory
Replaced by: docs/project/status.md
Canonical reference: docs/project/status.md; docs/02-delivery/governance-hardening-roadmap.md
Do not use for: definir estado ejecutivo actual o roadmap canónico
Last reviewed: 2026-05-10

## Legacy authority context
- Este documento ya NO es fuente ejecutiva; es plan histórico de remediación.
- Consultar `status.md` y roadmap para prioridad vigente.
- Mantiene valor histórico sobre frentes de deuda identificados.
---

# Plan de remediación ejecutable

## Estado
Plan base de remediación ejecutable.

Nota importante:
Este documento describe el orden lógico/histórico de la remediación.
No debe leerse como tablero vivo del estado actual de cada frente.

Para estado vigente y remediaciones ya absorbidas, usar además:
- `docs/project/status.md`
- `docs/project/remediation/r1-security-auth.md`
- `docs/project/remediation/r2-sessions.md`
- `docs/project/remediation/r3-db-content.md`
- `docs/project/remediation/r4-runtime-product.md`
- `docs/project/remediation/ra1-session-security.md`
- `docs/project/remediation/ra2-flow-contracts.md`
- `docs/project/remediation/ra3-honesty-traceability.md`

## Orden exacto

### Fase R1 — Seguridad/Auth crítica
1. Proteger `/api/content/upload` con auth + verificación de admin.
2. Corregir callback auth para evitar sesión válida + perfil inconsistente.
3. Corregir `bootstrapUserProfile` para recuperación real de estados parciales.
4. Revisar y ajustar middleware SSR/cookies según patrón oficial de Supabase.

### Fase R2 — Núcleo de sesiones
5. Refactorizar `session/start` para calcular estado inicial real desde DB.
6. Refactorizar `session/advance` para usar estado real e historial real.
7. Evitar loops del selector de ítems excluyendo historial completo de la sesión.
8. Actualizar `user_topic_stats` y snapshots básicos.

### Fase R3 — DB y contenido
9. Añadir `updated_at` + triggers a tablas operativas.
10. Endurecer dominio de `target_role` y `exam_type`.
11. Diseñar/implementar atomicidad para persistencia de contenido.
12. Definir identidad canónica del contenido.

### Fase R4 — Robustez de API y producto
13. Añadir validación runtime a endpoints críticos.
14. Ejecutar pruebas E2E reales de login y ciclo base.
15. Construir frontend mínimo real de onboarding/práctica/dashboard.

## Método de ejecución
- Paralelización dentro de cada fase cuando no haya dependencia directa.
- No se cierra una fase sin revisión del supervisor.
- Cada bloque debe actualizar documentación, commit, tag y push.
