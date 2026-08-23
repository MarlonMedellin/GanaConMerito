# Quality Gates

Status: canonical
Owner: PM-Governance
Last reviewed: 2026-08-11
Related files:
- AGENTS.md
- package.json
- docs/project/status.md
- docs/05-ops/documentation-trigger-map.md
Update trigger:
- QA
- runtime
- CI
- governance

---

# Objetivo

Definir una capa mínima y ejecutiva de quality gates para GanaConMerito.

El objetivo actual NO es enforcement duro.
El objetivo es:

- reducir drift;
- evitar falsos cierres;
- distinguir warnings de fallos reales;
- mejorar consistencia operativa;
- preparar endurecimiento futuro.

---

# Estado actual

Actualmente el proyecto opera con:

- validaciones reales parciales;
- smoke checks;
- tests unitarios;
- validación editorial;
- QA operacional selectivo.

Para Beta Candidate 0.6.0, el estado aceptado es:
- base tecnica cercana a beta;
- HEAD actual revisado `7ade741`;
- ultimo runtime publico verificado documentalmente `7ade741`;
- cierre beta funcional bloqueado hasta runtime/release fresco sobre commit objetivo.

Persisten limitaciones:

- cobertura parcial;
- validaciones narrativas;
- enforcement no obligatorio;
- trazabilidad todavía incompleta.

---

# Clasificación de gates

| Tipo | Estado actual |
|---|---|
| Runtime smoke | Importante |
| Build | Obligatorio |
| Typecheck | Obligatorio |
| Tutor regression | Importante |
| Editorial validation | Importante |
| V4 freeze manifest | Obligatorio para cambios V4 |
| V4 atomic database import | Obligatorio para importador/migraciones V4 |
| Documentation alignment | Advisory |
| Agent traceability | Advisory |
| Runtime verification | Selectivo |

Para declarar `v0.6.0-beta.1`, runtime verification pasa de selectivo a obligatorio para ese release.

---

# Gates mínimos esperados

## Cambios de código

Esperado:
- build;
- typecheck;
- tests relacionados.

## Cambios editoriales

Esperado:
- content validation;
- revisión taxonómica;
- warnings explícitos.

Para `content/question-bank-v4/`, `npm run content:validate:v4` y
`python3 scripts/question_bank_v4_manifest.py --check` son bloqueantes en push a
`master` y pull requests hacia `master`. El gate compara reactivos, IDs, contrato,
taxonomías, métricas y hashes contra `MANIFEST.json`; un cambio sin reconciliar el
manifiesto falla.

Para cambios al importador o a migraciones V4, CI reconstruye Supabase desde cero
y ejecuta `npm run test:v4-import:db`. El gate debe probar lote limpio,
idempotencia, errores de contrato/ID/hash/conteo, rollback intermedio, cuatro
opciones, inactividad, permisos, vistas seguras y preservación histórica. La suite
rechaza conexiones que no sean loopback.

## Cambios de runtime

Esperado:
- smoke runtime;
- evidencia mínima;
- commit verificado.

## Cambios documentales

Esperado:
- revisar trigger map;
- revisar status.md;
- registrar drift conocido.

---

# Warnings vs fallos

## Warning

No bloquea:
- deuda documental;
- taxonomía parcial legacy;
- metadata incompleta heredada;
- trazabilidad parcial.

## Fallo real

Debe considerarse severo:
- build roto;
- runtime inconsistente;
- contrato de tutor roto;
- contradicción operacional grave;
- promoción falsa de runtime;
- drift silencioso no reportado.

---

# Evolución futura

Fase actual:
- advisory-heavy;
- enforcement ligero.

Fases futuras:
1. warnings automáticos;
2. CI advisory;
3. CI parcial bloqueante;
4. enforcement selectivo;
5. release governance más estricta.

---

# Governance maturity levels

| Level | Description | Repo applicability |
|---|---|---|
| manual | Dependencia principal de disciplina humana y revisión ad hoc. | Histórico/base |
| advisory | Reglas documentadas con warnings no bloqueantes. | Activo |
| advisory+CI | Warnings visibles en CI con `continue-on-error`. | Activo parcial |
| selective enforcement | Bloqueos puntuales para claims críticos y metadata mínima. | Futuro |
| strict governance | Enforcement amplio y consistente en CI y flujo release. | Futuro |

Estado actual del repo: **advisory-heavy incremental hardening** entre niveles
`advisory` y `advisory+CI`, con enforcement selectivo bloqueante para el corte V4.


---

# Legacy governance state

| State | Meaning |
|---|---|
| uncontrolled legacy | Documentos históricos sin clasificación de autoridad. |
| classified legacy | Existe inventario con riesgo/severidad y referencias canónicas. |
| contextualized legacy | Documentos high-conflict tienen headers y notas de no-autoridad ejecutiva. |
| archived legacy | Históricos movidos de forma controlada a `docs/archive/` con reemplazo explícito. |
| enforced governance | CI y flujo operativo bloquean contradicciones severas. |

Estado actual real: **entre `classified legacy` y `contextualized legacy`**; todavía sin archive masivo ni enforcement bloqueante.
