# Documentation Trigger Map

Status: canonical
Owner: PM-Governance
Last reviewed: 2026-08-23

Este documento define advertencias no bloqueantes para reducir drift documental y operativo.

## Estado

- Advisory.
- No bloquea CI.
- No impide merge.
- Debe usarse como guía de revisión por agentes.

## Regla general

Cuando un archivo crítico sea modificado, el agente debe revisar archivos relacionados. Si no los actualiza, debe dejar una deuda técnica explícita en commit, reporte de sesión, change-log o cierre operativo.

## Severidad

| Severidad | Significado |
|---|---|
| Alta | Puede generar drift entre runtime, QA, código y documentación |
| Media | Puede afectar trazabilidad o comprensión operativa |
| Baja | Mejora orden documental |

## Trigger map

| Archivo modificado | Revisar también | Severidad |
|---|---|---|
| AGENTS.md | docs/05-ops/, status.md, plantillas, trazabilidad | Alta |
| docs/project/status.md | sprint-log.md, change-log.md, QA/runtime reports | Alta |
| docs/02-delivery/sprint-log.md | status.md, change-log.md, backlog | Alta |
| docs/02-delivery/change-log.md | sprint-log.md, status.md, versioning-and-releases si cambia release/version | Alta |
| docs/02-delivery/versioning-and-releases.md | VERSION.json, AGENTS.md, README.md, docs/README.md, runtime/release docs, agentes IA | Alta |
| docs/01-product/backlog.md | status.md, sprint-log.md | Media |
| docs/04-quality/ | scripts de test, runtime reports, status.md | Alta |
| docs/05-ops/ | AGENTS.md, release/runtime docs | Alta |
| VERSION.json | app-version.ts, ReleaseStamp, changelog, release checklist, runtime/release docs | Alta |
| src/lib/app-version.ts | VERSION.json, ReleaseStamp, tests, versioning policy | Alta |
| src/components/release/ | VERSION.json, build-info, QA runtime smoke, release docs | Alta |
| scripts/validate-question-bank.ts | taxonomy, content/items/, quality docs | Alta |
| src/domain/taxonomy/ | content/items/, taxonomy docs | Alta |
| src/domain/tutor/ | tutor contracts, QA, status.md | Alta |
| src/lib/tutor/ | tutor contracts, runtime QA | Alta |
| src/lib/supabase/ | docs DB, runtime, deploy docs | Alta |
| content/items/ | validation scripts, taxonomy, editorial docs | Alta |
| content/question-bank-v4/items/ | MANIFEST.json, contrato V4, taxonomy, validador/importador V4, QA | Alta |
| content/question-bank-v4/taxonomy/ | contrato V4, MANIFEST.json, skills V4, docs DB/importador | Alta |
| content/question-bank-v4/CONTRATO-EDITORIAL-V4.md | MANIFEST.json, validador/importador, skills, docs DB V4 | Alta |
| content/knowledge-base/ | content/targeting/, arquitectura knowledge-targeting, guías de agentes, docs de fuentes | Media |
| content/targeting/ | arquitectura knowledge-targeting, content-model, contratos DB V4, selector futuro | Alta |
| docs/03-architecture/question-bank-knowledge-targeting-architecture.md | content/README, GUIA-PARA-AGENTES-IA, targeting/knowledge README, docs DB V4, canonical-docs | Alta |
| docs/database/question-bank-v4-contract.md | PRD Supabase V4, architecture adoption, schema, active bank contract | Alta |
| docs/database/prd-question-bank-v4-supabase.md | migrations reales, question-bank-v4-contract, schema, architecture | Alta |
| docs/database/v4-clean-baseline.md | migrations, runtime V4, security, status, content-sync | Alta |
| scripts/content-sync.ts o scripts/lib/content-sync-* | migrations, content-sync, quality-gates, workflows | Alta |
| supabase/migrations/ | docs/database/schema.md, contratos DB, runtime/release, status si afecta despliegue | Alta |
| package.json | CI, QA docs, runtime docs, versioning policy si cambia metadata de version | Media |

## Reglas específicas de knowledge/targeting

Si se cambia el catálogo de perfiles/cargos u OPEC:
- revisar que no se esté creando una taxonomía paralela;
- revisar compatibilidad con DB/selector;
- no hacer backfill del corpus solo por el cambio documental;
- no inventar OPEC sin fuente real.

Si se añade o cambia una fuente de conocimiento:
- revisar procedencia y vigencia;
- revisar duplicación física de la fuente;
- actualizar mapas de aplicabilidad cuando corresponda;
- no regenerar preguntas automáticamente.

## Evolución futura

1. warnings automáticos locales;
2. warnings en CI;
3. validación documental parcial;
4. enforcement selectivo;
5. checks bloqueantes para runtime/release.
