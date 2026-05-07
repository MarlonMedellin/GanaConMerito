# Sprint 33 UX Remediation Plan

## Objetivo
Priorizar y ordenar las correcciones UX P0/P1 necesarias para estabilizar el MVP antes de reabrir expansion funcional.

## Estado

- Sprint: 33.28
- Rol lider: PM-UX
- Estado: PROPOSED
- Runtime validado: no
- Implementacion UI: pendiente
- Alcance: practica, onboarding, feedback, errores, loading, accesibilidad minima y confianza del usuario

## Principios

1. No agregar features nuevas.
2. Reducir friccion del flujo principal antes de embellecer UI.
3. Priorizar claridad, continuidad y confianza.
4. No depender de copy tecnico o slugs crudos.
5. Mantener coherencia con QA: agregar selectores estables si se toca UI.
6. Cualquier cambio visual debe preservar contratos de negocio y guardrails del Tutor GCM.

## Flujo critico del MVP

El flujo UX que Sprint 33 debe proteger es:

```text
login -> home -> practice -> pregunta activa -> respuesta -> feedback -> siguiente pregunta/dashboard
```

El usuario debe entender:

- donde esta;
- que debe hacer;
- que paso despues de responder;
- como continuar;
- cuando el sistema esta cargando;
- cuando algo fallo;
- por que el Tutor GCM no puede revelar cierta informacion antes de tiempo.

## Priorizacion UX

### P0 — Bloqueantes de uso/confiabilidad

| ID | Area | Problema | Objetivo | Archivos esperados | Estado |
|---|---|---|---|---|---|
| UX-P0-01 | Practice | pregunta activa sin identidad estable para QA | exponer `data-question-id` y testids | componentes practice | pending |
| UX-P0-02 | Practice | estados error/loading no suficientemente contractuales | mensajes claros y detectables | componentes practice, states | pending |
| UX-P0-03 | Practice | accion principal puede ser ambigua | CTA claro para responder/continuar | componentes practice | pending |
| UX-P0-04 | Auth | login/error necesita feedback claro | error comprensible y recuperable | login/auth UI | pending |
| UX-P0-05 | Private routes | usuario anonimo debe entender redireccion | mensaje o destino consistente | middleware/auth UI | pending |

### P1 — Estabilizacion de experiencia

| ID | Area | Problema | Objetivo | Archivos esperados | Estado |
|---|---|---|---|---|---|
| UX-P1-01 | Onboarding | posible friccion antes del primer valor | reducir pasos y explicar beneficio | onboarding/home/practice | pending |
| UX-P1-02 | Tutor GCM | guardrails pueden sentirse como bloqueo | explicar limites pedagogicos | tutor UI/copy | pending |
| UX-P1-03 | Dashboard | metricas prudentes deben ser comprensibles | mejorar lectura de senal/confianza | dashboard UI | pending |
| UX-P1-04 | Mobile | flujo de practica debe ser usable en movil | CTA visible y opciones faciles | practice styles | pending |
| UX-P1-05 | Accessibility | feedback y errores deben anunciarse | aria-live/roles adecuados | practice/tutor/dashboard | pending |

### P2 — Mejoras diferibles

| ID | Area | Objetivo | Estado |
|---|---|---|---|
| UX-P2-01 | Animaciones | suavizar transiciones | deferred |
| UX-P2-02 | Empty states avanzados | mejorar storytelling | deferred |
| UX-P2-03 | Microcopy editorial | pulir tono premium | deferred |
| UX-P2-04 | Visual polish | refinar espaciados/jerarquia | deferred |

## Criterios de aceptacion P0

### UX-P0-01 — Identidad estable de pregunta

Debe existir al menos una senal estable:

- `data-testid="practice-question-card"`;
- `data-question-id="..."`;
- `data-testid="practice-question-id"` si se decide exponer valor oculto;
- `data-testid="practice-question-stem"` como fallback de lectura.

Cierre:
- QA puede comparar pregunta activa sin `main.innerText`.

### UX-P0-02 — Estados loading/error

Cada estado critico debe tener:

- mensaje visible;
- accion recuperable si aplica;
- `data-testid` estable;
- no exponer detalles tecnicos internos.

Selectores recomendados:

```text
practice-loading-state
practice-error-message
practice-empty-state
practice-retry-button
```

### UX-P0-03 — CTA principal claro

El usuario debe poder distinguir:

- iniciar practica;
- responder;
- continuar/siguiente;
- ir al dashboard;
- pedir ayuda al tutor.

No debe haber dos acciones primarias compitiendo en el mismo estado.

### UX-P0-04 — Auth feedback

Errores de login deben:

- ser comprensibles;
- evitar stack traces o codigos crudos;
- permitir reintento;
- conservar seguridad.

### UX-P0-05 — Rutas privadas

Si el usuario llega sin sesion:

- se redirige a login;
- no ve datos privados;
- entiende que debe autenticarse;
- no queda en pantalla vacia.

## Accesibilidad minima

Requisitos Sprint 33:

- botones con nombre accesible;
- estados de error con `role="alert"` cuando aplique;
- feedback post-respuesta con `aria-live="polite"`;
- foco visible;
- contraste razonable;
- no depender solo de color para correcto/incorrecto.

## Relacion con QA

Todo cambio UX P0 debe revisar:

- `docs/04-quality/playwright-selector-standard.md`;
- `docs/04-quality/idempotency-gate-remediation-plan.md`.

Si se toca practice:
- agregar selectores P0 de practice;
- actualizar o preparar ajuste del test de idempotencia.

## Relacion con AppSec

No mejorar UX a costa de seguridad:

- no mostrar errores internos;
- no revelar si un recurso privado existe;
- no exponer tokens/cookies/secrets;
- no debilitar guardrails del Tutor GCM.

## Relacion con Producto

La UX debe reforzar el foco actual:

- practica guiada;
- feedback prudente;
- Tutor GCM como apoyo, no autoridad;
- dashboard con metricas cautelosas;
- cero expansion funcional durante estabilizacion.

## Secuencia recomendada

1. Agregar selectores estables en Practice.
2. Corregir idempotency gate.
3. Revisar loading/error/empty states.
4. Mejorar CTA principal del flujo practice.
5. Ajustar copy de guardrails Tutor GCM si causa confusion.
6. Revisar dashboard signal copy.
7. Revisar mobile y accesibilidad minima.

## Checklist antes de implementar UX

- [ ] cambio no agrega feature nueva;
- [ ] preserva flujo core;
- [ ] no rompe guardrails;
- [ ] agrega testids si es flujo critico;
- [ ] mantiene copy no tecnico;
- [ ] estados error/loading definidos;
- [ ] accesibilidad minima revisada;
- [ ] QA sabe que selector usar.

## Definition of Done Sprint 33.28

- plan UX P0/P1 creado;
- flujo critico protegido documentado;
- criterios de aceptacion P0 definidos;
- relacion con QA/AppSec/Producto explicitada;
- implementacion UI queda pendiente para sprint de codigo posterior.

## Siguiente sprint pequeno

Sprint 33.29 — sincronizar `status.md` y `sprint-log.md` con el avance real del bloque Sprint 33.
