# Adopción de Question Bank V4 en la aplicación

**Estado:** base técnica implementada en repositorio; V4 no está activada en runtime.

## Entrega ejecutada — 2026-08-21

- `src/domain/content/v4-contract.ts` valida el contrato estricto del ítem y sus
  reglas de scope, opciones, fuente y dificultad.
- `npm run content:validate:v4` valida todos los JSON bajo `content/question-bank-v4/items/`
  contra los catálogos locales.
- `npm run content:import:v4` ejecuta dry-run por defecto; `--apply` conserva el
  rechazo de ítems sin evidencia `APPROVED` y no activa inventario.
- La migración `0019_question_bank_v4_contract.sql` agrega metadatos consultables y
  `v_question_bank_v4_active`, sin reemplazar la vista histórica activa.

Pendiente para fases posteriores: aplicar la migración en Supabase, importar una
cohorte con auditoría editorial verificable, crear el repositorio/DTO de lectura
V4, adaptar sesiones/UI y ejecutar piloto antes del corte exclusivo. No se declara
runtime verificado ni fuente predeterminada V4 en esta entrega.

## Situación verificada

El runtime actual consume `v_item_bank_active` y los datos legacy/V3 almacenados
en `item_bank` e `item_options`. V4 define un contrato JSON nuevo, con `context`,
`topic`, `questionType`, `cognitiveLevel`, fuente estructurada y tutoría por
opción. Por tanto, copiar archivos V4 a `content/` no basta para que aparezcan en
la práctica: hacen falta importación, lectura segura y activación explícita.

## Backend: trabajo necesario

1. Crear un validador V4 con Zod/TypeScript que lea
   `CONTRATO-EDITORIAL-V4.md` y los catálogos de `taxonomy/`. Debe validar un
   archivo por ítem, A–D, clave única, `scope`/`opecId`, fuente y dificultad.
2. Crear `scripts/import-question-bank-v4.ts` con `--dry-run` por defecto. Debe
   asignar/validar ids, evitar duplicados por `content_id`/slug y llamar solo a la
   función SQL V4 versionada.
3. Mantener `context` y `stem` separados al importar. El backend forma la
   presentación; no concatena ambos como solución permanente.
4. Crear un repositorio de lectura V4 que consulte la vista V4 activa, no
   `item_bank` directamente. El selector debe filtrar por OPEC, scope, dominio,
   competencia y núcleo cuando corresponda.
5. Separar dos DTO: `PracticeQuestion` sin clave/feedback y `AnsweredQuestion`
   con explicación de la opción elegida, clave, `hint` y `learningNote` solo tras
   responder.
6. Mantener la evaluación y la autorización de revelar respuestas exclusivamente
   en el servidor. Añadir pruebas unitarias del mapeo V4 y E2E de no filtración de
   `correctAnswer` antes de contestar.

## Frontend: trabajo necesario

1. Actualizar el view model de práctica para mostrar `context` y `stem` como
   bloques diferenciados y las cuatro opciones A–D de forma accesible.
2. Antes de responder, mostrar únicamente la ayuda autorizada (`hint`) si el
   usuario la solicita; no renderizar explicaciones, nota de aprendizaje ni clave.
3. Tras responder, mostrar feedback por alternativa, la explicación de la clave,
   `learningNote` y la referencia de fuente con etiquetas claras de correcto/error.
4. Usar `topic`, `competency`, dificultad y OPEC para navegación, filtrado y
   analítica solo cuando el backend los entregue; no inferirlos desde texto.
5. Añadir estados visibles para banco vacío, ítem no disponible y fuente no
   verificable. No mezclar una pantalla V4 con campos específicos de V1/V3.
6. Probar lector de pantalla, navegación por teclado, móvil y que el payload de
   red previo a responder no contenga clave ni explicaciones.

## Orden recomendado

```text
contrato editorial + DB V4
          ↓
validador e importador dry-run
          ↓
vista/repositorio de lectura de servidor
          ↓
DTOs y rutas de sesión
          ↓
UI de práctica y feedback posterior
          ↓
piloto pequeño, métricas y activación gradual
```

No cambiar el selector global ni marcar V4 como fuente por defecto hasta que un
piloto haya superado validación técnica, editorial humana y pruebas end-to-end.
