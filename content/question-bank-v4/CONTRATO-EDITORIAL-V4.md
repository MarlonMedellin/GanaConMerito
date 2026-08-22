# Contrato editorial del banco de preguntas V4

**Estado:** canónico para la producción editorial V4; no activa por sí mismo el runtime.
**Ámbito:** reactivos nuevos creados desde material legacy de preguntas o desde una OPEC/fuente autorizada.

## 1. Decisión de arquitectura

V4 es un banco nuevo. Un archivo JSON V4 es el artefacto editorial canónico de un
reactivo terminado; no es una conversión de Markdown ni de un ítem previo.

Los registros legacy solo pueden aportar `context`, `stem` y temática recuperable.
No se copian opciones, clave, explicaciones, identificadores, metadatos ni fuentes
sin verificar. Cada entrada se procesa individualmente por la fábrica adecuada y
por su auditor adversarial antes de entrar a `items/`.

Este contrato no reemplaza todavía el contrato runtime de `item_bank`. La
activación requiere la adopción técnica documentada en
`docs/architecture/question-bank-v4-adoption.md` y
`docs/database/question-bank-v4-contract.md`.

## 2. Estructura de archivos

```text
content/question-bank-v4/
├── CONTRATO-EDITORIAL-V4.md
├── README.md
├── taxonomy/
│   ├── domains.json
│   ├── topics.json
│   ├── competencies.json
│   └── question-types.json
├── sources/
│   ├── normative/
│   └── academic/
└── items/
    ├── docentes/       # DOC-000001.json, una pregunta por archivo
    └── general/        # GEN-000001.json, una pregunta por archivo
```

No se crean subcarpetas por tema, dificultad, competencia u OPEC: esas propiedades
son metadatos. Los ids son inmutables y no se reutilizan.

## 3. Contrato del reactivo

Todo archivo en `items/docentes/` o `items/general/` contiene exactamente un
objeto JSON con este contrato:

```json
{
  "id": "DOC-000001",
  "scope": "general",
  "opecId": null,
  "domain": "evaluacion",
  "topic": "evaluacion_formativa",
  "competency": "decision_pedagogica",
  "questionType": "situational",
  "cognitiveLevel": "judge",
  "context": "...",
  "stem": "...",
  "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "correctAnswer": "C",
  "explanations": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "hint": "...",
  "learningNote": "...",
  "source": { "reference": "...", "locator": "...", "url": "..." },
  "estimatedDifficulty": "medium"
}
```

### Reglas de campos

- `id`: `DOC-######` para docentes o `GEN-######` para generales; único e inmutable.
- `scope`: `general` u `opec_specific`. Si es específico, `opecId` es obligatorio;
  si es general, `opecId` debe ser `null` u omitirse.
- `domain`, `topic`, `competency`, `questionType` y `cognitiveLevel`: valores de los
  catálogos V4. Un catálogo se amplía solo por necesidad editorial real.
- `context` y `stem`: autosuficientes, consistentes y con una sola tarea evaluable.
- `options`: exactamente A–D; textos no vacíos, comparables y sin pistas de forma.
- `correctAnswer`: exactamente una de A–D.
- `explanations`: exactamente A–D. Explican la decisión después de responder; no
  sustituyen la evidencia de la fuente.
- `hint`: ayuda previa que guía el análisis sin revelar la clave.
- `learningNote`: síntesis pedagógica posterior, sustentada y consistente con la clave.
- `source`: `reference` es obligatorio; `locator` y `url` son obligatorios cuando
  existan para la fuente. Una pregunta normativa requiere fuente oficial vigente.
- `estimatedDifficulty`: `low`, `medium` o `high`; es estimación editorial, no
  parámetro psicométrico observado.

`source`, `scope` y `opecId` se incorporan como campos obligatorios de todo nuevo
ítem V4 aunque el primer ejemplo histórico aún no los materialice completamente.

## 4. Estados y gates

Los estados de la fábrica no se guardan dentro de un archivo V4 final:

```text
entrada legacy → PRODUCE | DISCARD
PRODUCE → auditor independiente → APPROVED | REJECTED
APPROVED → serialización V4 → validación técnica → candidato a importación
```

Solo un ítem `APPROVED` y técnicamente válido se serializa. `DISCARD` y
`REJECTED` no se convierten en preguntas incompletas ni entran al runtime.

## 5. Calidad mínima

Antes de serializar se exige fuente verificable, pertinencia de OPEC cuando
corresponda, constructo relevante, una sola mejor respuesta, cuatro distractores
plausibles, ausencia de pistas lingüísticas, demanda cognitiva real, feedback
coherente y ausencia de duplicación conceptual frente al banco V4.

La calidad psicométrica solo se confirma tras pilotaje. Hasta entonces,
`estimatedDifficulty` no debe usarse para afirmar calibración estadística.

## 6. Seguridad de producto

La clave, explicaciones y `learningNote` son datos de evaluación. El cliente solo
recibe contexto, stem, opciones y metadatos de presentación antes de contestar.
El backend evalúa la respuesta y, después, puede entregar feedback autorizado.

## 7. Fuentes de autoridad

1. Este contrato para forma y reglas de ítems V4.
2. Las cuatro skills en `docs/ai/skills/` para producción y auditoría.
3. Los catálogos de `taxonomy/` para valores controlados.
4. `docs/database/question-bank-v4-contract.md` para persistencia y activación.
5. `docs/architecture/question-bank-v4-adoption.md` para el plan de integración.
