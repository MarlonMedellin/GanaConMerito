# Question Bank V4

Banco maestro de preguntas nuevas del proyecto **GanaConMerito**.

## Estado actual

**Corte:** 2026-08-22  
**Corte congelado en `master` para Sprint 48:** **224 reactivos aprobados**  
**Rama de expansión:** `v4-post-sprint48-expansion`  
**Corpus físico en la rama:** **254 reactivos**  
**Aprobados editoriales efectivos en la rama:** **249**  
**Fase:** **Fase B auditada — 25 APPROVED / 5 REJECTED; lote BLOQUEADO**  
**Rango nuevo:** **`DOC-001256`–`DOC-001285`**  
**Snapshot material B4:** [`COVERAGE-AFTER-PHASE-B4-20260822.json`](./COVERAGE-AFTER-PHASE-B4-20260822.json)  
**Auditoría adversarial:** [`AUDIT-PHASE-B-20260822.md`](./AUDIT-PHASE-B-20260822.md)  
**Plan y gate:** [`EXPANSION-PHASE-B-HIGH-RETURN-20260822.md`](./EXPANSION-PHASE-B-HIGH-RETURN-20260822.md)

`master` permanece congelada en 224 reactivos durante Sprint 48. Los 30 archivos de Fase B existen únicamente en `v4-post-sprint48-expansion` y no representan activación, importación ni cambio del corte productivo.

La auditoría adversarial posterior a B4 aprobó individualmente 25 reactivos y rechazó 5: `DOC-001258`, `DOC-001259`, `DOC-001261`, `DOC-001265` y `DOC-001268`. Los rechazos responden a clasificación de competencia/tipo o demanda cognitiva, no a errores de vigencia de las fuentes.

Además, la Fase B falla como lote por integridad de opciones: las claves del delta de 30 están distribuidas `A=11`, `B=17`, `C=2`, `D=0`, con recurrencia de alternativas correctas más desarrolladas que los distractores. Por tanto, **no se autoriza B5 ni el uso de `DOC-001286`** hasta resolver los rechazados, controlar pistas de forma y reauditar el delta.

La taxonomía de esta rama incorporó tres tópicos con justificación editorial fuerte: `competencias_comportamentales`, `educacion_inicial_transicion` y `razonamiento_cuantitativo`. B2 reutilizó `comprension_lectora`, y B4 reutilizó `modelizacion` solo cuando el reactivo realmente construye o interpreta un modelo. La documentación detallada está sincronizada en `taxonomy/README.md`.

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

Las skills consumen la taxonomía vigente desde `content/question-bank-v4/taxonomy/*.json`; no mantienen una lista paralela de tópicos. Por eso las ampliaciones de Fase B se referencian en los catálogos y en `taxonomy/README.md`, sin duplicar nombres de tópicos dentro de las skills.

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
  directorio destino (`DOC-000001`, `DOC-000002`, …).
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
