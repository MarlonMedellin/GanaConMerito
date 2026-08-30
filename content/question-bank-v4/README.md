# Question Bank V4

Banco maestro de preguntas nuevas del proyecto **GanaConMerito**.

## Estado actual

**Corte canónico:** [`MANIFEST.json`](./MANIFEST.json).

**Ventana de evolución V4.1 (2026-08-29):** el freeze editorial anterior se encuentra temporalmente levantado de forma **controlada y limitada** para ejecutar [`PRD-V4.1-KNOWLEDGE-BASE-TUTOR-READINESS.md`](./PRD-V4.1-KNOWLEDGE-BASE-TUTOR-READINESS.md). El alcance y las prohibiciones están registrados en [`state/V4.1-CONTROLLED-UNFREEZE-20260829.md`](./state/V4.1-CONTROLLED-UNFREEZE-20260829.md). Esto no autoriza activación remota, migraciones ni reescritura masiva del corpus. Finalizados los gates V4.1, el banco debe volver a `FROZEN / APPROVED` antes de continuar el cierre del Tutor GCM.

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

El estado `FROZEN / APPROVED` registrado en el manifiesto identifica el último corte editorial cerrado. La ventana V4.1 cerró formalmente el 2026-08-30 (ver [V4.1-FINAL-FREEZE-20260830.md](state/V4.1-FINAL-FREEZE-20260830.md)). El manifiesto vuelve a ser el corte canónico activo, pero el freeze no equivale a deploy, ni autoriza por sí mismo migración Supabase ni activación de runtime.

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

La evolución V4.1 mantiene esta separación. La clasificación de conocimiento aprobada usa seis niveles semánticos: **A Concurso vigente, B normativa estructural, C actuación/procedimientos, D referentes pedagógicos-curriculares, E didáctica y saber disciplinar, F histórico**. Estos niveles pertenecen a Knowledge Base; no se añaden como estructura obligatoria a cada reactivo.

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

El corte V4 congelado no se reescribe masivamente para agregar esta segmentación. La adopción
por perfil/cargo debe hacerse como capa externa o en una evolución explícita del
contrato V4 y del esquema Supabase.

## Estructura

```text
content/question-bank-v4/
├── README.md
├── MANIFEST.json             # Corte canónico y hashes reproducibles
├── CONTRATO-EDITORIAL-V4.md
├── PRD-V4.1-KNOWLEDGE-BASE-TUTOR-READINESS.md
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

Los artefactos `EXPANSION-*`, `AUDIT-*`, `REAUDIT-*`, `REMEDIATION-*` y
`COVERAGE-*` históricos están bajo `history/` y no constituyen estado operativo.
`MANIFEST.json` permanece en la raíz porque tiene consumidores operativos.
`legacy-processing-register.csv` permanece igualmente en raíz mientras existan esos consumidores.

## Reglas del banco

- **Una pregunta = un JSON.** Cada archivo contiene exactamente una pregunta con el contrato canónico: `id`, `scope`, `domain`, `topic`, `competency`, `questionType`, `cognitiveLevel`, `context`, `stem`, `options` (A–D), `correctAnswer`, `explanations`, `hint`, `learningNote`, `source.reference`, `estimatedDifficulty` y `opecId` solo cuando corresponda.
- **V4.1 no añade A–F al JSON.** A–F clasifica Knowledge Base, no el reactivo.
- **Cambio mínimo candidato:** `source.sourceId` puede aprobarse como campo opcional tras validación técnica; no implica backfill obligatorio.
- **Sin subcarpetas por tema, competencia, OPEC o dificultad.** Esas dimensiones son metadatos; la selección para prácticas, simulacros o tutoría la hace el backend.
- **Nunca sobrescribir un id.**
- **Sin deuda editorial:** no se almacenan borradores, placeholders, registros de descarte ni preguntas parciales.
- **Evidencia verificable:** toda afirmación sustantiva se apoya en fuente oficial o académica; no se fabrican normas, decretos, autores ni datos.
- **QA adversarial obligatorio.**
- **Deduplicación por constructo.**
- **No duplicar por cargo/OPEC.**

## Taxonomía

Los catálogos de `taxonomy/` clasifican **qué se evalúa**. Pueden ampliarse solo cuando un constructo genuinamente nuevo lo exija; nunca para replicar A–F o inflar etiquetas. Los perfiles/cargos y OPEC pertenecen a targeting.

## Calidad

`estimatedDifficulty` es una **estimación editorial**, no dificultad psicométrica observada. La calidad psicométrica real solo podrá establecerse después del pilotaje con datos observados.
