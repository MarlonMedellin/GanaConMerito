Te dejo un **contexto de arranque** para abrir una nueva sesión mía y entrar directo a ejecutar sin reconstruir todo otra vez.

---

# Contexto ejecutivo base

Estoy trabajando en **GanaConMerito**, producto web educativo sobre **Next.js + TypeScript + Supabase + Docker**.
El core real ya existe y funciona: **login, onboarding, práctica y dashboard**.

Ya se cerró un frente fuerte de UI/UX y luego un **Sprint 4 de productización del core**.
El estado actual ya no es “construir MVP”, sino **madurar producto, gobernar el frente de asistentes y endurecer operación/runtime**.

## Estado operativo actual
- fuente canónica de producto: `~/.openclaw/product`
- deploy tree VPS: `/opt/gcm/app`
- env persistente de deploy: `/opt/gcm/env/gcm-app.env`
- repo remoto: `https://github.com/MarlonMedellin/GanaConMerito.git`
- rama principal: `master`

## Regla de oro
- `~/.openclaw/product` = fuente de desarrollo
- `/opt/gcm/app` = árbol de deploy, no fuente principal
- todo fix estable va primero a fuente canónica
- deploy se reconstruye desde Git, no al revés

---

# Estado después de Sprint 4

## Ya quedó hecho
- navegación principal simplificada
- editorial/biblioteca fuera del nav principal del usuario
- hardening UX del core
- estados `LoadingState`, `EmptyState`, `ErrorState`
- mejoras en `home` y `practice`
- versión declarada `0.5.0`

## Commits relevantes
- **Sprint 4 funcional:** `304f950`
- **cierre documental posterior:** `ef13a4f`

## Aclaración importante
- `304f950` = cambio funcional del sprint
- `ef13a4f` = cierre documental, no nueva feature funcional

## Restricciones vigentes
- **Tutor GCM no está implementado funcionalmente**
- editorial sigue existiendo técnicamente, pero no debe tratarse como frente principal de usuario
- no abrir multiagente visible
- no meter lógica crítica dentro del LLM

---

# Sprint 5 — Base técnica de Tutor GCM

## Objetivo
Abrir el frente de asistente de forma gobernada, trazable y testeable.

## Enfoque
- contrato v1 de turno
- input/output estructurado
- flags de incertidumbre
- guardrails
- trazabilidad mínima por turno
- QA negativa
- integración contextual, no chat libre dominante

## No alcance
- multiagente visible
- Tutor GCM con autoridad sobre scoring, sesión o estado
- implementación “rápida” basada en prompts sin contrato

## Regla crítica
Toda lógica crítica sigue fuera del LLM:
- scoring
- transición de estados
- cierre de sesión
- selección de ítems
- disponibilidad del siguiente paso

---

# Sprint 6 — Disciplina operativa de release y runtime

## Objetivo
Hacer el producto más confiable al desplegar, validar y auditar.

## Enfoque
- endurecer checklist de release
- triple verificación:
  - `product`
  - `/opt/gcm/app`
  - runtime visible
- estabilizar smoke y E2E postdeploy
- reducir drift entre código, deploy y docs
- dejar reglas de verdad operativa más sólidas

## No alcance
- features nuevas grandes
- cambios cosméticos sin impacto operativo

---

# Sprint 7 — Reapertura selectiva de editorial / question-bank

## Objetivo
Retomar el frente de contenido cuando ya no compita con core y asistentes.

## Enfoque
- validar banco activo
- gobernanza del corpus
- segmentación editorial/documental
- limpieza de deuda técnica del frente de datos/contenido

## No alcance
- mezclar esto con sprint de UX/core
- abrir editorial como producto de usuario final sin decisión explícita

---

# Sprint 8 — Consolidación productiva y roadmap siguiente

## Objetivo
Cerrar el ciclo de madurez reciente y preparar la siguiente etapa del producto con foco real.

## Enfoque
- revisar lo entregado en core + asistentes + ops
- detectar huecos estructurales
- formalizar roadmap siguiente
- descartar frentes no prioritarios
- dejar una base más sostenible de ejecución

## No alcance
- abrir nuevos frentes por entusiasmo técnico
- inflar alcance sin evidencia de negocio

---

# Guardrails que la nueva sesión debe respetar

1. no usar `/opt/gcm/app` como fuente principal de edición
2. no tocar deploy primero y luego “traer” cambios
3. no abrir Tutor GCM libremente
4. no meter lógica crítica en el LLM
5. no reabrir editorial como módulo principal del usuario
6. no mezclar banco de preguntas con sprint de UX o runtime sin decisión explícita
7. no declarar cierre sin evidencia verificable
8. no confiar solo en `git status`; validar runtime visible cuando aplique

---

# Cómo debe arrancar la nueva sesión
Cuando abras una nueva sesión mía, pégale algo como esto:

> Quiero continuar GanaConMerito desde el estado posterior a Sprint 4.
> La fuente canónica es `~/.openclaw/product`, el deploy tree es `/opt/gcm/app` y el env persistente es `/opt/gcm/env/gcm-app.env`.
> El core real ya funciona y Sprint 4 dejó la app en `0.5.0`, con commit funcional `304f950` y cierre documental posterior `ef13a4f`.
> Quiero que arranquemos con el Sprint 5 / 6 / 7 / 8 [elige uno], respetando los guardrails ya definidos: sin multiagente visible, sin lógica crítica dentro del LLM, sin usar `/opt/gcm/app` como fuente principal, y sin declarar nada sin evidencia verificable.
> Primero dame lectura ejecutiva del estado, alcance propuesto del sprint, no alcance, archivos probables a tocar, pruebas obligatorias y riesgos.

---

Si quieres, te preparo también **4 prompts separados**, uno listo para abrir **cada sprint individual** en sesión nueva.
