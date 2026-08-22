# Question Bank V4

Banco maestro de preguntas nuevas del proyecto **GanaConMerito**.

## Estado actual

**Corte:** 2026-08-22  
**Corte congelado en `master` para Sprint 48:** **224 reactivos aprobados**  
**Rama de expansión:** `v4-post-sprint48-expansion`  
**Corpus físico en la rama:** **258 reactivos**  
**Aprobados editoriales efectivos en la rama:** **258**  
**Fase B:** **cerrada y reauditada — 30/30 APPROVED**  
**Fase C1:** **cerrada — 4/4 APPROVED (`DOC-001291`–`DOC-001294`)**  
**IDs retirados/no reutilizables de Fase B:** `DOC-001258`, `DOC-001259`, `DOC-001261`, `DOC-001265`, `DOC-001268`  
**Snapshot vigente:** [`COVERAGE-AFTER-PHASE-C1-20260822.json`](./COVERAGE-AFTER-PHASE-C1-20260822.json)  
**Auditoría C1:** [`AUDIT-PHASE-C1-20260822.md`](./AUDIT-PHASE-C1-20260822.md)  
**Plan selectivo:** [`EXPANSION-PHASE-C-SELECTIVE-20260822.md`](./EXPANSION-PHASE-C-SELECTIVE-20260822.md)

`master` permanece congelada en 224 reactivos durante Sprint 48. La rama contiene esos 224 más 30 reactivos aprobados de Fase B y 4 reactivos aprobados de C1. Los cinco IDs rechazados durante la primera auditoría de B permanecen retirados y no se reutilizan.

C1 amplía `desarrollo_aprendizaje` de 13 a 17 reactivos y añade el tópico `aprendizaje_y_desarrollo_cognitivo` con cuatro constructos: ZDP/apoyo temporal, conocimiento previo/aprendizaje significativo, asimilación-acomodación y metacognición/autorregulación. Las claves C1 están distribuidas `A=1`, `B=1`, `C=1`, `D=1` y no presentan outliers de longitud según el gate de la rama.

La taxonomía post-Sprint 48 de esta rama incorpora cuatro tópicos con justificación editorial explícita: `competencias_comportamentales`, `educacion_inicial_transicion`, `razonamiento_cuantitativo` y `aprendizaje_y_desarrollo_cognitivo`. Los catálogos de `taxonomy/` siguen siendo la fuente canónica.

**C2 no está autorizado automáticamente.** El siguiente paso es revisar cobertura sobre 258 y justificar cualquier expansión adicional. El próximo identificador nunca usado es `DOC-001295`.

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

## Estructura

```text
content/question-bank-v4/
├── README.md
├── taxonomy/
│   ├── domains.json          # Áreas amplias de conocimiento/desempeño
│   ├── topics.json           # Temas específicos evaluados
│   ├── competencies.json     # Capacidades cognitivas principales
│   └── question-types.json   # Tipos de pregunta, niveles cognitivos y dificultad
├── sources/
│   ├── normative/            # Corpus normativo estructural (MEN, CNSC, leyes, decretos)
│   └── academic/             # Corpus académico/pedagógico estructural (ICFES, autores)
└── items/
    ├── docentes/             # Preguntas maestras para concursos docentes (DOC-######.json)
    └── general/              # Futura fábrica general (GEN-######.json)
```

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

## Taxonomía

Los catálogos de `taxonomy/` son los valores preferidos para clasificar.
Pueden ampliarse solo cuando un constructo genuinamente nuevo lo exija;
nunca para inflar etiquetas. Toda ampliación debe documentar la necesidad editorial
y demostrar que reutilizar un tópico existente produciría una clasificación engañosa
o excesivamente genérica.

## Calidad

`estimatedDifficulty` es una **estimación editorial**, no dificultad psicométrica
observada. La calidad psicométrica real solo podrá establecerse después del pilotaje
con datos observados.
