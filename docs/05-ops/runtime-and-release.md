# Runtime and Release Baseline

Status: canonical
Owner: PM-Governance
Last reviewed: 2026-05-10
Related files:
- AGENTS.md
- docs/project/status.md
- docs/04-quality/quality-gates.md
- docs/05-ops/documentation-trigger-map.md
Update trigger:
- runtime
- deploy
- release
- QA

---

# Objetivo

Definir una referencia operacional mínima para runtime, release y deploy.

La meta actual es:

- reducir contradicciones;
- distinguir repo vs runtime;
- evitar cierres falsos;
- mejorar trazabilidad;
- preparar gobernanza futura.

---

# Fuente de verdad

Prioridad operacional:

1. repo remoto principal;
2. documentación canónica alineada;
3. copia sincronizada VPS;
4. árbol deploy;
5. runtime visible.

Repositorio principal:
- `https://github.com/ProfeMarlonMDE/GanaConMerito`

Copia sincronizada:
- `~/.openclaw/product`

Deploy:
- `/opt/gcm/app`

Runtime público:
- `https://cnsc.profemarlon.com`

---

# Regla de runtime

No declarar:

- runtime verificado;
- release exitoso;
- deploy alineado;
- smoke PASS;

sin evidencia mínima.

---

# Evidencia mínima recomendada

| Evidencia | Recomendación |
|---|---|
| Commit desplegado | Obligatoria |
| Hash verificado | Obligatoria |
| Smoke runtime | Recomendado |
| QA relevante | Recomendado |
| Runtime URL | Obligatoria |
| Drift conocido | Recomendado |

---

# Flujo operativo recomendado

1. actualizar repo principal;
2. actualizar copia sincronizada;
3. alinear árbol deploy;
4. reconstruir/reiniciar si aplica;
5. ejecutar validación;
6. registrar evidencia.

---

# Riesgos conocidos actuales

- parte del QA sigue siendo narrativo;
- la trazabilidad multiagente todavía no es enforcement obligatorio;
- algunos cierres históricos mezclan repo y runtime;
- la validación documental todavía depende de disciplina manual.

---

# Estado actual de enforcement

Estado:
- advisory-heavy;
- no bloqueante;
- gobernanza incremental.

Todavía NO existe:
- release gating fuerte;
- CI documental obligatorio;
- enforcement automático de trazabilidad.

---

# Evolución futura

1. trigger warnings automáticos;
2. CI advisory;
3. runtime verification checklist;
4. enforcement selectivo;
5. rollback governance más estricta.
