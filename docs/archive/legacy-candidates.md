# Legacy Documentation Candidates Matrix

Status: operational
Owner: PM-Governance
Last reviewed: 2026-05-10
Related files:
- docs/project/status.md
- docs/project/canonical-docs.md
- docs/05-ops/drift-resolution-policy.md
Update trigger:
- governance
- documentation
- drift

Objetivo: inventariar documentos candidatos a reducción/archivo sin mover ni borrar archivos en esta fase.

| File | Current role | Risk if treated as canonical | Suggested future status | Replacement / canonical reference | Action | Priority | Severity | Canonical conflict level | Migration urgency | Archive readiness | Historical preservation importance | Runtime confusion risk |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `docs/02-delivery/sprint-33-post-merge-checklist.md` | Checklist histórico Sprint 33 | Alto riesgo de competir con estado Sprint 43 en `status.md`. | superseded | `docs/project/status.md`, `docs/02-delivery/sprint-log.md` | Etiquetar como histórico y preparar traslado controlado a `docs/archive/`. | High | High | High | High | candidate | high | high |
| `docs/02-delivery/sprint-33-repo-only-closeout.md` | Cierre parcial repo-only Sprint 33 | Puede inducir falso cierre operacional general. | superseded | `docs/project/status.md`, `docs/05-ops/runtime-and-release.md` | Marcar limitación explícita y candidatear a archive. | High | High | High | High | candidate | high | high |
| `docs/02-delivery/sprint-33-stabilization-plan.md` | Plan de estabilización puntual | Compite con roadmap vigente de hardening y backlog actual. | advisory | `docs/02-delivery/governance-hardening-roadmap.md`, `docs/01-product/backlog.md` | Conservar como referencia histórica, no fuente activa. | Medium | Medium | Medium | Medium | candidate | high | high |
| `docs/06-governance/sprint-33-execution-board.md` | Tablero histórico Sprint 33 | Duplicidad de seguimiento operativo fuera de `sprint-log.md`. | superseded | `docs/02-delivery/sprint-log.md` | Clasificar como legacy operativo. | High | High | High | High | candidate | high | high |
| `docs/01-product/sprint-33-remediation-backlog.md` | Backlog de remediación de sprint histórico | Puede desalinear prioridades actuales si se lee como backlog vigente. | advisory | `docs/01-product/backlog.md`, `docs/project/status.md` | Marcar “historic-only” en futura fase. | Medium | Medium | Medium | Medium | candidate | high | high |
| `docs/project/remediation/plan.md` y `docs/project/remediation/*.md` | Planes de remediation por frente | Multiplica fuentes “plan maestro” y puede competir con status/roadmap. | advisory | `docs/project/status.md`, `docs/02-delivery/governance-hardening-roadmap.md` | Consolidar referencias cruzadas antes de archivar selectivo. | High | High | High | Medium | candidate | high | high |
| `docs/04-quality/qa-semantica-run-2026-04-28.md` (y runs 2026-04-29/27) | Evidencia QA histórica por corrida | Riesgo de tomarse como gate vigente sin contexto temporal. | archived | `docs/04-quality/quality-gates.md`, `docs/04-quality/sprint-31-43-runtime-regression-report.md` | Mantener evidencia, agregar etiqueta temporal en fase siguiente. | Medium | Medium | Medium | Medium | candidate | high | high |
| `docs/04-quality/qa-regression-notes.md` | Notas QA acumulativas | Ambigüedad frente a quality gates y reportes más recientes. | advisory | `docs/04-quality/quality-gates.md` | Revisar vigencia y recortar solapamiento. | Medium | Medium | Medium | Medium | candidate | high | high |
| `docs/04-quality/idempotency-gate-remediation-plan.md` | Plan técnico de remediación QA | Puede confundirse con política de gates vigente. | advisory | `docs/04-quality/quality-gates.md` | Mantener como plan táctico, no canon. | Low | Low | Low | Low | candidate | high | high |
| `docs/project/runtime-maturity-assessment.md` + runbook asociado | Evaluación de madurez runtime | Compite con baseline runtime/release si no se contextualiza. | advisory | `docs/05-ops/runtime-and-release.md`, `docs/project/status.md` | Declarar explícitamente carácter diagnóstico. | High | High | High | Medium | candidate | high | high |
| `docs/03-architecture/runtime-flow-map.md` | Mapa técnico runtime | Puede ser interpretado como política operativa. | advisory | `docs/05-ops/runtime-and-release.md` | Mantener como soporte técnico, no norma. | Medium | Medium | Medium | Low | candidate | high | high |
| `docs/technical-debt/sprint-33-actionable-debt-matrix.md` | Deuda técnica histórica sprint 33 | Compite con estado ejecutivo/deuda actual. | superseded | `docs/project/status.md`, `docs/technical-debt/strategic-technical-debt-register-2026-05-07.md` | Integrar pendientes vigentes y clasificar resto como histórico. | Medium | Medium | Medium | Medium | candidate | high | high |
| `docs/07-compliance/appsec-remediation-matrix-sprint-33.md` + `security-acceptance-criteria-sprint-33.md` | Evidencia/compliance histórica sprint 33 | Riesgo de interpretar controles viejos como baseline vigente. | advisory | `docs/04-quality/quality-gates.md`, `docs/project/status.md` | Revisar vigencia normativa en fase de reducción. | Medium | Medium | Medium | Medium | candidate | high | high |

## Known documentation debt recorded

- Falta clasificar el total de documentos legacy fuera de los grupos críticos iniciales.
- Falta aplicar headers de estado en lotes legacy fuera de este alcance.
- Aún no se ejecuta movimiento a `docs/archive/` (fuera de alcance de esta tarea).
