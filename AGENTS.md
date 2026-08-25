# AGENTS.md — GanaConMerito

Documento de gobernanza operativa para agentes IA que trabajan sobre este repositorio.
Fuente canonica: `https://github.com/MarlonMedellin/GanaConMerito` (rama `master`).

---

## Fuente de Verdad y Disciplina de Runtime

Manten esta jerarquia cuando haya conflicto entre senales:

1. repo remoto principal
2. documentacion canonica alineada
3. copia sincronizada en `~/.openclaw/product`
4. arbol de deploy
5. runtime visible

La fuente de verdad del producto es `https://github.com/MarlonMedellin/GanaConMerito`.
La copia sincronizada de desarrollo local/VPS es `~/.openclaw/product`.
El arbol de deploy es `/opt/gcm/app`.
El archivo de entorno persistente de deploy es `/opt/gcm/env/gcm-app.env`.
La rama principal es `master`.
El runtime publico de validacion es `https://ganaconmerito.com`.

---

## Banco de Preguntas y Arquitectura Editorial

Para cualquier tarea sobre preguntas, `content`, fuentes, perfiles/cargos u OPEC,
leer primero según el alcance:

1. `content/README.md`
2. `content/GUIA-PARA-AGENTES-IA.md`
3. `content/question-bank-v4/README.md` cuando sea V4
4. `content/question-bank-v4/MANIFEST.json` para el corte físico/editorial V4 vigente
5. `content/knowledge-base/README.md` para normas, teoría, guías, documentos técnicos y temarios
6. `content/targeting/README.md` para familia, perfil/cargo y OPEC
7. `docs/03-architecture/question-bank-knowledge-targeting-architecture.md` para la arquitectura transversal

Para trabajo Beta/legacy histórico consultar además:

- `content/INDICE-DOCUMENTAL.md`
- `content/REVISION-MD-CONTENT.md`
- `content/MANIFIESTO-SANEAMIENTO-BETA.md`
- `content/restructuring-v1/00-beta-v1/indice-maestro-beta.csv`

Para revisar material legacy mediante IA, consultar también:

- `docs/ai/skills/GCM-Master-Question-Factory-Docentes.md`
- `docs/ai/skills/GCM-Adversarial-Item-Auditor-Docentes.md`
- `docs/ai/skills/GCM-Master-Question-Factory-OPEC-General.md`
- `docs/ai/skills/GCM-Adversarial-Item-Auditor-OPEC-General.md`

### Regla de tres capas

Nunca mezclar estas responsabilidades:

```text
knowledge base → qué evidencia/fuente sustenta el contenido
taxonomía       → qué constructo se evalúa
targeting       → a quién aplica: familia → perfil/cargo → OPEC
```

Consecuencias obligatorias:

- un cargo/perfil NO es `domain`, `topic` ni `competency`;
- una OPEC NO es una categoría temática;
- una norma/guía NO se duplica físicamente por cada perfil;
- una pregunta NO se duplica por cada OPEC;
- no inferir cargo u OPEC desde palabras del enunciado como sustituto de metadata/relaciones controladas.

Para selección de producto, perfil/cargo y OPEC pueden ser destinos equivalentes.
Para persistencia son identidades distintas: el perfil/cargo es reusable entre
convocatorias y la OPEC es una instancia concreta que debe mapear al perfil.

### Perfiles docentes iniciales

- `rector_director_rural`
- `coordinador`
- `docente_aula_preescolar`
- `docente_aula_basica_primaria`
- `docente_aula_secundaria_media`
- `docente_orientador`

No inventar nuevos códigos de perfil de forma aislada. Toda ampliación debe pasar
por el catálogo de targeting y la documentación correspondiente.

### Regla V4

Todo registro legacy de preguntas se procesa de uno en uno. La fábrica aplicable
crea un reactivo nuevo desde cero o lo descarta; el auditor adversarial debe
aprobarlo antes de serializarlo en `content/question-bank-v4/`.

- No reparar un `REJECTED` de forma incremental.
- No reutilizar IDs consumidos.
- No fabricar volumen para cumplir cuotas.
- Deduplicar por constructo, fuente, teoría/norma y operación cognitiva, no solo por texto.
- El corte vigente se toma de `MANIFEST.json`, no de snapshots históricos.

### Temarios y fuentes

Los temarios son insumos de planeación/gap analysis, no taxonomía automática.
El temario docente original, cuando se incorpore desde su archivo exacto, debe vivir
en `content/knowledge-base/themes/docentes/temario-base.md`.

`content/normative/` conserva material histórico/transicional. Antes de mover o
copiar una fuente hacia `knowledge-base`, inventariar y deduplicar. No recrear un
documento fuente desde memoria.

### Supabase y runtime

La arquitectura de knowledge/targeting es una evolución documentada, no evidencia
de implementación. No declarar tablas, backfills, migraciones aplicadas o selector
jerárquico activos salvo evidencia correspondiente.

Para trabajo de datos V4 consultar:

- `docs/database/question-bank-v4-contract.md`
- `docs/database/prd-question-bank-v4-supabase.md`
- `docs/database/content-model.md`
- `docs/database/schema.md`

Las migraciones efectivamente aplicadas y el runtime verificado prevalecen como
hechos operativos sobre documentos de diseño.

## Application versioning

Antes de cualquier release, deploy, promocion Canary o hotfix, leer:

- `docs/02-delivery/versioning-and-releases.md`

Todo agente debe verificar:

- version actual en `VERSION.json`;
- release date actual en `VERSION.json`;
- candidate SHA;
- runtime SHA cuando exista deploy.

No se permite deploy sin version metadata coherente. La version visible de
aplicacion se gobierna desde `VERSION.json`; `src/lib/build-info.ts` gobierna
commit/buildTime del runtime y no debe duplicarse.

### Rutas canónicas relevantes

| Necesidad | Ruta |
|---|---|
| Corte V4 vigente | `content/question-bank-v4/MANIFEST.json` |
| Reactivos V4 | `content/question-bank-v4/items/` |
| Taxonomía V4 | `content/question-bank-v4/taxonomy/` |
| Knowledge base | `content/knowledge-base/` |
| Targeting familia/perfil/OPEC | `content/targeting/` |
| Arquitectura transversal | `docs/03-architecture/question-bank-knowledge-targeting-architecture.md` |
| Preguntas listas para pilotaje beta histórico | `content/items/beta-v1/` |
| Material fuera de beta | `content/items/no-beta-v1/` |
| Indice maestro beta | `content/restructuring-v1/00-beta-v1/indice-maestro-beta.csv` |
| Vistas beta por perfil | `content/restructuring-v1/00-beta-v1/piloto-v1/por-perfil/` |

---

## Regla Operativa Actual

Estado actual de gobernanza:
- incremental;
- advisory-heavy;
- endurecimiento progresivo.

Politica operativa vigente:
- trabajar preferiblemente directo sobre `master` cuando el alcance sea pequeño y seguro;
- usar rama aislada cuando el cambio sea amplio, experimental o requiera revisión antes de integrar;
- realizar commits pequenos y trazables;
- evitar mega commits;
- evitar ramas auxiliares innecesarias;
- evitar drift silencioso;
- mantener sincronizacion documental incremental.

Todavia NO existe enforcement automatico fuerte para todos los flujos.
La disciplina operacional sigue dependiendo parcialmente de:
- comportamiento humano;
- trazabilidad explicita;
- revisiones operativas;
- warnings advisory.

---

## Documentation Synchronization

Antes de cerrar cualquier cambio relevante:

1. revisar `docs/05-ops/documentation-trigger-map.md`;
2. identificar archivos relacionados;
3. actualizar documentos relacionados o registrar deuda tecnica explicita;
4. no asumir que la documentacion sigue alineada automaticamente.

Si el agente deliberadamente NO actualiza documentacion relacionada, debe dejar evidencia:
- commit;
- PR;
- reporte de sesion;
- change-log;
- comentario operacional.

Ejemplo:

```text
Known documentation drift accepted:
- docs/project/status.md pending alignment
- taxonomy docs pending review
```

---

## Metadata Operacional Extendida

Todo cambio relevante debe intentar registrar:

| Campo | Estado recomendado |
|---|---|
| Agent | Obligatorio |
| Via | Obligatorio |
| Contributor | Obligatorio |
| Environment | Obligatorio |
| Validation | Obligatorio |
| Runtime-Verified | Recomendado |
| Related-Files | Recomendado |
| Governance-Context | Recomendado |
| Shell | Recomendado |
| Timezone | Recomendado |

---

## Regla de evidencia

No declarar:
- runtime verificado;
- release exitoso;
- QA aprobado;
- sprint cerrado;
- sincronizacion completa;
- drift resuelto;
- migracion aplicada;
- targeting desplegado;

sin evidencia minima.

Distinguir siempre:
- evidencia positiva;
- falta de evidencia;
- evidencia negativa.

---

## Regla contextual de fuente de verdad

- si esta instruccion vive dentro del repo o se ejecuta con contexto directo de GitHub, trata `https://github.com/MarlonMedellin/GanaConMerito` como fuente de verdad operativa
- si esta instruccion vive dentro del entorno local o VPS, trata `~/.openclaw/product` como copia sincronizada de trabajo, no como verdad final aislada
- en ambos casos, el humano debe indicar explicitamente donde se debe trabajar cuando el contexto no sea inequivoco
- si el humano no indico el lugar de trabajo y el contexto no lo hace inequivoco, pide esa precision antes de tocar codigo, docs o deploy

---

## Lugar de Trabajo

Antes de ejecutar cualquier cambio relevante, el humano debe indicar explicitamente en cual de estos entornos se trabajara cuando el contexto no sea obvio:

| Entorno | Ruta canonica | Cuando aplica |
|---------|---------------|---------------|
| GitHub / Repo remoto | `https://github.com/MarlonMedellin/GanaConMerito` | contexto de repo online |
| Local / VPS | `~/.openclaw/product` | trabajo desde terminal local o VPS |

Si el agente no puede determinar inequivocamente el entorno de trabajo, debe detenerse y solicitar precision.

---

## Convencion de Commits

Todo commit generado por un agente IA debe incluir de forma visible:

- agente;
- via;
- contributor;
- entorno;
- validacion ejecutada.

Formato recomendado:

```text
tipo(AGENTE/VIA): resumen breve
```

Tipos validos:
- feat
- fix
- docs
- governance
- refactor
- test
- chore

---

## Trailers Operacionales Recomendados

```text
Agent:
Via:
Contributor:
Environment:
Shell:
Timezone:
Validation:
Runtime-Verified:
Related-Files:
Governance-Context:
```

---

## Disciplina Operativa para VPS

Si el trabajo toca el VPS o se valida alli:

1. actualizar primero `~/.openclaw/product`;
2. alinear despues `/opt/gcm/app`;
3. reconstruir/reiniciar/verificar Docker si aplica;
4. validar runtime;
5. registrar evidencia.

No declarar cierre operacional si esos pasos no fueron verificados.

---

## Uso de GitHub

Usa GitHub para inspeccionar:
- commits;
- archivos;
- drift;
- documentacion;
- runtime claims;
- evidencia operacional.

Asume multiples origenes concurrentes:
- ChatGPT;
- Codex;
- Google Antigravity;
- trabajo local/VPS.

Ninguna copia local debe tratarse como verdad final aislada.

---

## Entrega Final Obligatoria

Al cerrar cualquier tarea relevante, el agente debe reportar:

- objetivo cumplido o no;
- alcance real;
- archivos tocados;
- archivos creados;
- archivos deliberadamente no tocados;
- validaciones ejecutadas;
- resultado de validaciones;
- riesgos abiertos;
- drift aceptado;
- runtime verificado o no;
- commit creado;
- metadata operacional utilizada.

---

## Referencia cruzada

→ `docs/03-architecture/question-bank-knowledge-targeting-architecture.md`
→ `docs/05-ops/documentation-trigger-map.md`
→ `docs/05-ops/agent-traceability.md`
→ `docs/04-quality/quality-gates.md`
→ `docs/05-ops/runtime-and-release.md`
→ `docs/project/status.md`
