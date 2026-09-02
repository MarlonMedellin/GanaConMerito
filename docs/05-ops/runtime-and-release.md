# Runtime and Release Baseline

Status: canonical
Owner: PM-Governance
Last reviewed: 2026-09-01
Related files:
- `AGENTS.md`
- `VERSION.json`
- `docs/project/status.md`
- `docs/02-delivery/versioning-and-releases.md`
- `docs/02-delivery/release-checklist.md`

## Objetivo

Mantener una sola referencia breve del runtime vigente y evitar que evidencia historica compita con produccion actual.

## Fuente de verdad operacional

1. repositorio remoto principal;
2. `VERSION.json`;
3. runtime visible;
4. evidencia de release/closeout.

Repositorio: `https://github.com/MarlonMedellin/GanaConMerito`

Runtime publico: `https://ganaconmerito.com`

## Produccion vigente

- Version: `0.11.0`.
- Release date: `2026-08-30`.
- Final release SHA: `e3e9b3436f57a0354c7fed941140df468499d624`.
- Container: `gcm-canary-l2-e3e9b34`.
- Puerto: `3006`.
- Imagen: `sha256:01eefe55cb6b024ac5a7adce5ca4fe0b724583ce9db4b3521ef442f5ecb8b76f`.
- Build time: `2026-08-31T02:28:58Z`.
- nginx upstream: `127.0.0.1:3006`.
- ReleaseStamp: `PASS`.
- Public smoke: `PASS`.
- Authenticated smoke: `PASS`.
- Dashboard desktop/mobile: `PASS`.
- Tutor visible: `PASS`.
- OpenRouter visible LLM: `false`.
- V4 active count: `248`.
- Tag: `v0.11.0` -> `e3e9b3436f57a0354c7fed941140df468499d624`.
- GitHub Release: `published`.

## Cleanup ejecutado

- `:3002` / `gcm-canary-app`: retirado.
- `:3005` / `gcm-canary-l2-0e710b7`: retirado.
- Imagenes antiguas asociadas sin uso: retiradas.
- Backup nginx `cnsc.profemarlon.com.rollback-v0.11.0-promotion-20260831T024215Z`: retirado.
- `:3002`: libre.
- `:3005`: libre.
- `:3006`: activo.
- `nginx -t`: `PASS`.
- Public smoke posterior al cleanup: `PASS`.
- Deploy durante cleanup: `false`.
- Rebuild durante cleanup: `false`.
- Supabase cambiado: `false`.
- Migrations: `false`.
- Content Sync: `false`.
- G6: `false`.

## Residual del host

El ultimo inventario reporto contenedores historicos en `:3003` y `:3004`. No fueron modificados porque no estaban clasificados/autorizados en el gate de cleanup. No forman parte del upstream productivo. Deben inspeccionarse por nombre, imagen, SHA y dependencias antes de eliminarlos.

## Reglas operativas

- No declarar un runtime verificado sin SHA visible y smoke correspondiente.
- No usar reportes historicos como fuente del estado actual.
- No mover un tag publicado a commits documentales posteriores.
- Reutilizar evidencia valida del mismo SHA; no repetir gates sin cambio material.
- No ejecutar migraciones, Content Sync o G6 como parte de un cleanup de containers.
- No usar `docker system prune` como sustituto de una limpieza selectiva.

## Evidencia de cierre

Snapshot operativo vigente para `v0.12.0`:
- Version: `0.12.0`
- Release status: `CLOSED`
- Release tag: `v0.12.0`
- GitHub Release: `published`
- Final release SHA: `132f78113cf3b0917b459db39d79c710450bed52`
- Production SHA: `132f78113cf3b0917b459db39d79c710450bed52`
- Production version: `v0.12.0`
- Runtime publico: `https://ganaconmerito.com`
- Production upstream: `127.0.0.1:3007`
- Production health: PASS
- ReleaseStamp: PASS
- Public smoke: PASS
- Authenticated smoke: PASS
- Tutor visible: PASS
- OpenRouter visible: PASS
- Deterministic fallback: PASS
- Multiturn: PASS
- Rollback remaining: PASS
- Migrations: NO
- Supabase remote change: NO
- Content Sync: NO
- Content V4 change: NO
- Database changed: false
- Secrets exposed: false
- Rollback `v0.11.0`: `gcm-canary-l2-e3e9b34` on `127.0.0.1:3006`,
  preserved

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
es `v0.12.0` sobre `132f78113cf3b0917b459db39d79c710450bed52`.

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
