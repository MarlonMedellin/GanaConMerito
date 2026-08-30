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
├── legacy-processing-register.csv
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
  "source": { "reference": "...", "sourceId": "..." },
  "estimatedDifficulty": "medium"
}
```

### Reglas de campos

- `id`: `DOC-######` para docentes o `GEN-######` para generales; único e inmutable.
- `scope`: `general` u `opec_specific`. Si es específico, `opecId` es obligatorio;
  si es general, `opecId` se omite (no usar `null`).
- `domain`, `topic`, `competency`, `questionType` y `cognitiveLevel`: valores de los
  catálogos V4. Un catálogo se amplía solo por necesidad editorial real.
- `context` y `stem`: autosuficientes, consistentes y con una sola tarea evaluable.
- `options`: exactamente A–D; textos no vacíos, comparables y sin pistas de forma.
- `correctAnswer`: exactamente una de A–D.
- `explanations`: exactamente A–D. Explican la decisión después de responder; no
  sustituyen la evidencia de la fuente.
- `hint`: ayuda previa que guía el análisis sin revelar la clave.
- `learningNote`: síntesis pedagógica posterior, sustentada y consistente con la clave.
- `source`: `reference` obligatorio y `sourceId` V4.1. `reference` conserva una
  etiqueta legible por humanos; `sourceId` enlaza el reactivo con una fuente
  canónica de `content/knowledge-base/catalog/source-inventory.json`. Durante el
  backfill controlado de V4.1 pueden existir ítems legacy-V4 sin `sourceId`, pero
  el re-freeze V4.1 exige 100 % de reactivos productivos con `sourceId` resoluble.
  El `locator`/`url` de verificación vive en Knowledge Base o en
  `editorialRunContext` durante fábrica y auditoría, no en el ítem. Una pregunta
  normativa requiere fuente oficial vigente y una referencia específica (norma +
  artículo o sección cuando aplique).
- `estimatedDifficulty`: `low`, `medium` o `high`; es estimación editorial, no
  parámetro psicométrico observado.

`scope` y `source.reference` son obligatorios en todo ítem; `source.sourceId` es
obligatorio para nuevo contenido V4.1 y para el freeze final V4.1; `opecId` solo
en `opec_specific`.

## 4. Estados y gates

Los estados de la fábrica no se guardan dentro de un archivo V4 final:

```text
entrada legacy → PRODUCE | DISCARD
PRODUCE → auditor independiente → APPROVED | REJECTED
APPROVED → serialización V4 → validación técnica → candidato a importación
(tras cerrar cada entrada: registrar en legacy-processing-register.csv)
```

Solo un ítem `APPROVED` y técnicamente válido se serializa. `DISCARD` y
`REJECTED` no se convierten en preguntas incompletas ni entran al runtime.

## 5. Registro de procesamiento legacy (no reproceso)

`legacy-processing-register.csv` es el registro maestro de no reproceso: una fila
por cada entrada legacy ya procesada, con independencia del resultado. Lo
diligencia el **orquestador** —no la fábrica ni el auditor, que solo devuelven
JSON— tras cerrar cada entrada.

Columnas:

```text
batch_id, processed_at, legacy_id, legacy_path, legacy_blob_sha,
factory_agent, factory_decision, audit_agent, audit_decision,
v4_item_id, v4_item_path, status, notes
```

Reglas:

- **Una fila por entrada legacy**, tanto en `PRODUCE` como en `DISCARD`.
- `batch_id`: identificador del lote (p. ej. `DOC-LEGACY-YYYYMMDD-NNN`).
- `processed_at`: fecha `YYYY-MM-DD`.
- `legacy_blob_sha`: SHA git del archivo legacy procesado
  (`git rev-parse HEAD:<ruta>` o `git hash-object <ruta>`); permite deduplicar por
  contenido aunque el archivo se mueva o se renombre.
- `factory_agent`: identificador de la IA/agente que ejecutó la fase de creación
  (fábrica), p. ej. `deepseek-v4-pro`, `Codex`, `GPT-5.3-Codex`.
- `audit_agent`: identificador de la IA/agente que ejecutó la fase de auditoría.
- `factory_decision`: `PRODUCE` o `DISCARD`.
- `audit_decision`: `APPROVED`, `REJECTED` o `NOT_APPLICABLE` (para `DISCARD`).
- `v4_item_id` / `v4_item_path`: solo con `PRODUCE` + `APPROVED`; vacíos en otro caso.
- `status`: `processed_serialized` (aprobado y guardado) o `processed_discarded`.
- Un `REJECTED` no es estado final: se resuelve con `REGENERATE_FROM_ZERO` (que,
  si aprueba, queda `processed_serialized`) o `ABANDON` (queda `processed_discarded`).
- Un `DISCARD` y un `ABANDON` comparten `status: processed_discarded`; se distinguen
  por `factory_decision` (`DISCARD` vs `PRODUCE`) y `audit_decision` (`NOT_APPLICABLE`
  vs `REJECTED`). La resolución de un `REJECTED` se deja explícita en `notes`
  (`REGENERATE_FROM_ZERO -> processed_serialized` o `ABANDON -> processed_discarded`).

**Antes de procesar una entrada**, el orquestador consulta el registro por
`legacy_id` (y confirma por `legacy_blob_sha`); si ya aparece, la omite: no se
reprocesa. Este registro es la fuente del inventario de no reproceso y reemplaza
cualquier carpeta `processed/` o marcador dentro de los archivos legacy.

## 6. Calidad mínima

Antes de serializar se exige fuente verificable, pertinencia de OPEC cuando
corresponda, constructo relevante, una sola mejor respuesta, cuatro distractores
plausibles, ausencia de pistas lingüísticas, demanda cognitiva real, feedback
coherente y ausencia de duplicación conceptual frente al banco V4.

La calidad psicométrica solo se confirma tras pilotaje. Hasta entonces,
`estimatedDifficulty` no debe usarse para afirmar calibración estadística.

## 7. Seguridad de producto

La clave, explicaciones y `learningNote` son datos de evaluación. El cliente solo
recibe contexto, stem, opciones y metadatos de presentación antes de contestar.
El backend evalúa la respuesta y, después, puede entregar feedback autorizado.

## 8. Fuentes de autoridad

1. Este contrato para forma y reglas de ítems V4.
2. Las cuatro skills en `docs/ai/skills/` para producción y auditoría.
3. Los catálogos de `taxonomy/` para valores controlados.
4. `docs/database/question-bank-v4-contract.md` para persistencia y activación.
5. `docs/architecture/question-bank-v4-adoption.md` para el plan de integración.
6. `legacy-processing-register.csv` para el no reproceso de entradas legacy.
