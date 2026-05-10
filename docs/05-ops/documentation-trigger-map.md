# Documentation Trigger Map

Status: canonical
Owner: PM-Governance
Last reviewed: 2026-05-10

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
| docs/02-delivery/change-log.md | sprint-log.md, status.md | Alta |
| docs/01-product/backlog.md | status.md, sprint-log.md | Media |
| docs/04-quality/ | scripts de test, runtime reports, status.md | Alta |
| docs/05-ops/ | AGENTS.md, release/runtime docs | Alta |
| scripts/validate-question-bank.ts | taxonomy, content/items/, quality docs | Alta |
| src/domain/taxonomy/ | content/items/, taxonomy docs | Alta |
| src/domain/tutor/ | tutor contracts, QA, status.md | Alta |
| src/lib/tutor/ | tutor contracts, runtime QA | Alta |
| src/lib/supabase/ | docs DB, runtime, deploy docs | Alta |
| content/items/ | validation scripts, taxonomy, editorial docs | Alta |
| package.json | CI, QA docs, runtime docs | Media |

## Evolución futura

1. warnings automáticos locales;
2. warnings en CI;
3. validación documental parcial;
4. enforcement selectivo;
5. checks bloqueantes para runtime/release.
