# Playwright Selector Standard — Sprint 33

## Objetivo
Definir un estandar de selectores estables para Playwright que reduzca flakiness, falsos positivos y dependencia de textos completos de pagina.

## Estado

- Sprint: 33.11
- Rol lider: PM-QA
- Estado: PROPOSED
- Runtime validado: no
- Implementacion en componentes: pendiente
- Problema principal: `tests/e2e/idempotency-practice-test.spec.ts` compara `main.innerText`, lo cual no debe ser contrato estable.

## Principios

1. Las pruebas criticas deben usar senales semanticas estables.
2. El copy visible puede cambiar sin romper QA critica.
3. Los selectores no deben depender de clases visuales efimeras.
4. El selector debe representar intencion de producto, no estructura CSS.
5. Las pruebas forensic pueden usar texto amplio; los smoke gates no.

## Jerarquia recomendada de selectores

| Prioridad | Selector | Uso recomendado |
|---|---|---|
| 1 | `data-testid` | contratos E2E criticos |
| 2 | atributos semanticos ARIA/role | botones, links, campos accesibles |
| 3 | payload API o storage state | invariantes de estado |
| 4 | texto puntual estable | CTA o labels estables |
| 5 | clases CSS | solo diagnostico temporal |
| 6 | `main.innerText` | prohibido como contrato smoke |

## Convencion de nombres

Formato:

```text
<domain>-<entity>-<purpose>
```

Ejemplos:

```text
practice-question-card
practice-question-id
practice-option-a
practice-submit-answer
practice-next-item
practice-feedback-panel
dashboard-summary-card
tutor-input
tutor-send-message
auth-login-google
```

## Selectores requeridos por dominio

### Auth

| Elemento | Selector propuesto | Prioridad |
|---|---|---|
| boton login Google | `auth-login-google` | P1 |
| mensaje error login | `auth-login-error` | P1 |
| metadata runtime login | `auth-runtime-metadata` | P1 |

### Practice

| Elemento | Selector propuesto | Prioridad |
|---|---|---|
| contenedor practica | `practice-root` | P0 |
| boton iniciar practica | `practice-start-button` | P0 |
| tarjeta pregunta | `practice-question-card` | P0 |
| id pregunta actual | `practice-question-id` | P0 |
| texto pregunta | `practice-question-stem` | P0 |
| lista opciones | `practice-options-list` | P0 |
| opcion A | `practice-option-a` | P0 |
| opcion B | `practice-option-b` | P0 |
| opcion C | `practice-option-c` | P0 |
| opcion D | `practice-option-d` | P0 |
| boton responder | `practice-submit-answer` | P0 |
| panel feedback | `practice-feedback-panel` | P0 |
| boton siguiente item | `practice-next-item` | P0 |
| estado terminal | `practice-terminal-state` | P1 |
| mensaje error practica | `practice-error-message` | P0 |
| loading practica | `practice-loading-state` | P1 |

### Tutor GCM

| Elemento | Selector propuesto | Prioridad |
|---|---|---|
| raiz tutor | `tutor-root` | P1 |
| input tutor | `tutor-input` | P1 |
| boton enviar | `tutor-send-message` | P1 |
| acciones guiadas | `tutor-guided-actions` | P1 |
| mensaje tutor | `tutor-message` | P1 |
| warning guardrail | `tutor-guardrail-warning` | P1 |
| estado fuente verdad | `tutor-source-truth-status` | P2 |

### Dashboard

| Elemento | Selector propuesto | Prioridad |
|---|---|---|
| raiz dashboard | `dashboard-root` | P1 |
| resumen historico | `dashboard-historical-summary` | P1 |
| resumen sesion actual | `dashboard-current-session-summary` | P1 |
| nivel estimado | `dashboard-estimated-level` | P1 |
| nivel de senal | `dashboard-signal-level` | P1 |
| bloque fortalezas | `dashboard-strengths` | P2 |
| bloque refuerzos | `dashboard-reinforcements` | P2 |

### Content/Admin

| Elemento | Selector propuesto | Prioridad |
|---|---|---|
| editor markdown | `content-markdown-editor` | P2 |
| boton validar | `content-validate-button` | P2 |
| resultado validacion | `content-validation-result` | P2 |
| boton upload | `content-upload-button` | P2 |

## Regla para idempotency gate

El test de idempotencia debe comparar una de estas senales, en este orden:

1. `data-testid="practice-question-id"` con valor estable.
2. atributo `data-question-id` en `practice-question-card`.
3. payload API interceptado de `/api/session/item`.
4. texto exacto del stem solo si esta aislado en `practice-question-stem`.

No debe comparar:

- `main.innerText`;
- pagina completa;
- screenshot;
- clases visuales como `.option-card` salvo como fallback temporal.

## Ejemplo recomendado Playwright

```ts
const questionCard = page.getByTestId("practice-question-card");
await expect(questionCard).toBeVisible();

const questionId = await page.getByTestId("practice-question-id").textContent();
expect(questionId).toBeTruthy();
```

Alternativa con atributo:

```ts
const questionId = await page
  .getByTestId("practice-question-card")
  .getAttribute("data-question-id");

expect(questionId).toBeTruthy();
```

## Politica de fallback

Si un selector estable todavia no existe:

1. documentar fallback temporal;
2. no marcar test como definitivo;
3. abrir tarea para agregar `data-testid`;
4. no promoverlo a Gate A/B hasta corregirlo.

## Checklist para agregar nuevos selectores

- [ ] el selector describe una intencion funcional;
- [ ] no depende de copy variable;
- [ ] no depende de clase visual;
- [ ] es unico en la pantalla o tiene scope claro;
- [ ] queda documentado en este archivo;
- [ ] tiene prioridad P0/P1/P2.

## Definition of Done Sprint 33.11

- estandar de selectores creado;
- selectores P0 de practice definidos;
- regla de idempotency gate definida;
- uso de `main.innerText` queda prohibido como contrato smoke;
- implementacion en componentes queda pendiente para sprint de codigo posterior.

## Siguiente sprint pequeno

Sprint 33.12 — mapa test a contrato en `docs/04-quality/e2e-contract-map.md`.
