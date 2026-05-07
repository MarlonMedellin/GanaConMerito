# ADR-001 — Rate Limiting MVP

## Estado
Propuesto para Sprint 33.

## Contexto
Las auditorias de backend y seguridad identificaron ausencia de rate limiting explicito en endpoints sensibles del MVP. Esto aumenta riesgo de abuso, costos imprevistos, denegacion de servicio ligera y ruido operacional.

## Decision
Adoptar rate limiting gradual por endpoint, usuario y/o IP, empezando por rutas P0.

## Endpoints P0
- `POST /api/tutor/turn`
- `POST /api/session/advance`
- `POST /api/content/upload`
- `POST /api/content/validate`

## Estrategia recomendada

### 1. Usuario autenticado
Cuando exista sesion:
- limite por `profileId` o usuario autenticado
- ventana corta para abuso inmediato
- ventana media para costos acumulados

### 2. IP fallback
Cuando no haya usuario confiable:
- limite por IP
- limite mas conservador

### 3. Respuesta estandar
Usar envelope API v1:

```ts
{
  ok: false,
  error: {
    code: "RATE_LIMITED",
    message: "Demasiadas solicitudes. Intenta de nuevo en unos minutos."
  },
  meta: {
    requestId: "..."
  }
}
```

## Politicas iniciales sugeridas

| Endpoint | Limite inicial | Ventana | Razon |
|---|---:|---:|---|
| tutor/turn | 20 | 10 min | costo y abuso de tutor |
| session/advance | 60 | 10 min | integridad de avance |
| content/upload | 10 | 10 min | carga y parsing |
| content/validate | 20 | 10 min | parsing/fuzzing |

## Consecuencias

### Positivas
- reduce abuso
- mejora estabilidad
- baja riesgo AppSec
- prepara produccion

### Negativas
- requiere storage compartido si hay multiples instancias
- puede afectar QA si no se parametriza
- requiere mensajes UX claros

## Guardrails
- no bloquear trazas ni logs secundarios
- no aplicar limites agresivos sin metricas
- registrar `rate_limited` como evento observable
- permitir bypass controlado solo en entorno test/CI

## Criterio de aceptacion
- endpoints P0 documentados
- estrategia de respuesta estandar definida
- implementacion futura debe incluir pruebas unitarias o integration smoke
