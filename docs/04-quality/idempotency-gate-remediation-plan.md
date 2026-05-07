# Idempotency Gate Remediation Plan — Sprint 33

## Objetivo
Corregir el gate E2E de idempotencia para que valide la persistencia de la misma pregunta al reingresar a `/practice` usando una señal estable, no el texto completo de la pantalla.

## Estado

- Sprint: 33.13
- Rol lider: PM-QA
- Estado: PROPOSED
- Runtime validado: no
- Implementacion de test: pendiente
- Test objetivo: `tests/e2e/idempotency-practice-test.spec.ts`

## Problema actual

El test actual captura:

```ts
const questionText1 = await page.locator("main").innerText();
const questionText2 = await page.locator("main").innerText();
```

Luego compara ambos textos normalizados.

Esto es fragil porque `main.innerText` puede cambiar por elementos que no representan la identidad de la pregunta:

- mensajes de carga;
- copy de botones;
- feedback;
- metadata visual;
- textos del Tutor GCM;
- cambios de layout;
- banners;
- pequenos cambios de UX;
- orden o whitespace.

## Riesgo

### Falso negativo
La pregunta es la misma, pero cambia un texto no relacionado en `main`, y el test falla.

### Falso positivo
La pregunta cambia, pero parte del texto general permanece suficientemente similar o el test captura un estado incorrecto.

### Impacto
El gate deja de medir idempotencia real y mide estabilidad accidental de UI.

## Criterio correcto

El test debe validar identidad de pregunta, no igualdad de pagina.

Senales aceptadas, en orden recomendado:

1. `data-testid="practice-question-id"`.
2. Atributo `data-question-id` en `practice-question-card`.
3. Intercept del payload de `/api/session/item`.
4. Texto del stem aislado en `practice-question-stem` como fallback temporal.

## Cambio recomendado en UI

Agregar selectores estables al componente de practica:

```tsx
<section
  data-testid="practice-question-card"
  data-question-id={currentItem.id}
>
  <span data-testid="practice-question-id" hidden>
    {currentItem.id}
  </span>
  <p data-testid="practice-question-stem">
    {currentItem.stem}
  </p>
</section>
```

## Cambio recomendado en test

### Opcion preferida

```ts
const getCurrentQuestionId = async () => {
  await expect(page.getByTestId("practice-question-card")).toBeVisible();
  const questionId = await page
    .getByTestId("practice-question-card")
    .getAttribute("data-question-id");

  expect(questionId, "La pregunta activa debe exponer data-question-id").toBeTruthy();
  return questionId;
};

const questionId1 = await getCurrentQuestionId();

await page.goto(`${BASE_URL}/home`, { waitUntil: "networkidle" });
await page.goto(`${BASE_URL}/practice`, { waitUntil: "networkidle" });

const questionId2 = await getCurrentQuestionId();

expect(questionId2, "La misma sesion debe conservar la pregunta al reingresar").toBe(questionId1);
```

### Fallback temporal aceptable

Solo si todavia no existe `questionId` expuesto:

```ts
const stem1 = await page.getByTestId("practice-question-stem").innerText();
const stem2 = await page.getByTestId("practice-question-stem").innerText();
expect(stem2.trim()).toBe(stem1.trim());
```

Este fallback no debe promoverse como solucion definitiva si el banco puede tener stems repetidos o variantes.

## Evidencia que debe guardar el test

El reporte JSON debe cambiar de texto completo a identidad semantica:

```json
{
  "attempt1": {
    "questionId": "...",
    "stemPreview": "..."
  },
  "attempt2": {
    "questionId": "...",
    "stemPreview": "..."
  },
  "areSameQuestion": true,
  "verdict": "IDEMPOTENT"
}
```

## Plan de implementacion

### Paso 1 — UI selectors
Agregar `data-testid` y `data-question-id` en el componente que renderiza la pregunta activa.

### Paso 2 — Refactor del test
Reemplazar captura de `main.innerText` por helper `getCurrentQuestionIdentity`.

### Paso 3 — Reporte semantico
Guardar `questionId`, `stemPreview` y `areSameQuestion`.

### Paso 4 — Mantener screenshots como evidencia secundaria
Los screenshots pueden seguir existiendo, pero no deben determinar el veredicto.

### Paso 5 — Ejecutar Playwright
Ejecutar:

```bash
npx playwright test tests/e2e/idempotency-practice-test.spec.ts --reporter=line
```

Si falta browser, ejecutar en entorno autorizado:

```bash
npx playwright install
```

## Criterios de aceptacion

- El test ya no usa `page.locator("main").innerText()` como contrato.
- La comparacion principal usa `questionId` o `data-question-id`.
- El test falla si la pregunta activa cambia dentro de la misma sesion.
- El reporte JSON guarda identidad semantica, no pagina completa.
- Los screenshots quedan como evidencia secundaria.
- El test se documenta como Gate B hasta validar runtime.

## Riesgos

| Riesgo | Mitigacion |
|---|---|
| UI no expone `questionId` | agregar `data-question-id` en componente |
| cambios de copy rompen fallback | no usar copy como contrato definitivo |
| Playwright no instalado | documentar dependencia y ejecutar en CI correcto |
| sesion previa contaminada | limpiar estado o usar fixture gobernado |
| reingreso inicia nueva sesion | validar contrato esperado de producto antes de afirmar bug |

## Definition of Done Sprint 33.13

- plan de remediacion creado;
- criterio correcto de idempotencia definido;
- cambio UI/test propuesto;
- evidencia esperada documentada;
- `main.innerText` queda explicitamente marcado como prohibido para este gate.

## Siguiente sprint pequeno

Sprint 33.14 — definir politica de fixtures y datos de prueba gobernados en `docs/04-quality/test-fixtures-policy.md`.
