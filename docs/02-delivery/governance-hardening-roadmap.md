# Governance Hardening Roadmap

Status: canonical
Owner: PM-Governance
Last reviewed: 2026-05-10
Related files:
- AGENTS.md
- docs/project/status.md
- docs/05-ops/documentation-trigger-map.md
- docs/05-ops/agent-traceability.md
- docs/04-quality/quality-gates.md
- docs/05-ops/runtime-and-release.md
- .github/workflows/pr-checks.yml
Update trigger:
- governance
- delivery
- documentation
- CI

---

# Objetivo

Ordenar la transición de GanaConMerito desde documentación acumulativa hacia gobernanza operacional incremental.

Este roadmap evita dos extremos:

1. depender solo de disciplina humana;
2. endurecer todo de golpe con CI bloqueante.

La estrategia es avanzar por capas:

- primero visibilidad;
- luego advertencias;
- luego automatización advisory;
- luego enforcement selectivo.

---

# Fase 1 — Base documental mínima

Estado: iniciado.

Entregables:
- `docs/05-ops/documentation-trigger-map.md`;
- `docs/05-ops/agent-traceability.md`;
- `docs/04-quality/quality-gates.md`;
- `docs/05-ops/runtime-and-release.md`;
- `docs/archive/README.md`;
- `.github/pull_request_template.md`;
- snapshot ejecutivo en `docs/project/status.md`.

Criterio de salida:
- el estado ejecutivo se entiende desde `status.md`;
- las reglas básicas se entienden desde `AGENTS.md`;
- los agentes tienen documentos cortos y canónicos para operar.

---

# Fase 2 — Automatización advisory

Estado: iniciado.

Entregables:
- `scripts/check-doc-triggers.ts`;
- comando `npm run check:doc-triggers`;
- ejecución advisory en CI con `continue-on-error: true`.

Criterio de salida:
- el CI muestra advertencias sin bloquear;
- los agentes empiezan a ver relaciones documentales;
- el humano no depende solo de memoria.

---

# Fase 3 — Reducción documental

Estado: pendiente.

Objetivo:
- clasificar documentación existente como canonical, advisory, superseded o archived.

Acciones:
- identificar documentos redundantes;
- mover documentos históricos a `docs/archive/`;
- agregar encabezados mínimos;
- evitar que documentos viejos compitan con `status.md`, `AGENTS.md` y los documentos operativos nuevos.

Criterio de salida:
- no debe haber más de una fuente ejecutiva para el estado del proyecto;
- cada documento canónico debe declarar su propósito;
- cada documento archivado debe indicar qué lo reemplaza.

---

# Fase 4 — Validación documental selectiva

Estado: futura.

Objetivo:
- pasar de advertencias genéricas a checks más útiles.

Posibles checks:
- si cambia `status.md`, advertir revisar `sprint-log.md` y `change-log.md`;
- si cambia `package.json`, advertir revisar QA/CI docs;
- si cambia tutor/taxonomy/content, advertir revisar quality gates;
- si un commit declara `Runtime-Verified: yes`, exigir referencia mínima de evidencia.

Criterio de salida:
- CI advisory más contextual;
- menor drift silencioso;
- mejor auditoría multiagente.

---

# Fase 5 — Enforcement selectivo

Estado: futura, no activar todavía.

Solo debería activarse cuando:

- el equipo ya use bien los templates;
- los warnings advisory estén estabilizados;
- la documentación legacy esté reducida;
- no haya falsos positivos frecuentes.

Checks candidatos:
- metadata mínima en commits críticos;
- documentación relacionada para runtime claims;
- calidad mínima para releases;
- bloqueo de cierres contradictorios.

---

# Revisión recomendada

Realizar una revisión formal cuando ocurra cualquiera de estas condiciones:

- 2 semanas desde el inicio del hardening;
- 5 cambios relevantes;
- 1 sprint completo;
- 3 ejecuciones CI con advisory warnings.

---

# Criterios de éxito

La mejora funciona si:

- `status.md` explica el estado real sin contradicciones;
- `sprint-log.md` y `change-log.md` no compiten con `status.md`;
- los agentes consultan `AGENTS.md` y trigger map antes de cerrar;
- CI muestra advertencias útiles;
- los commits relevantes incluyen metadata operacional extendida;
- el drift queda visible, no escondido.

---

# Principio operativo

No se busca más documentación.

Se busca mejor sincronización, menor ambigüedad y más evidencia operacional.
