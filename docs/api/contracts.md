# Contratos API del MVP

## Rutas actuales

### `POST /api/session/start`
Entrada:
- `mode`
- `area?`
- `competency?`

Lectura de banco implementada en repo:
- `V4QuestionRepository` server-only consulta `public.v_question_bank_v4_active`
- no existe fallback a `v_item_bank_active`, Beta/V3 o legacy
- el navegador no consulta tablas ni vistas del banco directamente

Salida:
- `sessionId`
- `currentState`
- `mode`
- `currentItemId?`
- `hintLevel`
- `activeArea?`
- `activeCompetency?`
- `inventory?` con estado, motivo y alternativas cuando no hay V4 activa

### `POST /api/session/advance`
Entrada:
- `sessionId`
- `itemId`
- `selectedOption`
- `userRationale?`
- `responseTimeMs?`
- `confidenceSelfReport?`

Lectura de banco implementada en repo:
- la evaluación autorizada usa `V4QuestionRepository` server-only
- la respuesta se persiste antes de revelar feedback por opción

Salida:
- `sessionId`
- `previousState`
- `currentState`
- `evaluation`
- `feedbackText`
- `hintLevel`
- `nextItemId?`
- `shouldTransition`
- `answerReview.selectedOption`
- `answerReview.correctOption`
- `answerReview.selectedExplanation?`
- `answerReview.correctExplanation?`
- `answerReview.learningNote?`
- `answerReview.sourceReference?`

### `POST /api/content/validate`
Entrada:
- `rawMarkdown`

Salida:
- `ok`
- `errors[]`
- `warnings[]`
- `parsed?`

### `POST /api/content/upload`
Entrada:
- `rawMarkdown`

Salida:
- `ok`
- `itemId?`
- `version?`
- `errors[]`

### `GET /api/session/item`
Entrada:
- `sessionId`
- `itemId`

Lectura de banco implementada en repo:
- metadatos seguros desde `public.v_question_bank_v4_active`
- opciones desde `item_options` mediante el repositorio server-only

Salida (compatibilidad + preparación rich):
- legacy estable para UI actual:
  - `id`
  - `title`
  - `area`
  - `competency`
  - `stem`
  - `options[]`
- capa extendida de presentación (`PracticeQuestionViewModel`):
  - `topic?`
  - `context?`
  - `questionType?`
  - `cognitiveLevel?`
  - `sourceReference?`
  - `topicLabel?`
  - `expectedUserTask?`
  - `cognitiveIntent?`
  - `difficulty?`
  - `tags?`
  - `misconceptionHints?`
  - `sourceTruthStatus?` (uso interno / trazabilidad)
- la clave, explicaciones y `learningNote` no forman parte de esta respuesta;
  solo aparecen tras una respuesta autorizada en `POST /api/session/advance`

### `GET /api/dashboard/summary`
Contrato detallado: `docs/api/dashboard-summary-contract.md`

Entrada:
- `sessionId?`

Salida:
- `historical`
  - `estimatedLevel`
  - `percentileSegment?`
  - `totalAttempts`
  - `totalCorrect`
  - `avgReasoningScore`
  - `strongestCompetencies[]`
  - `weakestCompetencies[]`
  - `recentTrend`
- `currentSession`
  - mismo shape que `historical`
  - `null` cuando no llega `sessionId`
  - bloque vacío cuando sí llega `sessionId` pero la sesión aún no tiene datos evaluados o no es accesible por ownership

## Estado real

Las rutas existen en `src/app/api/`.

### Ya implementado realmente
- `content/validate` parsea y valida Markdown real
- `content/upload` persiste contenido de forma atómica y exige admin
- `session/start` y `session/advance` persisten contra Supabase real
- endpoints críticos ya tienen validación runtime con Zod

### Aún pendiente
- mantener el contrato dashboard alineado con payload real en runtime desplegado
- sostener smoke postdeploy + E2E autenticada como gate operativo
