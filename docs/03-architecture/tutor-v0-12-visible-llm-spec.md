# Tutor AI v0.12.0 — visible LLM gobernado

Status: implementation checkpoint
Owner: PM-Governance
Last reviewed: 2026-09-01

## Alcance

Tutor AI v0.12.0 promueve OpenRouter desde shadow al camino visible gobernado sin entregar autoridad operativa al modelo. El Tutor determinista sigue siendo baseline y fallback autoritativo.

No incluye migraciones, cambios de Supabase remoto, cambios de scoring, cambios de avance de sesión, cambios de contenido V4 ni activación del flag visible en entornos reales.

## Flujo

```text
request autenticado
-> ownership de sesión
-> evidencia Tutor reconstruida server-side
-> baseline determinista
-> coordinador visible
-> OpenRouter elegible sólo con flag/configuración/presupuesto válidos
-> política de candidato
-> visibleMessage LLM aceptado o fallback determinista
-> una traza final minimizada
```

El LLM sólo puede reemplazar `output.visibleMessage`. Permanecen deterministas: `mode`, `intent`, `canRevealCorrectAnswer`, evidencias, guardrails, `suggestedAction`, confianza, scoring, avance y trazabilidad.

## Modos

| Configuración | Comportamiento |
|---|---|
| `GCM_TUTOR_LLM_SHADOW=0`, `GCM_TUTOR_LLM_VISIBLE=0` | Tutor determinista visible |
| `GCM_TUTOR_LLM_SHADOW=1`, `GCM_TUTOR_LLM_VISIBLE=0` | Tutor determinista visible + shadow asíncrono |
| `GCM_TUTOR_LLM_VISIBLE=1` | Candidato OpenRouter visible gobernado + fallback determinista |
| Ambos flags en `1` | Visible tiene precedencia y no ejecuta una segunda llamada shadow |

El visible queda apagado por defecto. OpenRouter conserva `openai/gpt-4o-2024-08-06`, provider `azure`, `require_parameters`, `data_collection: deny`, `zdr: true`, `allow_fallbacks: false`, `only/order`, sin tools, plugins, web search ni healing.

## Multitur efímero

El cliente puede enviar `history` con roles `user` y `assistant`. El servidor normaliza y acota:

- máximo 6 mensajes;
- máximo 3 intercambios;
- máximo 1.000 caracteres por mensaje;
- máximo 4.000 caracteres acumulados;
- mensaje actual máximo 1.000 caracteres;
- sin saludo inicial;
- sin `userId`, evidencia ni autoridad desde cliente;
- sin persistencia en Supabase;
- reset por `sessionId:itemId` y recarga.

El historial es contexto no confiable. La evidencia, estado pre/post-respuesta y permiso de revelar clave siempre se reconstruyen server-side.

## Aceptación de candidato

La política acepta un candidato sólo si:

- visible está habilitado y configurado;
- el baseline determinista no está degradado;
- los límites por ítem, usuario, sesión, tokens, dossier y costo no se exceden;
- transporte y schema son válidos;
- `requiresDeterministicFallback` es `false`;
- `uncertainty` no es `insufficient`;
- evidence keys existen y están disponibles;
- source IDs, citas y claims coinciden con evidencia server-side;
- fuentes históricas nivel `F` no se presentan como actuales;
- no hay leakage pre-answer directo ni indirecto;
- la acción pedagógica es compatible con intent y estado pre/post-answer;
- no hay claims de scoring, avance, cierre, mutación, secretos, rutas o instrucciones internas.

Todo rechazo conserva completo el resultado determinista.

## Telemetría

La traza final usa `tutor_turn_traces.trace_signals` y no guarda mensajes, historial, prompts, respuesta LLM completa, correo, nombre, secretos ni rutas. Las señales agregadas son minimizadas: provider, modelo, modo LLM, estado, razón de fallback, latencia, tokens, costo, safety result, evidence keys y conteos de señales de fuente.

`tutor_shadow_metrics` permanece para shadow. Cualquier drift de esa tabla queda como deuda de verificación previa a Canary; este alcance no crea migraciones.
