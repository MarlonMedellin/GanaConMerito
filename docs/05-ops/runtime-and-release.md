# Runtime and Release Baseline

Status: canonical
Owner: PM-Governance
Last reviewed: 2026-08-19
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
- `https://github.com/MarlonMedellin/GanaConMerito`

Copia sincronizada:
- `~/.openclaw/product`

Deploy:
- `/opt/gcm/app`

Runtime público:
- `https://cnsc.profemarlon.com`

Snapshot vigente para beta candidata:
- HEAD actual de repo revisado: `2cc274b`
- Ultimo runtime publico verificado: `2cc274b`
- Estado de paridad: commit alineado; E2E con cuenta real pendiente
- Version objetivo: `0.6.0`
- Release beta sugerido despues de cierre: `v0.6.0-beta.1`

---

# Regla de runtime

No declarar:

- runtime verificado;
- release exitoso;
- deploy alineado;
- smoke PASS;

sin evidencia mínima.

Para Beta Candidate 0.6.0, la evidencia historica en `fcc40cb`, `716ec62` u otros commits sirve como contexto de madurez. La verificacion actual confirma que el runtime visible muestra `2cc274b` y exige login real, pero no sustituye la E2E autenticada completa.

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

## Evidencia minima para cerrar `v0.6.0-beta.1`

| Gate | Criterio |
|---|---|
| Source | `~/.openclaw/product` en el commit objetivo |
| Deploy tree | `/opt/gcm/app` en el mismo commit objetivo |
| Runtime visible | `/login` o `/home` muestra el mismo commit y `buildTime` reciente; en fase de pruebas con bypass QA, `/login` puede entregar la app ya autenticada o resolver hacia `/home` |
| Build | `npm run build` PASS |
| Tests | suite relevante PASS; fallos por entorno documentados aparte |
| Contenido | `npm run content:validate` PASS |
| Smoke | `QA_BASE_URL=https://cnsc.profemarlon.com npm run qa:runtime:smoke` PASS |
| Postdeploy/E2E | `qa:smoke:postdeploy`, `qa:e2e:api` y `qa:e2e:ui` PASS cuando aplique |
| Registro | `status.md`, `sprint-log.md`, `change-log.md` y release checklist actualizados |

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
- hay drift vigente entre HEAD de repo y ultimo runtime verificado documentado hasta que se ejecute la corrida beta.

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
