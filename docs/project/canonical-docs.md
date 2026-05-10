# Canonical Documentation Index

Status: canonical
Owner: PM-Governance
Last reviewed: 2026-05-10
Related files:
- AGENTS.md
- docs/project/status.md
- docs/05-ops/drift-resolution-policy.md
Update trigger:
- governance
- documentation
- drift

Objetivo: declarar jerarquía documental, autoridad y resolución de conflictos para reducir drift sin enforcement bloqueante.

| File | Status | Authority priority | Canonical scope | Purpose | When to consult | When NOT to consult | Legacy interaction notes | Update trigger | Related files | Conflict resolution | Archive relationship | Historical dependency | Operational authority level | Recommended owner |
|---|---|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| `AGENTS.md` | canonical | 1 | Gobernanza operativa transversal del repo | Reglas operativas para agentes IA. | Cambios de disciplina operativa o trazabilidad. | `docs/project/status.md`, `docs/05-ops/*` | Si contradice otros docs operativos, prevalece AGENTS en proceso de trabajo. | PM-Governance |
| `docs/project/status.md` | canonical | 2 | Estado ejecutivo principal | Snapshot ejecutivo del estado real del proyecto. | Cambio de sprint activo, runtime reportado, drift crítico. | `docs/02-delivery/sprint-log.md`, `docs/02-delivery/change-log.md` | Ante contradicción de estado, `status.md` gana como fuente ejecutiva principal. | PM-Governance + Product Owner |
| `docs/02-delivery/governance-hardening-roadmap.md` | canonical | 3 | Estrategia de transición | Fases y criterios del hardening incremental. | Cambio de fase o criterios de salida. | `docs/05-ops/documentation-trigger-map.md`, `docs/05-ops/drift-resolution-policy.md` | Si hay conflicto estratégico, roadmap prevalece sobre planes legacy. | PM-Governance |
| `docs/02-delivery/sprint-log.md` | operational | 4 | Historia delivery | Bitácora histórica de sprints y bloque operativo. | Consultar para evidencia cronológica de entregas y contexto de cierre. | No usar como única fuente para estado ejecutivo vigente. | Puede referenciar legacy; si compite con status, prevalece status. | Cierre/ajuste de sprint. | `docs/project/status.md`, `docs/02-delivery/change-log.md` | Si difiere de `status.md`, se alinea `sprint-log` y se registra drift. | Delivery Lead |
| `docs/02-delivery/change-log.md` | operational | 5 | Historial operacional | Registro ejecutivo por fecha/tipo de cambios. | Consultar para trazabilidad de decisiones y lotes de cambio. | No usar para determinar por sí solo estado de runtime vigente. | Debe anotar drift conocido cuando haya diferencias con docs legacy. | Cambio relevante de repo, governance, runtime o QA. | `docs/02-delivery/sprint-log.md`, `docs/project/status.md` | Si difiere de `status.md`, se corrige `change-log` o se registra limitación explícita. | PM-Governance + Delivery Lead |
| `docs/05-ops/documentation-trigger-map.md` | canonical | 6 | Mapa advisory de sincronización | Indicar qué revisar para evitar drift silencioso. | Nuevos triggers o severidad. | `scripts/check-doc-triggers.ts`, `docs/05-ops/drift-resolution-policy.md` | Si hay conflicto de cobertura, prevalece el mapa actualizado por PM-Governance. | PM-Governance |
| `docs/05-ops/drift-resolution-policy.md` | canonical | 7 | Política de resolución de contradicciones | Definir manejo mínimo de drift y deuda técnica. | Nuevos tipos de contradicción o criterios de severidad. | `docs/project/status.md`, `docs/05-ops/documentation-trigger-map.md` | Prevalece para clasificar contradicciones y decidir corrección inmediata vs deuda. | PM-Governance |
| `docs/05-ops/agent-traceability.md` | canonical | 8 | Trazabilidad multiagente | Política base de metadata y autoría operativa. | Ajustes de metadata requerida/recomendada. | `AGENTS.md`, `.github/pull_request_template.md` | Si hay conflicto de formato, se aplica esta política y AGENTS. | PM-Governance |
| `docs/04-quality/quality-gates.md` | canonical | 9 | QA/governance maturity baseline | Criterios ejecutivos de gates y madurez de gobernanza. | Consultar para interpretar calidad mínima y estado de madurez governance. | No usar reportes QA históricos como reemplazo de este baseline. | QA históricos son evidencia auxiliar, no política vigente. | Cambios en QA/CI o madurez. | `docs/05-ops/runtime-and-release.md`, `package.json` | Si hay conflicto QA narrativo vs baseline, prevalece `quality-gates.md`. | QA Lead + PM-Governance |
| `docs/05-ops/runtime-and-release.md` | canonical | 10 | Baseline runtime/release | Evidencia mínima para claims de runtime/release. | Consultar para validar claims runtime/release actuales. | No usar reportes runtime históricos aislados como verdad vigente. | Reportes históricos se preservan como contexto, no como baseline activo. | Cambios de flujo de deploy/runtime. | `docs/project/status.md`, `docs/04-quality/quality-gates.md` | Si hay claims sin evidencia, prevalece este baseline y se marca contradicción severa. | Ops Lead + PM-Governance |
| `docs/archive/README.md` | advisory | 11 | Referencia histórica no prioritaria | Política para conservación de históricos. | Consultar cuando se prepare migración/etiquetado de documentos legacy. | No usar para estado de producto, QA o runtime actual. | Regula interacción con históricos; no reemplaza canon operativo. | Ajuste de criterios de archivo. | `docs/archive/legacy-candidates.md` | Nunca prevalece sobre docs canónicos; solo contexto histórico. | PM-Governance |
| `.github/pull_request_template.md` | template | 12 | Plantilla de evidencia PR | Estructura recomendada de reporte y drift. | Cambio de auditoría o trazabilidad. | `AGENTS.md`, `docs/05-ops/agent-traceability.md` | No resuelve conflictos; guía de reporte. | PM-Governance |
| `scripts/check-doc-triggers.ts` | operational | 13 | Checker advisory | Warns de revisión documental relacionada. | Nuevas categorías/severidades advisory. | `docs/05-ops/documentation-trigger-map.md`, `docs/05-ops/drift-resolution-policy.md` | No prevalece documentalmente; solo emite alertas no bloqueantes. | DevEx / PM-Governance |


## Archive migration notes

- `docs/02-delivery/sprint-33-post-merge-checklist.md` migrado a `docs/archive/02-delivery/sprint-33-post-merge-checklist.md` (stub conservado en ruta original).
- `docs/02-delivery/sprint-33-repo-only-closeout.md` migrado a `docs/archive/02-delivery/sprint-33-repo-only-closeout.md` (stub conservado).
- `docs/06-governance/sprint-33-execution-board.md` migrado a `docs/archive/06-governance/sprint-33-execution-board.md` (stub conservado).
- Consultar `docs/archive/archive-ready-queue.md` para estado `migrated/pending/blocked`.
