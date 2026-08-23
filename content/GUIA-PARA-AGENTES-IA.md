# Guia para agentes IA sobre `content`

Esta guia define como leer, buscar y modificar el contenido editorial de GanaConMerito.

## Regla principal

No confundir estas tres capas:

1. **Knowledge base** — qué norma, teoría, guía, documento técnico o temario sustenta el contenido.
2. **Taxonomía** — qué constructo evalúa una pregunta.
3. **Targeting** — a qué familia, perfil/cargo u OPEC aplica.

Rutas objetivo:

```text
content/knowledge-base/
content/question-bank-v4/taxonomy/
content/targeting/
```

Una fuente no es una pregunta; un cargo no es un tópico; una OPEC no es una competencia.

## Orden de consulta para trabajo V4

1. `content/README.md`
2. `content/question-bank-v4/README.md`
3. `content/question-bank-v4/MANIFEST.json`
4. `content/question-bank-v4/CONTRATO-EDITORIAL-V4.md`
5. `content/knowledge-base/README.md`
6. `content/targeting/README.md`
7. `docs/03-architecture/question-bank-knowledge-targeting-architecture.md`
8. `docs/ai/skills/` — fábrica y auditor apropiados
9. `content/question-bank-v4/taxonomy/*.json`

Para cambios de persistencia/runtime consultar además:

- `docs/database/question-bank-v4-contract.md`
- `docs/database/prd-question-bank-v4-supabase.md`
- `docs/database/content-model.md`

## Estado V4

El corte físico/editorial vigente se determina únicamente desde:

```text
content/question-bank-v4/MANIFEST.json
```

Los archivos históricos `COVERAGE-*`, `AUDIT-*`, `EXPANSION-*`, `REAUDIT-*` y
`REMEDIATION-*` explican cómo se llegó al corte, pero no sustituyen el manifiesto.

No modificar reactivos, contrato ni taxonomía del corte congelado sin una decisión
editorial explícita y regeneración coherente del manifiesto.

## Protocolo V4 para preguntas

Todo registro legacy se procesa **uno por uno**. La fábrica usa únicamente el
conocimiento recuperable para decidir `PRODUCE` o `DISCARD`. Si produce, el auditor
adversarial emite `APPROVED` o `REJECTED`; solo `APPROVED` puede serializarse en el
banco V4.

| Ambito | Fabrica | Auditor |
|---|---|---|
| Docentes | `GCM-Master-Question-Factory-Docentes.md` | `GCM-Adversarial-Item-Auditor-Docentes.md` |
| OPEC general/especifica | `GCM-Master-Question-Factory-OPEC-General.md` | `GCM-Adversarial-Item-Auditor-OPEC-General.md` |

Reglas:

- no reparar un `REJECTED`; regenerar desde cero o abandonar;
- no reutilizar IDs consumidos;
- deduplicar por constructo, fuente, teoría/norma y operación cognitiva;
- no crear una pregunta para alcanzar una cuota;
- no inventar fuentes ni taxonomías.

## Protocolo de conocimiento fuente

Antes de generar una pregunta nueva, determinar:

1. qué fuente la sostiene;
2. si la fuente está vigente/verificada;
3. dónde vive o debe registrarse en `knowledge-base`;
4. si es común, de familia, de perfil o específica de OPEC;
5. si ya existe otro reactivo que usa la misma condición decisiva.

### Temarios

Los temarios y documentos de temas sirven para descubrir vacíos y construir
blueprints. No son taxonomía automática.

El temario docente original que originó la expansión debe incorporarse desde su
archivo fuente exacto en:

```text
content/knowledge-base/themes/docentes/temario-base.md
```

No recrearlo desde memoria.

### Normativa

`content/normative/` es material histórico/transicional. Antes de copiar una norma a
`knowledge-base`, inventariar si ya existe para evitar duplicados.

Una misma norma puede aplicar a muchos perfiles/OPEC sin copiarse físicamente.

## Protocolo de targeting

Jerarquía:

```text
familia → perfil/cargo canónico → OPEC concreta
```

Para docentes, perfiles iniciales:

- `rector_director_rural`
- `coordinador`
- `docente_aula_preescolar`
- `docente_aula_basica_primaria`
- `docente_aula_secundaria_media`
- `docente_orientador`

### Regla cargo vs OPEC

Para selección son destinos equivalentes. Para identidad no son sinónimos:

- perfil/cargo = reusable entre convocatorias;
- OPEC = instancia concreta;
- varias OPEC pueden pertenecer al mismo perfil.

No duplicar preguntas por OPEC. No inferir perfil/OPEC únicamente por palabras del
enunciado. La aplicabilidad multi-perfil debe modelarse mediante relaciones o mapas
controlados.

## Secuencia recomendada para fabricar contenido nuevo

```text
1. detectar vacío real
2. localizar/verificar fuente
3. resolver familia/perfil/OPEC de aplicabilidad
4. deduplicar contra banco activo
5. definir constructo
6. clasificar taxonomía
7. ejecutar fábrica
8. auditoría ciega/adversarial
9. solo APPROVED recibe ID y se serializa
10. actualizar estado/manifest cuando se apruebe un nuevo corte
```

La taxonomía se decide por el constructo, no para balancear estadísticas. El
targeting se decide por la aplicabilidad profesional, no por el tema textual.

## Mapa de rutas

| Si buscas... | Usa... |
|---|---|
| Corte V4 vigente | `content/question-bank-v4/MANIFEST.json` |
| Reactivos V4 | `content/question-bank-v4/items/` |
| Qué evalúa un reactivo | `content/question-bank-v4/taxonomy/` + metadatos del ítem |
| Fuentes/temarios futuros | `content/knowledge-base/` |
| Familia/perfil/OPEC | `content/targeting/` |
| Arquitectura knowledge/targeting | `docs/03-architecture/question-bank-knowledge-targeting-architecture.md` |
| Preguntas beta históricas | `content/items/beta-v1/` |
| Material legacy/no beta | `content/items/no-beta-v1/` |
| Evidencia histórica beta | `content/restructuring-v1/` |
| Normativa histórica | `content/normative/` |

## Reglas para modificar

- No duplicar preguntas por perfil/cargo/OPEC.
- No duplicar normas o documentos para cada destinatario.
- No usar carpetas de perfil como banco productivo.
- No convertir el temario en lista de topics sin análisis editorial.
- No cambiar SQL o runtime solo porque se documentó una arquitectura objetivo.
- No declarar una tabla/relación Supabase implementada sin migración y evidencia.
- Si una pregunta cambia, registrar origen, razón y validación.

## Validaciones

Para cambios autorizados en V4:

```bash
npm run content:validate:v4
python3 scripts/question_bank_v4_manifest.py --check
```

Solo regenerar el manifiesto cuando exista un nuevo corte editorial aprobado:

```bash
python3 scripts/question_bank_v4_manifest.py --write
```

Para documentación, aplicar además las validaciones documentales vigentes del repo
y `git diff --check` cuando el entorno permita ejecutarlas.

## Runtime y Supabase

La estructura documental de `knowledge-base` y `targeting` es una arquitectura de
evolución. No implica por sí sola:

- tablas nuevas en Supabase;
- backfill de los 248 reactivos;
- activación del banco V4;
- modificación del selector de producción.

Toda adopción técnica debe seguir migraciones versionadas, RLS, pruebas y rollout
controlado.
