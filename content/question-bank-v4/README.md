# Question Bank V4

Banco maestro de preguntas nuevas del proyecto **GanaConMerito**.

## Estado actual

**Corte:** 2026-08-22  
**Estado autoritativo de partida:** `master` integra la remediación A+B en `68dfae07baaafa59e00fa7a085ac4b903b62aa07`  
**Corpus activo validado al abrir C2:** **248 reactivos**  
**Fase C1:** **histórico cerrado — 2 reactivos nuevos + 2 reclasificaciones**  
**Fase C2:** **cerrada selectivamente — 0 reactivos nuevos**  
**Rama C2:** `v4-phase-c2-selective-20260822`  
**Nuevos C1 aprobados:** `DOC-001292`, `DOC-001293`  
**Reclasificados C1:** `DOC-001104`, `DOC-001110`  
**IDs retirados/no reutilizables:** `DOC-001258`, `DOC-001259`, `DOC-001261`, `DOC-001265`, `DOC-001268`, `DOC-001291`, `DOC-001294` y los rechazados históricos documentados en A+B  
**Snapshot C2:** [`COVERAGE-AFTER-PHASE-C2-20260822.json`](./COVERAGE-AFTER-PHASE-C2-20260822.json)  
**Auditoría C2:** [`AUDIT-PHASE-C2-20260822.md`](./AUDIT-PHASE-C2-20260822.md)  
**Informe C2:** [`EXPANSION-PHASE-C2-SELECTIVE-20260822.md`](./EXPANSION-PHASE-C2-SELECTIVE-20260822.md)

La remediación A+B está integrada en `master` y constituye la base autoritativa de C2. C1 permanece cerrada: `DOC-001104`, `DOC-001110`, `DOC-001292` y `DOC-001293` siguen activos; `DOC-001291` y `DOC-001294` permanecen retirados.

C2 investigó de forma selectiva práctica de recuperación, ejemplos resueltos/carga cognitiva, práctica intercalada y gestión preventiva del aula. Ninguna oportunidad superó simultáneamente los gates de novedad conceptual, deduplicación profunda, transferibilidad y soporte de la condición decisiva. Por ello C2 cierra con **0 serializaciones** y `DOC-001305` permanece libre.

La taxonomía vigente incorpora los tópicos documentados en `taxonomy/`; los catálogos siguen siendo la fuente canónica. La frecuencia baja de un dominio, tópico o competencia no constituye por sí sola autorización para expandirlo.

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
- **Deduplicación por constructo:** no basta buscar frases o escenarios parecidos; antes de producir se revisan también autor/teoría, constructo, fuente y lotes V4 previos.

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
