# Question Bank V4

Banco maestro de preguntas nuevas del proyecto **GanaConMerito**.

## Estado actual

**Corte canónico:** [`MANIFEST.json`](./MANIFEST.json).

El único conteo oficial vigente es `expectedItemCount` en ese manifiesto. El mismo
archivo conserva el commit fuente, la lista ordenada y el hash de IDs, el hash del
corpus, el tamaño total, las distribuciones agregadas, el contrato, las taxonomías,
los IDs retirados y el estado editorial. Los reportes `COVERAGE-*`, `AUDIT-*`,
`EXPANSION-*` y `REMEDIATION-*` son evidencia histórica; no compiten con el
manifiesto como fuente del corte actual.

El estado `FROZEN / APPROVED` es exclusivamente editorial y de repositorio. El
manifiesto declara expresamente que no autoriza migración Supabase ni activación de
runtime. Cualquier expansión posterior requiere un nuevo cierre editorial y una
regeneración coherente del manifiesto.

Para validar el corte:

```bash
npm run content:validate:v4
python3 scripts/question_bank_v4_manifest.py --check
```

Solo al aprobar un nuevo corte se regenera con
`python3 scripts/question_bank_v4_manifest.py --write`; un cambio en reactivos,
contrato o taxonomía sin la actualización correspondiente del manifiesto falla en CI.

## Propósito

Cada pregunta de este banco es un **reactivo nuevo y completo**, creado desde cero
a partir de materia prima legacy (contexto y enunciado antiguos usados solo como
inspiración temática). La fábrica editorial que lo produce es el agente
**GCM Master Question Factory — Docentes** (`gcm-master-question-factory-docentes`).

La definición completa de campos, estados, seguridad y reglas de serialización está
en [CONTRATO-EDITORIAL-V4.md](./CONTRATO-EDITORIAL-V4.md). Este README no es el
contrato de runtime ni autoriza activar V4 en la aplicación.

Regla central:

> **Rescatar conocimiento útil, no preguntas antiguas.**
> Una pregunta sale completa o no sale (`DISCARD`).

## Suite V4 obligatoria

Todo registro legacy de preguntas debe pasar por el par de skills adecuado,
ubicado en `docs/ai/skills/`:

| Ambito | Produccion | Revision independiente |
|---|---|---|
| Docentes | `GCM-Master-Question-Factory-Docentes.md` | `GCM-Adversarial-Item-Auditor-Docentes.md` |
| OPEC general/especifica | `GCM-Master-Question-Factory-OPEC-General.md` | `GCM-Adversarial-Item-Auditor-OPEC-General.md` |

La fabrica decide `PRODUCE` o `DISCARD`; el auditor decide `APPROVED` o
`REJECTED`. La serializacion en este banco requiere ambos resultados positivos.
El registro anterior no se repara: sus opciones, clave, explicaciones, metadatos
e identificadores quedan fuera del proceso. Esta suite revisa contenido editorial
legacy, no codigo fuente legacy de la aplicacion.

Las skills consumen la taxonomía vigente desde `content/question-bank-v4/taxonomy/*.json`; no mantienen una lista paralela de tópicos. Las ampliaciones se documentan en los catálogos y en `taxonomy/README.md`.

## Arquitectura de conocimiento y destinatarios

V4 separa tres funciones que no deben confundirse:

1. **conocimiento fuente**: normas, teoría, guías, documentos técnicos y temarios;
2. **taxonomía evaluativa**: qué constructo mide el reactivo;
3. **targeting**: para qué familia, perfil/cargo u OPEC resulta aplicable.

La biblioteca compartida de conocimiento vive en:

```text
content/knowledge-base/
```

El catálogo de destinatarios vive en:

```text
content/targeting/
```

La arquitectura completa y la propuesta para Supabase están en:

`docs/03-architecture/question-bank-knowledge-targeting-architecture.md`

El Markdown de temas docentes que originó la expansión debe conservarse como fuente
de planeación en `content/knowledge-base/themes/docentes/temario-base.md` cuando se
incorpore desde su documento original. Un temario no crea automáticamente topics ni
reactivos.

## Perfiles/cargos y OPEC

Para docentes, los perfiles canónicos iniciales son:

- `rector_director_rural`
- `coordinador`
- `docente_aula_preescolar`
- `docente_aula_basica_primaria`
- `docente_aula_secundaria_media`
- `docente_orientador`

Cargo/perfil y OPEC funcionan como destinos equivalentes para selección, pero no
son el mismo identificador: el perfil es reusable entre convocatorias y la OPEC es
una instancia concreta. Una pregunta general para coordinadores no debe duplicarse
por cada OPEC de coordinador.

El corte V4 congelado no se reescribe para agregar esta segmentación. La adopción
por perfil/cargo debe hacerse como capa externa o en una evolución explícita del
contrato V4 y del esquema Supabase.

## Estructura

```text
content/question-bank-v4/
├── README.md
├── MANIFEST.json             # Corte canónico y hashes reproducibles
├── CONTRATO-EDITORIAL-V4.md
├── taxonomy/
│   ├── domains.json          # Áreas amplias de conocimiento/desempeño
│   ├── topics.json           # Temas específicos evaluados
│   ├── competencies.json     # Capacidades cognitivas principales
│   └── question-types.json   # Tipos de pregunta, niveles cognitivos y dificultad
├── sources/                  # Compatibilidad/índices locales V4; la biblioteca compartida es knowledge-base
│   ├── normative/
│   └── academic/
└── items/
    ├── docentes/             # Preguntas maestras para concursos docentes (DOC-######.json)
    └── general/              # Futura fábrica general (GEN-######.json)
```

### Estructura histórica futura

Los documentos `AUDIT-*`, `COVERAGE-*`, `EXPANSION-*`, `REAUDIT-*` y
`REMEDIATION-*` son evidencia histórica. Se propone moverlos, sin alterar su
contenido, a:

```text
history/
├── expansion/
├── audits/
├── remediation/
└── snapshots/
```

Ese movimiento se realizará en una tarea separada. Hasta entonces, `MANIFEST.json`
sigue siendo la única fuente de estado vigente.

## Reglas del banco

- **Una pregunta = un JSON.** Cada archivo contiene exactamente una pregunta con el
  contrato canónico: `id`, `domain`, `topic`, `competency`, `questionType`,
  `cognitiveLevel`, `context`, `stem`, `options` (A–D), `correctAnswer`,
  `explanations`, `hint`, `learningNote`, `source.reference`, `estimatedDifficulty`.
- **Sin subcarpetas por tema, competencia, OPEC o dificultad.** Esas dimensiones son
  metadatos; la selección para prácticas, simulacros o tutoría la hace el backend.
- **Nunca sobrescribir un id.** El siguiente identificador se determina leyendo el
  directorio destino (`DOC-000001`, `DOC-000002`, …). Un `REJECTED` no libera su identificador.
- **Sin deuda editorial:** no se almacenan borradores, placeholders, registros de
  descarte ni preguntas parciales.
- **Evidencia verificable:** toda afirmación sustantiva se apoya en fuente oficial o
  académica; no se fabrican normas, decretos, autores ni datos.
- **QA adversarial obligatorio:** cada reactivo supera internamente pruebas de
  constructo, evidencia, clave única, distractores plausibles, pistas accidentales,
  realismo evaluativo y valor pedagógico antes de serializarse.
- **Deduplicación por constructo:** no basta buscar frases o escenarios parecidos; antes de producir se revisan también autor/teoría, constructo, fuente y lotes V4 previos.
- **No duplicar por cargo/OPEC:** la aplicabilidad a varios perfiles debe modelarse como targeting, no copiando el reactivo.

## Taxonomía

Los catálogos de `taxonomy/` son los valores preferidos para clasificar **qué se
evalúa**. Pueden ampliarse solo cuando un constructo genuinamente nuevo lo exija;
nunca para inflar etiquetas. Toda ampliación debe documentar la necesidad editorial
y demostrar que reutilizar un tópico existente produciría una clasificación engañosa
o excesivamente genérica.

Los perfiles/cargos y OPEC no pertenecen a `taxonomy/`; pertenecen a la capa de
targeting.

## Calidad

`estimatedDifficulty` es una **estimación editorial**, no dificultad psicométrica
observada. La calidad psicométrica real solo podrá establecerse después del pilotaje
con datos observados.
