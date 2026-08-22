# Contratos API del MVP

## Rutas actuales

### `POST /api/session/start`
Entrada:
- `mode`
- `area?`
- `competency?`

Lectura de banco recomendada:
- usar `public.v_item_bank_active` (ver `docs/database/active-question-bank-contract.md`)
- no leer `item_bank` crudo como contrato funcional por defecto
- cuando V4 se active, el backend debe elegir la vista V4 autorizada según el
  contrato `docs/database/question-bank-v4-contract.md`; el navegador no consulta
  tablas ni vistas con `correct_option` directamente

Salida:
- `sessionId`
- `currentState`
- `mode`
- `currentItemId?`
- `hintLevel`
- `activeArea?`
- `activeCompetency?`

### `POST /api/session/advance`
Entrada:
- `sessionId`
- `itemId`
- `selectedOption?`
- `userRationale?`
- `responseTimeMs?`
- `confidenceSelfReport?`

Lectura de banco recomendada:
- resolver ítem y elegibilidad desde `public.v_item_bank_active`
- reservar `item_bank` como tabla base de escritura/transición

Salida:
- `sessionId`
- `previousState`
- `currentState`
- `evaluation`
- `feedbackText`
- `hintLevel`
- `nextItemId?`
- `shouldTransition`

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

Lectura de banco recomendada:
- metadatos del ítem desde `public.v_item_bank_active`
- opciones desde `item_options` mientras no exista una vista de detalle consolidada

Salida (compatibilidad + preparación rich):
- legacy estable para UI actual:
  - `id`
  - `title`
  - `area`
  - `competency`
  - `stem`
  - `options[]`
- capa extendida de presentación (`PracticeQuestionViewModel`):
  - `subarea?`
  - `topicLabel?`
  - `expectedUserTask?`
  - `cognitiveIntent?`
  - `difficulty?`
  - `tags?`
  - `misconceptionHints?`
  - `rationale?`
  - `sourceTruthStatus?` (uso interno / trazabilidad)
- extensión V4 pendiente de activación:
  - `context?`, `topic?`, `questionType?`, `cognitiveLevel?`, `hint?`
  - la clave, explicaciones y `learningNote` solo aparecen en un payload posterior
    a la respuesta autorizada

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
