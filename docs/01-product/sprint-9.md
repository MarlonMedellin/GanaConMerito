# PROMPT MAESTRO — Sprint 9 GanaConMerito

## Contexto ejecutivo
Trabajas sobre GanaConMerito, con una base ya estabilizada en sus frentes críticos de core funcional, release discipline y runtime verificable. El producto ya tiene operativos y endurecidos los flujos de login, onboarding, práctica y dashboard. Tutor GCM ya existe como base técnica gobernada, pero todavía no debe comportarse como chat libre ni tomar control sobre lógica crítica del sistema.

Los cierres recientes relevantes son:
- Sprint 4 — productización del core: `304f950`
- Sprint 5 — Tutor GCM base técnica gobernada: `5e918a5`
- Sprint 6 — disciplina operativa release/runtime: `deb265c`
- Sprint 7 — reapertura selectiva editorial/question-bank: `c7ec88c`
- Sprint 8 — confiabilidad operativa y QA postdeploy: HEAD documental `a2fb913`, último runtime triple-verificado `c7ec88c`

El estado actual exige preservar separación estricta entre:
- fuente canónica de desarrollo
- árbol de deploy
- runtime visible realmente verificado

## Estado operativo actual
Fuente canónica:
- `/home/ubuntu/.openclaw/product`

Deploy tree VPS:
- `/opt/gcm/app`

Env persistente de deploy:
- `/opt/gcm/env/gcm-app.env`

Repo remoto:
- `https://github.com/MarlonMedellin/GanaConMerito.git`

Rama principal:
- `master`

Situación operativa:
- el core está estable
- Tutor GCM existe pero aún no está integrado como experiencia funcional mínima visible completa
- editorial/question-bank sigue gobernado y no debe contaminar este sprint
- la disciplina operativa de verificación ya es obligatoria y no negociable

## Regla de oro
Se desarrolla primero en `~/.openclaw/product`.
`/opt/gcm/app` no es fuente principal.
Todo fix estable debe vivir primero en Git fuente canónica.
Luego se alinea deploy.
No se cierra nada sin evidencia verificable.
Todo lo que aplique debe quedar correctamente persistido en el VPS en su ubicación pertinente.

## Objetivo del sprint
Implementar la **integración funcional mínima gobernada de Tutor GCM** dentro del producto, de forma visible y útil para el usuario, sin abrir chat libre, sin romper guardrails y sin transferir al LLM autoridad sobre verdad operativa o lógica crítica.

## Resultado esperado
Al final del sprint debe existir una experiencia mínima funcional de Tutor GCM:
- visible dentro del producto
- coherente con la UX existente
- gobernada por reglas explícitas
- acotada a su rol permitido
- conectada al flujo real sin invadir scoring, avance, cierre de sesión ni estado operativo fuente de verdad

Debe quedar verificable con evidencia técnica y QA que:
- el componente aparece donde corresponde
- hace únicamente lo autorizado
- no rompe core app
- no introduce regresiones operativas
- no simula capacidades que no controla realmente

## Alcance autorizado
Está autorizado:
- integrar Tutor GCM como componente/experiencia visible mínima dentro de la app
- definir su punto exacto de entrada en la UX
- acotar prompts, contrato UI y comportamiento funcional mínimo
- conectar su uso con contexto permitido del usuario o de la pantalla si ya existe infraestructura segura para ello
- fortalecer validaciones de borde para impedir usos fuera de guardrail
- ajustar textos, estados vacíos, loading, errores y affordances UX necesarias para esa integración mínima
- crear o refinar documentación operativa y técnica directamente relacionada con esta integración

## No alcance
No está autorizado:
- convertir Tutor GCM en chat libre
- darle autoridad sobre scoring
- darle autoridad sobre avance
- darle autoridad sobre cierre de sesión
- darle autoridad sobre verdad operativa del sistema
- mezclar este sprint con expansión editorial o question-bank como frente principal
- reabrir hardening amplio de runtime salvo si aparece un bloqueo real causado por esta integración
- rehacer toda la UX del producto
- meter nuevas ambiciones de producto no necesarias para la integración mínima

## Guardrails obligatorios
1. Tutor GCM no puede convertirse en chat libre.
2. Tutor GCM no puede decidir ni persistir lógica crítica.
3. La verdad operativa sigue fuera del LLM.
4. Cualquier integración debe ser explícitamente gobernada, acotada y verificable.
5. No se toca `/opt/gcm/app` como fuente de desarrollo.
6. No se declara cierre sin evidencia real.
7. Si algo requiere persistencia en VPS, debe quedar realmente aplicado donde corresponde.
8. Si surge conflicto entre “experiencia bonita” y “control operacional”, gana control operacional.
9. No contaminar alcance con editorial/question-bank salvo dependencia estrictamente necesaria.

## Principio central del sprint
**Hacer visible y útil a Tutor GCM sin soltar el control del sistema.**

## Líneas de trabajo esperadas
- definir el entry point UX exacto de Tutor GCM
- implementar integración mínima de frontend
- verificar contrato funcional permitido del tutor
- asegurar restricciones de backend o capa intermedia si aplican
- bloquear comportamientos fuera de alcance
- revisar estados de carga, error, vacío y fallback
- alinear trazabilidad/documentación del comportamiento real
- correr QA dirigida a no regresión del core y a guardrails del tutor

## Archivos probables a tocar
Tócalos solo si la implementación lo requiere de verdad, pero espera trabajar en zonas como:
- `src/app/**`
- `src/components/**`
- `src/lib/**`
- `src/features/**` o equivalente si existe
- handlers/rutas API relacionadas con Tutor GCM
- archivos de configuración de producto estrictamente ligados a esta feature
- documentación viva del sprint, status, backlog, changelog y/o arquitectura
- scripts o utilidades de QA si hace falta cubrir guardrails nuevos

## Archivos que no debería tocar salvo necesidad real
Evita tocar, salvo dependencia real demostrable:
- piezas nucleares de scoring
- flujos centrales de avance de sesión
- lógica terminal/cierre de sesión
- runtime/release plumbing no relacionado
- módulos de editorial/question-bank fuera de lo indispensable
- infra de deploy no relacionada con esta integración
- artefactos generados o árboles de build como fuente de verdad

## Tipo de solución esperada
Se espera una solución:
- mínima pero real
- integrada, no simulada superficialmente
- segura en guardrails
- operativamente verificable
- fácil de extender en Sprint 10+ sin rehacer arquitectura
- conservadora en alcance y agresiva en claridad de límites

## Pruebas obligatorias
Como mínimo:
- build/lint/typecheck si existen en el proyecto
- smoke funcional del flujo afectado
- prueba positiva de visibilidad/uso básico de Tutor GCM
- pruebas negativas que demuestren que no puede actuar como chat libre
- pruebas negativas que demuestren que no controla scoring, avance o cierre
- QA de no regresión sobre login/onboarding/práctica/dashboard si el touchpoint los afecta
- evidencia explícita de qué commit quedó en source
- si hay deploy: evidencia de árbol deploy y runtime visible, no solo source

## Riesgos a vigilar
- abrir accidentalmente un chat libre disfrazado
- dejar al tutor emitir acciones o respuestas con autoridad implícita falsa
- contaminar UX core con complejidad innecesaria
- romper práctica/dashboard al insertar la integración
- mezclar este sprint con editorial/question-bank
- cierre narrativo sin verificación real
- drift entre source, deploy y runtime
- estados UI ambiguos que hagan creer al usuario que el tutor “decide” cosas del sistema

## Método de ejecución por fases
### Fase 0 — Reconstrucción rápida y validación de base
- confirmar estado actual del repo fuente canónica
- identificar implementación existente de Tutor GCM
- ubicar entry points UX y contrato actual
- confirmar qué commit/runtime son la base real de trabajo

### Fase 1 — Diseño operativo mínimo
- proponer integración mínima exacta
- delimitar comportamiento autorizado
- delimitar explícitamente no alcance técnico y UX
- identificar archivos a tocar antes de implementar

### Fase 2 — Implementación controlada
- ejecutar cambios mínimos necesarios
- mantener aislada la lógica crítica
- introducir guardrails técnicos y de UX
- evitar expansión lateral del alcance

### Fase 3 — Verificación técnica
- correr pruebas
- ejecutar validaciones positivas y negativas
- revisar regresiones del core
- corregir fallas antes de hablar de cierre

### Fase 4 — Evidencia operativa y documentación
- registrar qué quedó realmente implementado
- documentar límites del tutor
- dejar trazabilidad clara de source, y si aplica deploy/runtime
- cerrar solo con evidencia comprobable

## Criterio de terminado
El sprint solo se considera terminado si:
- Tutor GCM quedó integrado de forma mínima y visible
- su comportamiento está gobernado y limitado
- no actúa como chat libre
- no controla lógica crítica
- el core no quedó roto
- existe evidencia de pruebas suficientes
- la documentación operativa quedó alineada
- cualquier persistencia/deploy requerido quedó realmente aplicado y verificable

## Formato obligatorio de primera respuesta
Tu primera respuesta debe venir exactamente en esta estructura:

1. **Lectura del objetivo del sprint**
2. **Supuestos operativos explícitos**
3. **Riesgos principales detectados antes de tocar código**
4. **Plan de ejecución por fases**
5. **Archivos que probablemente tocaré**
6. **Archivos que evitaré tocar**
7. **Pruebas que usaré para validar el cierre**

No empieces implementando en silencio. Primero alinea lectura, alcance y plan.

## Formato obligatorio de entrega final
La entrega final debe venir exactamente en esta estructura:

1. **Resumen ejecutivo del resultado**
2. **Qué se implementó realmente**
3. **Qué no se implementó y por qué**
4. **Archivos tocados**
5. **Guardrails preservados**
6. **Pruebas ejecutadas y resultado**
7. **Evidencia de source**
8. **Evidencia de deploy** *(si aplica)*
9. **Evidencia de runtime visible** *(si aplica)*
10. **Riesgos abiertos o deuda remanente**
11. **Criterio de cierre: cumplido / no cumplido**

Si no logras evidencia suficiente, debes decir explícitamente que el sprint **no está cerrable**.
