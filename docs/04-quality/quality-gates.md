# Quality Gates

Status: canonical
Owner: PM-Governance
Last reviewed: 2026-05-10
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
| Documentation alignment | Advisory |
| Agent traceability | Advisory |
| Runtime verification | Selectivo |

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
