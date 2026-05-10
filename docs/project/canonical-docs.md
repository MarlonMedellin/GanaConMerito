# Canonical Documentation Index

Status: canonical
Owner: PM-Governance
Last reviewed: 2026-05-10

Objetivo: declarar la jerarquía documental mínima para reducir drift operativo y evitar competencia entre fuentes ejecutivas.

| File | Status | Purpose | Update trigger | Related files | Recommended owner |
|---|---|---|---|---|---|
| `AGENTS.md` | canonical | Gobernanza operativa y reglas de trabajo para agentes. | Cambios de proceso, trazabilidad o disciplina operativa. | `docs/project/status.md`, `docs/05-ops/*`, `.github/pull_request_template.md` | PM-Governance |
| `docs/project/status.md` | canonical | Snapshot ejecutivo principal del estado real del proyecto. | Cambio de sprint activo, verificación runtime, drift crítico. | `docs/02-delivery/sprint-log.md`, `docs/02-delivery/change-log.md` | PM-Governance + Product Owner |
| `docs/02-delivery/governance-hardening-roadmap.md` | canonical | Roadmap por fases para endurecimiento de gobernanza. | Cambio de fase, criterios o checks de hardening. | `docs/05-ops/documentation-trigger-map.md`, `docs/05-ops/agent-traceability.md` | PM-Governance |
| `docs/02-delivery/sprint-log.md` | operational | Bitácora de sprints y evidencia resumida por bloque operativo. | Cierre/ajuste de sprint, nueva evidencia operacional. | `docs/project/status.md`, `docs/02-delivery/change-log.md` | Delivery Lead |
| `docs/02-delivery/change-log.md` | operational | Historial ejecutivo de cambios por fecha y tipo. | Cambio relevante de repo, governance, runtime o QA. | `docs/02-delivery/sprint-log.md`, `docs/project/status.md` | PM-Governance + Delivery Lead |
| `docs/05-ops/documentation-trigger-map.md` | canonical | Mapa de archivos que deben revisarse para prevenir drift. | Nuevo archivo crítico, cambio de severidad o flujo. | `scripts/check-doc-triggers.ts`, `docs/04-quality/quality-gates.md` | PM-Governance |
| `docs/05-ops/agent-traceability.md` | canonical | Política base de metadata y trazabilidad multiagente. | Ajustes de metadata obligatoria/recomendada. | `AGENTS.md`, `.github/pull_request_template.md` | PM-Governance |
| `docs/04-quality/quality-gates.md` | canonical | Baseline de quality gates y severidad warning/fallo. | Cambio de QA, CI, criterios de release. | `docs/05-ops/runtime-and-release.md`, `package.json` | QA Lead + PM-Governance |
| `docs/05-ops/runtime-and-release.md` | canonical | Regla mínima de evidencia para runtime y release. | Cambio de flujo deploy/runtime o criterios de evidencia. | `docs/project/status.md`, `docs/04-quality/quality-gates.md` | Ops Lead + PM-Governance |
| `docs/archive/README.md` | advisory | Política de archivo y trazabilidad de documentos históricos. | Nueva regla de archivado o estructura de archive. | `docs/archive/legacy-candidates.md`, `docs/project/canonical-docs.md` | PM-Governance |
| `.github/pull_request_template.md` | template | Plantilla operativa para PR con evidencia y drift explícito. | Ajustes de auditoría, governance o trazabilidad requerida. | `AGENTS.md`, `docs/05-ops/agent-traceability.md` | PM-Governance |
| `scripts/check-doc-triggers.ts` | operational | Check advisory para detectar alineación documental requerida. | Nuevos triggers, cambios de mapa o reglas CI. | `docs/05-ops/documentation-trigger-map.md`, `.github/workflows/pr-checks.yml` | DevEx / PM-Governance |
