# Documentation Trigger Map

Status: canonical
Owner: PM-Governance
Last reviewed: 2026-05-10
Related files:
- AGENTS.md
- docs/project/status.md
- docs/02-delivery/sprint-log.md
- docs/02-delivery/change-log.md
Update trigger:
- governance
- docs
- runtime

---

# Objetivo

Este documento define advertencias de sincronización documental y operacional.

Estado actual:
- advisory
- no bloqueante
- no impide merge
- no falla CI

Su propósito es:
- reducir drift;
- ayudar a agentes IA;
- disminuir contradicciones;
- registrar deuda documental explícita.

---

# Regla general

Cuando un archivo crítico sea modificado:

1. el agente debe revisar si existen archivos relacionados;
2. si no actualiza esos archivos, debe registrar deuda o warning;
3. no debe asumir que documentación previa sigue alineada.

---

# Severidad

| Severidad | Significado |
|---|---|
| Alta | Puede generar drift entre runtime, QA, código y documentación |
| Media | Puede afectar trazabilidad y comprensión operativa |
| Baja | Mejora orden documental y sincronización contextual |

---

# Trigger map

| Archivo modificado | Revisar también | Severidad |
|---|---|---|
| AGENTS.md | docs/05-ops/, status.md, PR templates, trazabilidad | Alta |
| docs/project/status.md | sprint-log.md, change-log.md, QA/runtime reports | Alta |
| docs/02-delivery/sprint-log.md | status.md, change-log.md, backlog | Alta |
| docs/02-delivery/change-log.md | sprint-log.md, status.md | Alta |
| docs/01-product/backlog.md | status.md, sprints, PRs relacionados | Media |
| docs/04-quality/ | scripts de test, runtime reports, status.md | Alta |
| docs/05-ops/ | AGENTS.md, release/runtime docs | Alta |
| scripts/validate-question-bank.ts | taxonomy, content/items/, quality docs | Alta |
| src/domain/taxonomy/ | content/items/, taxonomy docs | Alta |
| src/domain/tutor/ | tutor contracts, QA, status.md | Alta |
| src/lib/tutor/ | tutor contracts, runtime QA | Alta |
| src/lib/supabase/ | docs DB, runtime, deploy docs | Alta |
| content/items/ | validation scripts, taxonomy, editorial docs | Alta |
| package.json | CI, QA docs, runtime docs | Media |

---

# Regla de deuda técnica

Si el agente modifica un archivo crítico y deliberadamente NO actualiza archivos relacionados, debe dejar evidencia:

- PR
- session report
- change-log
- comentario operacional

Ejemplo:

```text
Known documentation drift accepted:
- docs/project/status.md pending alignment
- taxonomy docs pending review
```

---

# Evolución futura

Fases futuras posibles:

1. warnings automáticos locales;
2. warnings en CI;
3. validación documental parcial;
4. enforcement selectivo;
5. checks bloqueantes para runtime/release.
