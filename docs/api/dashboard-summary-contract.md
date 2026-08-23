---
id: API-DASHBOARD-SUMMARY-CONTRACT
name: dashboard-summary-contract
project: ganaconmerito
owner: backend
status: active
artifact_type: api-contract
modules: [dashboard, backend, qa]
tags: [api, contract, dashboard]
related:
  - docs/api/contracts.md
  - src/types/evaluation.ts
  - src/lib/dashboard/summary-metrics.ts
last_reviewed: 2026-04-29
---

# Contrato explícito — `GET /api/dashboard/summary`

## Objetivo
Eliminar inferencias entre backend, frontend y QA para que el dashboard tenga un contrato estable y verificable.

## Respuesta canónica
```ts
interface DashboardSummaryMetrics {
  estimatedLevel: number
  percentileSegment?: number
  totalAttempts: number
  totalCorrect: number
  avgReasoningScore: number
  strongestCompetencies: string[]
  weakestCompetencies: string[]
  recentTrend: "up" | "stable" | "down"
}

interface DashboardSummaryResponse {
  historical: DashboardSummaryMetrics
  currentSession: DashboardSummaryMetrics | null
}
```

## Regla de presencia
- sin `sessionId`:
  - `historical` siempre existe
  - `currentSession = null`
- con `sessionId` válido del usuario:
  - `historical` siempre existe
  - `currentSession` siempre existe como bloque
  - si la sesión no tiene datos evaluados todavía, `currentSession` usa métricas vacías, no `null`
- con `sessionId` inválido/no propio:
  - no expone datos ajenos
  - el backend hoy degrada a bloque vacío para `currentSession`

## Semántica de métricas
- `estimatedLevel`: promedio simple de `estimated_level` por competencia incluida en el bloque.
- `totalAttempts`: suma de `attempts` del bloque.
- `totalCorrect`: suma de `correct_count` del bloque.
- `avgReasoningScore`: promedio ponderado por `attempts` de `avg_reasoning_score`.
- `recentTrend`:
  - `up` si el `estimated_level` más reciente es mayor que el inmediatamente anterior
  - `down` si es menor
  - `stable` si son iguales
  - si solo existe actividad y no hay dos puntos comparables, cae en `up`
  - si no hay actividad, cae en `stable`

## Regla funcional — `Fuertes` / `Por reforzar`
### `strongestCompetencies` (`Fuertes`)
Una competencia entra solo si cumple todo:
- `attempts >= 1`
- `correct_count > 0`
- `estimated_level > 0`
- precisión `correct_count / attempts >= 0.5`

Orden:
1. `estimated_level` desc
2. precisión desc
3. `attempts` desc

Límite: máximo `3`.

### `weakestCompetencies` (`Por reforzar`)
Una competencia entra si:
- `attempts >= 1`
- no quedó ya en `strongestCompetencies`

Orden:
1. `estimated_level` asc
2. precisión asc
3. `attempts` desc

Límite: máximo `3`.

## Invariantes obligatorios
- ninguna competencia puede aparecer en ambos grupos
- el mismo dataset debe producir el mismo resultado
- competencias duplicadas por nombre se deduplican antes de cortar top-3
- filas con `attempts = 0` no aparecen en ninguno de los grupos

## Fuente de datos por bloque
- `historical`: `user_topic_stats` del usuario autenticado
- `currentSession`: agregación derivada de `session_turns` + `evaluation_events` + `questions` para el `sessionId`

## Ejemplos
### Sin `sessionId`
```json
{
  "historical": {
    "estimatedLevel": 0.217,
    "percentileSegment": 58,
    "totalAttempts": 9,
    "totalCorrect": 5,
    "avgReasoningScore": 0.74,
    "strongestCompetencies": ["Pensamiento aleatorio", "Lectura crítica"],
    "weakestCompetencies": ["Normatividad"],
    "recentTrend": "up"
  },
  "currentSession": null
}
```

### Con `sessionId`
```json
{
  "historical": {
    "estimatedLevel": 0.217,
    "percentileSegment": 58,
    "totalAttempts": 9,
    "totalCorrect": 5,
    "avgReasoningScore": 0.74,
    "strongestCompetencies": ["Pensamiento aleatorio", "Lectura crítica"],
    "weakestCompetencies": ["Normatividad"],
    "recentTrend": "up"
  },
  "currentSession": {
    "estimatedLevel": 0.101,
    "totalAttempts": 3,
    "totalCorrect": 2,
    "avgReasoningScore": 0.71,
    "strongestCompetencies": ["Pensamiento aleatorio"],
    "weakestCompetencies": ["Normatividad"],
    "recentTrend": "up"
  }
}
```

## Artefactos de validación
- lógica canónica: `src/lib/dashboard/summary-metrics.ts`
- tipos compartidos: `src/types/evaluation.ts`
- prueba determinista: `npm run test:dashboard`
- QA funcional completa: `npm run qa:e2e:api` y `npm run qa:e2e:ui`
- smoke postdeploy: `npm run qa:smoke:postdeploy`
