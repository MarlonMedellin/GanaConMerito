# Runtime and Release Baseline

Status: canonical
Owner: PM-Governance
Last reviewed: 2026-08-30
Related files:
- AGENTS.md
- docs/02-delivery/versioning-and-releases.md
- docs/project/status.md
- docs/04-quality/quality-gates.md
- docs/05-ops/documentation-trigger-map.md
Update trigger:
- runtime
- deploy
- release
- QA

---

> **Checkpoint V4 limpio:** la ruta `0029 → 0030` descrita en el historial queda
> superseded para el futuro cutover V4. La baseline nueva `0001–0003` solo se
> aplicará en un proyecto vacío con autorización separada. Producción no fue
> modificada ni verificada por esa rama histórica.

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

Runtime público canónico:
- `https://ganaconmerito.com`

Application versioning:
- Canonical policy: `docs/02-delivery/versioning-and-releases.md`
- Canonical release metadata: `VERSION.json`
- Visible runtime stamp: `ReleaseStamp`
- Required precheck before release, Canary, production or hotfix:
  `CURRENT_APP_VERSION`, `CURRENT_RELEASE_DATE`, `CANDIDATE_SHA`
- Required records after merge/deploy: `FINAL_RELEASE_SHA`, runtime SHA and
  visual `ReleaseStamp` verification

Snapshot operativo vigente para `v0.11.0`:
- Version: `0.11.0`
- Release date: `2026-08-30`
- Final release SHA: `e3e9b3436f57a0354c7fed941140df468499d624`
- Runtime publico: `https://ganaconmerito.com`
- Runtime publico verificado: `e3e9b3436f57a0354c7fed941140df468499d624`
- Runtime container: `gcm-canary-l2-e3e9b34`
- Runtime port: `3006`
- Build time: `2026-08-31T02:28:58Z`
- ReleaseStamp: PASS
- Public runtime smoke: PASS
- Authenticated smoke: PASS
- Dashboard production: PASS
- Desktop visual: PASS
- Mobile visual: PASS
- Tutor visible: PASS
- OpenRouter visible LLM: false
- V4 active count: 248
- Canary deploy: PASS
- Production promotion: PASS
- Supabase product mutation during promotion: false
- Supabase schema mutation during promotion: false
- Supabase content mutation during promotion: false
- Migrations during promotion: false
- Content Sync during promotion: false
- G6 during promotion: false
- Release tag: `v0.11.0`
- Release tag target SHA: `e3e9b3436f57a0354c7fed941140df468499d624`
- GitHub Release: `published`
- GitHub Release URL:
  `https://github.com/MarlonMedellin/GanaConMerito/releases/tag/v0.11.0`
- Cleanup: `NOT_PERFORMED`
- Old production runtime `v0.10.0` on `:3002`: preserved
- Previous runtime on `:3005`: preserved
- Rollback: available; cleanup reserved to a separate gate
- Closeout evidence: `docs/05-ops/V0.11.0-PRODUCTION-CLOSEOUT-20260830.md`

---

# Regla de runtime

No declarar:

- runtime verificado;
- release exitoso;
- deploy alineado;
- smoke PASS;

sin evidencia mínima.

Para Beta Candidate 0.6.0, la evidencia histórica en `fcc40cb`, `716ec62` u otros
commits sirve como contexto de madurez historica. El estado vigente de produccion
es `v0.11.0` sobre `e3e9b3436f57a0354c7fed941140df468499d624`.

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
| Smoke | `QA_BASE_URL=https://ganaconmerito.com npm run qa:runtime:smoke` PASS |
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

## Cutover V4 futuro

La antigua ventana `0029 → 0030` no se ejecuta para el cutover limpio. El proceso
vigente requiere proyecto Supabase nuevo, baseline `0001–0003`, identidad de
instancia aprobada, sync determinista, verificación, activación, deploy y E2E en
checkpoints separados. La instancia legacy permanece intacta hasta orden expresa.

## Autorización operacional V4.1

Para V4.1, los campos `runtimeActivationAuthorized=false` y
`supabaseMigrationAuthorized=false` de `content/question-bank-v4/MANIFEST.json`
permanecen como invariantes de inactividad del corte canónico V4. No son el
mecanismo de autorización operacional de release/deploy.

La autorización para avanzar al siguiente gate operacional de runtime/deploy se
registra mediante un checkpoint separado en `docs/05-ops/`. Esa autorización no
ejecuta deploy, no activa runtime, no expone usuarios y no autoriza nuevas
mutaciones o migraciones Supabase. Deploy y exposición requieren una autorización
posterior independiente.

---

# Validacion UX movil — 2026-08-19

- Runtime: `https://cnsc.profemarlon.com`.
- Commit desplegado: `9695d40`.
- Viewport: 390x844 con Playwright y sesion autenticada real.
- Rutas: `/home`, `/practice`, `/dashboard`.
- Resultado: `scrollWidth=375` en cada ruta; barra inferior dentro del viewport (`left=12`, `right=363`).
- Artefactos: `/opt/gcm/app/artifacts/mobile-audit-fixes`.

# Riesgos conocidos actuales

- La degradacion por proveedor externo caido no se simulo en runtime; la implementacion actual no invoca un proveedor externo y el fallback validado es el de evidencia insuficiente/guardrails.

- parte del QA sigue siendo narrativo;
- la trazabilidad multiagente todavía no es enforcement obligatorio;
- algunos cierres históricos mezclan repo y runtime;
- la validación documental todavía depende de disciplina manual.
- los cierres historicos pueden conservar referencias de commits anteriores; la validacion movil histórica se realizó sobre `9695d40`.

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
# Tutor OpenRouter shadow

El shadow LLM es server-only y permanece apagado salvo que existan simultáneamente
`GCM_TUTOR_LLM_SHADOW=1`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` y
`OPENROUTER_PROVIDER`. Modelo y proveedor deben corresponder a un endpoint aprobado
con structured outputs y ZDR. Nunca registrar la clave ni copiarla al navegador.

Allowlist inicial aprobada:

- `OPENROUTER_MODEL=openai/gpt-4o-2024-08-06`
- `OPENROUTER_PROVIDER=azure`

Una clave pegada en chats, tickets, commits o logs debe revocarse y reemplazarse;
no puede reutilizarse para shadow ni producción.
