---
id: PRD-QUESTION-BANK-V4-DEFAULT-SOURCE
name: question-bank-v4-default-source
project: ganaconmerito
owner: marlon-arcila
status: proposed
artifact_type: prd
modules: [editorial, content, practice, tutor, database]
tags: [v4, question-bank, migration, default-source]
related:
  - content/question-bank-v4/CONTRATO-EDITORIAL-V4.md
  - docs/architecture/question-bank-v4-adoption.md
  - docs/database/prd-question-bank-v4-supabase.md
---

# PRD — V4 como fuente predeterminada del banco de preguntas

> **Decisión superseding (2026-08-23):** V4 se adopta sobre una nueva baseline
> limpia. No se preservan filas/UUID/sesiones legacy para el cutover, no existe
> fallback y GitHub es la autoridad editorial. Supabase es su proyección
> operacional mediante `content:sync`. La implementación está validada solo localmente.

## 1. Resultado esperado

`content/question-bank-v4/` y su representación autorizada en Supabase se
convierten en la única fuente predeterminada de preguntas nuevas para práctica,
sesiones, Tutor GCM y analítica. Los bancos Beta/V3/legacy se conservan como
histórico y no participan en la selección por defecto después del corte V4.

## 2. Alcance

Incluye:

- producción, validación e importación de ítems V4;
- lectura de preguntas V4 en backend y API;
- presentación segura de V4 en frontend;
- activación gradual y corte de fuente predeterminada;
- documentación, pruebas y rollback.

No incluye:

- reescribir o corregir ítems legacy;
- borrar o modificar todavía la instancia Supabase legacy;
- afirmar calibración psicométrica antes de un piloto con datos.

## 3. Fuente de verdad

- Contrato editorial: `content/question-bank-v4/CONTRATO-EDITORIAL-V4.md`.
- Producción/auditoría: las cuatro skills en `docs/ai/skills/`.
- Persistencia: `docs/database/prd-question-bank-v4-supabase.md`.
- Adopción técnica: `docs/architecture/question-bank-v4-adoption.md`.

## 4. Requisitos funcionales

### RF-01 — Producción V4

Cada registro legacy se procesa individualmente. La fábrica aplicable devuelve
`PRODUCE` o `DISCARD`; todo `PRODUCE` pasa por auditor independiente. Solo un
resultado `APPROVED` puede guardarse en `content/question-bank-v4/items/`.

### RF-02 — Validación de archivos

Implementar un validador TypeScript para el contrato V4 y los catálogos locales.
Debe validar campos obligatorios, ids, scope/OPEC, A–D, clave única, explicaciones,
fuente, taxonomía y dificultad. El comando debe fallar ante cualquier ítem inválido.

### RF-03 — Importación controlada

Implementar un reconciliador único `content:sync` con validate, plan, diff, apply,
verify y status; hash aprobado exacto, idempotencia, detección/reparación de drift,
atomicidad y reporte seguro. No existe reverse-sync.

### RF-04 — Lectura de práctica

El backend debe leer V4 desde las vistas/tablas server-only de la baseline limpia.
El selector combina familia, perfil y OPEC y después dominio, tema, competencia y
dificultad.

### RF-05 — Protección de respuestas

Antes de responder, la API y frontend reciben solo `context`, `stem`, opciones y
metadatos permitidos. Después de una respuesta válida, reciben el feedback
autorizado, explicaciones, `hint`, `learningNote` y fuente.

### RF-06 — Fuente predeterminada

Al completar el corte, todo inicio de práctica selecciona exclusivamente V4. No
debe existir fallback silencioso a Beta/V3/legacy. Si no hay inventario V4 elegible,
la aplicación muestra un estado explícito de banco no disponible.

## 5. Plan de ejecución en el repositorio

### Fase 0 — Preparación editorial

1. Completar catálogos V4 y validar que no contengan valores fuera de contrato.
2. Convertir el ejemplo V4 existente al contrato completo.
3. Añadir tests y un comando `content:validate:v4`.
4. Producir una primera cohorte aprobada; no activar runtime.

### Fase 1 — Backend e importación

1. Crear tipos V4, schema Zod y lector de archivos.
2. Implementar el importador dry-run y pruebas unitarias.
3. Crear repositorio de lectura V4 y DTO separados:
   `PracticeQuestion` y `AnsweredQuestion`.
4. Adaptar `session/start`, `session/item` y `session/advance` para usar el
   repositorio V4 cuando la política de selección lo indique.
5. Añadir tests para asegurar que ninguna respuesta previa filtra clave, feedback o
   `learningNote`.

### Fase 2 — Frontend

1. Renderizar `context` y `stem` separados.
2. Mostrar opciones A–D y ayuda sin revelar clave antes de responder.
3. Mostrar feedback por opción, nota de aprendizaje y fuente después de responder.
4. Añadir estados de banco vacío/no disponible y accesibilidad por teclado, lector
   de pantalla y móvil.

### Fase 3 — Piloto y corte

1. Importar una cohorte V4 con estado inactivo.
2. Ejecutar pruebas de importación, API, UI y Tutor en staging.
3. Activar una cohorte V4 aprobada y ejecutar piloto controlado.
4. Verificar cobertura suficiente para los filtros habilitados.
5. Cambiar la política de selección para V4 exclusivo.
6. Actualizar documentación de estado, release, pruebas y runtime.

## 6. Criterios de aceptación

- Todos los archivos V4 pasan el validador y tienen auditoría `APPROVED`.
- El importador es idempotente y no modifica bancos históricos.
- La práctica no filtra clave ni explicaciones antes de responder.
- La respuesta posterior muestra feedback correcto y fuente de V4.
- Los filtros de práctica devuelven solo ítems V4 autorizados.
- Las pruebas unitarias, integración, E2E y validación documental pasan.
- Se confirma en Supabase que la vista de lectura predeterminada devuelve V4 y no
  mezcla Beta/V3/legacy.
- Se realiza smoke y E2E autenticada en runtime antes de declarar el corte.

## 7. Rollback

El rollback se hace cambiando la política de selección y desactivando la cohorte
V4; no se borran filas ni archivos. Deben mantenerse la vista histórica y la
trazabilidad de cada importación hasta que el corte se declare estable.

## 8. Entregables

- validador, importador y comandos V4;
- migraciones Supabase y vistas autorizadas;
- adaptaciones de API/backend/frontend;
- cohorte piloto V4 aprobada;
- evidencia de pruebas y reporte de corte;
- actualización de la documentación canónica.
