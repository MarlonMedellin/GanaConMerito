# Question Bank V4

Banco maestro de preguntas nuevas del proyecto **GanaConMerito**.

## Estado actual

**Corte canónico:** [`MANIFEST.json`](./MANIFEST.json).

El único conteo oficial vigente es `expectedItemCount` en ese manifiesto. El mismo
archivo conserva el commit fuente, la lista ordenada y el hash de IDs, el hash del
corpus, el tamaño total, las distribuciones agregadas, el contrato, las taxonomías,
los IDs retirados y el estado editorial. Los reportes históricos no compiten con el
manifiesto como fuente del corte actual.

La Fase C2 queda preservada como evidencia histórica en:

- `history/expansion/EXPANSION-PHASE-C2-SELECTIVE-20260822.md`;
- `history/audits/AUDIT-PHASE-C2-20260822.*`;
- `history/snapshots/COVERAGE-AFTER-PHASE-C2-20260822.json`.

C2 cerró con **0 reactivos nuevos** y no modificó el corpus; por tanto, tampoco
reemplaza ni altera el corte canónico del manifiesto.

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

El Markdown original de temas docentes se conserva como fuente de planeación en
`content/knowledge-base/themes/docentes/temario-base.md`. Es insumo de gap analysis
y cobertura, no un catálogo automático de `topic` ni autorización para crear
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
├── legacy-processing-register.csv
├── items/
│   ├── docentes/             # Reactivos maestros DOC-######.json
│   └── general/              # Futura fábrica general GEN-######.json
├── taxonomy/                 # Qué evalúa cada reactivo
├── sources/                  # Compatibilidad/índices locales V4
├── state/                    # Estado auxiliar vigente; MANIFEST permanece en raíz
│   └── README.md
└── history/                  # Evidencia histórica, nunca fuente runtime
    ├── README.md
    ├── INDEX.md              # Secuencia expansión → auditoría → remediación → snapshot
    ├── expansion/
    ├── audits/
    ├── remediation/
    └── snapshots/
```

La biblioteca normativa, académica y técnica transversal no se duplica aquí: vive
en `content/knowledge-base/`. La aplicabilidad por familia, perfil/cargo y OPEC vive
en `content/targeting/`.

## Historial y migración de estructura

Los artefactos históricos `EXPANSION-*`, `AUDIT-*`, `REAUDIT-*`, `REMEDIATION-*` y
`COVERAGE-*` fueron retirados de la raíz operativa y organizados bajo `history/`.
El punto de entrada para reconstruir la evolución editorial es
[`history/INDEX.md`](./history/INDEX.md).

Este movimiento reorganiza evidencia; no cambia el corpus congelado. Los nombres
históricos como `temas.md`, `temas(1).md` o rutas legacy de perfiles se preservan
en los relatos originales cuando forman parte de la trazabilidad y se resolverán
mediante mapas de provenance, no reescribiendo retrospectivamente la historia.

`MANIFEST.json` **no se mueve** a `state/`: scripts, CI y el flujo de importación V4
lo consumen actualmente en la raíz y seguirá allí hasta que una migración explícita
de rutas actualice y valide todos los consumidores.

`legacy-processing-register.csv` tampoco se mueve en esta fase porque tiene
consumidores operativos y de importación documentados. Su eventual reubicación exige
una actualización coordinada de esos consumidores.

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
