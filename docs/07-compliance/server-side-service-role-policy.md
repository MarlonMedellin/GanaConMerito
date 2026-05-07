---
id: COMP-SERVER-SIDE-SERVICE-ROLE-POLICY
name: server-side-service-role-policy
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: compliance
modules: [supabase, auth, api, tutor, dashboard]
tags: [service-role, rls, security, server-side]
last_reviewed: 2026-05-06
---

# Política de uso server-side del service role

## Objetivo
Definir cuándo puede usarse un cliente Supabase con privilegios elevados en GanaConMerito y qué controles mínimos deben cumplirse para evitar filtraciones, saltos de ownership o exposición accidental de datos.

## Regla principal
El service role solo puede usarse en código server-side, nunca en componentes cliente, hooks de navegador, archivos públicos ni payloads enviados al usuario.

## Usos permitidos

### 1. Lecturas de soporte operativo server-side
Permitido cuando:
- la ruta ya verificó usuario autenticado;
- la consulta necesita cruzar tablas que RLS bloquearía parcialmente;
- la respuesta final se limita a datos del usuario, sesión o ítem autorizado.

Ejemplos aceptables:
- construir evidencia del Tutor GCM después de `requireOwnedSession`;
- seleccionar ítems desde banco activo server-side;
- armar métricas agregadas del usuario autenticado.

### 2. Operaciones atómicas de dominio
Permitido cuando:
- la operación representa una transición de dominio;
- hay validación previa de sesión propia;
- la operación no se puede delegar de forma segura al cliente.

Ejemplos:
- `advance_session_atomic`;
- cierre de sesión de práctica;
- persistencia de evaluación derivada del backend.

### 3. Tareas administrativas o de importación
Permitido solo en scripts o rutas administrativas explícitas, no expuestas al usuario final.

Ejemplos:
- carga de banco de preguntas;
- validación o importación de corpus;
- futuras tareas admin de fuente normativa.

## Usos prohibidos

- Importar service role en componentes React cliente.
- Enviar `SUPABASE_SERVICE_ROLE_KEY` al navegador.
- Usar service role para aceptar ownership desde payload cliente sin verificación server-side.
- Devolver filas completas de tablas sensibles sin filtrado explícito.
- Reemplazar RLS por confianza general en rutas API.
- Usar service role para que el Tutor GCM modifique scoring, avance o cierre.

## Checklist obligatorio para rutas API
Antes de usar service role o cliente admin en una ruta:

1. ¿La ruta corre server-side?
2. ¿Se validó usuario autenticado?
3. ¿Se validó ownership si hay `sessionId`, `itemId`, `profileId` o recurso privado?
4. ¿El payload del cliente es mínimo?
5. ¿La respuesta excluye secretos y campos no necesarios?
6. ¿Existe guardrail para degradar si falta evidencia?
7. ¿La ruta tiene pruebas o QA manual documentada?

## Tutor GCM

### Regla especial
El Tutor GCM puede recibir evidencia construida server-side, pero no puede tener autoridad de escritura sobre:
- puntaje;
- avance;
- cierre de sesión;
- selección de ítems;
- estado oficial del concurso.

### Flujo autorizado
```text
/api/tutor/turn -> requireOwnedSession -> buildTutorEvidence -> TutorOrchestrator -> respuesta gobernada
```

### Flujo prohibido
```text
Cliente -> envia contexto sensible -> Tutor decide scoring/avance -> DB
```

## Dashboard y métricas
El dashboard puede usar consultas server-side para construir resumen del usuario, siempre que:
- los datos pertenezcan al usuario autenticado;
- se agreguen o filtren antes de responder;
- las métricas respeten nivel de señal y no prometan resultados.

## Fuente normativa
La fuente normativa sintetizada puede ser leída por el Tutor GCM como referencia gobernada. Si en el futuro se almacena en Supabase:
- la lectura pública debe ser explícitamente no sensible;
- las ediciones deben quedar limitadas a admin;
- cada versión debe tener estado de verificación;
- el Tutor debe degradar si la fuente está incompleta.

### Clasificación vigente
- El repo sí verifica que el tutor transporte y respete `source_truth_status`.
- El repo no acredita todavía acuerdo, guía metodológica, estructura de prueba ni convocatoria oficial suficientes para elevar el estado a `source_verified`.
- Ninguna ruta server-side debe afirmar cierre normativo total mientras la fuente siga en `synthesized_governed_unverified`.

## Registro recomendado para auditoría futura
Cuando exista persistencia de trazas del Tutor, guardar:
- `user_id`;
- `session_id`;
- `item_id`;
- `contest_id`;
- `profile_id`;
- `source_truth_status`;
- `evidence_used`;
- `guardrails_applied`;
- `degraded`;
- `can_reveal_correct_answer`.

## Criterio de revisión
Cualquier nueva ruta que use cliente admin debe documentar:
- motivo de privilegio;
- validación de usuario/ownership;
- tablas consultadas;
- datos devueltos;
- riesgo y mitigación.
