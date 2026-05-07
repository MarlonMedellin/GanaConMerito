# UX Audit MVP — 2026-05-07

## 1) UX Executive Summary
Estado general del MVP: **base funcional sólida, pero con fricción evitable en onboarding, microcopy técnica en momentos sensibles y ausencia de feedback progresivo en varios estados críticos**.

El flujo principal (login → onboarding → práctica → dashboard) existe y está bien encaminado, pero la experiencia de primera sesión puede mejorar significativamente con:
- instrucciones más guiadas,
- copy más orientado a acción,
- manejo de estados vacíos/error con próximos pasos explícitos,
- mejoras de accesibilidad (descripciones, ayudas y semántica).

**Diagnóstico global:** `needs-fix`.

## 2) Critical UX Issues
1. **Onboarding sin ayudas contextuales por campo.**
   El formulario exige información válida, pero no explica por qué cada dato importa ni cómo redactarlo bien (especialmente `Meta activa` y `Áreas activas`).
2. **Fricción en “Áreas activas” por entrada libre con coma.**
   Este patrón aumenta errores de formato y carga cognitiva para usuarios nuevos.
3. **Mensajes de estado de práctica demasiado técnicos o ambiguos.**
   Ej.: “no hay un ítem disponible” sin siguiente paso claro.
4. **Jerarquía informativa mejorable en Home.**
   Hay varias tarjetas con contenido cercano; para usuarios nuevos, el CTA principal compite con métricas.
5. **Falta de feedback de progreso visible durante sesión.**
   No se comunica claramente cuántas preguntas faltan o avance relativo.

## 3) Friction Analysis
### Flujo núcleo
- **Login:** claro y directo, pero incluye metadatos técnicos (commit/build) con alta prominencia para usuario final.
- **Onboarding:** estructura simple, pero requiere inferencia del usuario para completar campos correctamente.
- **Práctica:** buen arranque con CTA principal; al fallar disponibilidad de ítems, el sistema informa pero no siempre orienta.
- **Dashboard/Home:** ofrece contexto de progreso, aunque puede saturar tempranamente antes de consolidar activación.

### Puntos de abandono probables
- Campo de áreas activas con parsing manual por comas.
- Error de creación/carga de sesión sin recuperación guiada.
- Falta de claridad sobre “qué gano si hago esto ahora” en algunos CTAs secundarios.

### Time-to-value
- Correcto en arquitectura (flujo corto), pero **subóptimo en comprensión** por falta de microcopy instructivo y validación pedagógica inline.

## 4) Accessibility Findings
1. **Estado de error con texto plano sin vinculación directa a campos específicos.**
   Debería incorporarse asociación explícita (`aria-describedby`) y mensajes por campo.
2. **Entrada de áreas activas sin ayuda semántica persistente.**
   Recomendable helper text visible y ejemplo estructurado.
3. **Componentes de carga/error/empty state correctos en semántica base, pero faltan variantes con acción obligatoria.**
4. **Navegación inferior bien etiquetada (`aria-label`, `aria-current`)**; mantener patrón para nuevas rutas.

## 5) Mobile Findings
- La navegación inferior está bien resuelta para pulgar y continuidad.
- El layout en tarjetas es consistente, pero en onboarding y home pueden aparecer bloques extensos sin segmentación por pasos.
- En móvil, la entrada libre de áreas activas aumenta errores de teclado y autocorrección.

## 6) Priority Fixes
### P0 (crítico)
- Añadir microcopy guiado por campo en onboarding: objetivo, ejemplo bueno/malo, y criterio mínimo.
- Reemplazar o complementar `Áreas activas` con selección asistida (chips sugeridos + autocompletado).
- Mejorar mensajes de error/empty state en práctica con **siguiente acción explícita** (reintentar, volver a onboarding, ir a home).

### P1 (alto)
- Repriorizar Home para que un solo CTA domine visualmente hasta completar activación.
- Agregar indicador de progreso de sesión (pregunta actual / total objetivo).

### P2 (medio)
- Reducir prominencia de metadatos técnicos en Login para usuario estándar (mantener trazabilidad en área secundaria).
- Establecer guía de tono UX para consistencia de microcopy en toda la app.

## 7) Suggested UX Improvements
- Diseñar un **onboarding de 2 pasos** (contexto + configuración), no un bloque único.
- Implementar patrones de “recovery UX”: cada error debe incluir causa probable + acción inmediata.
- Incluir confirmaciones de éxito breves y orientadas a confianza (“Guardado. Tu próxima sesión usará estas áreas”).
- Unificar copy de CTAs en verbo + resultado (“Iniciar práctica guiada”, “Revisar mi progreso”).
- Añadir checklist de primera sesión para reforzar sensación de avance.

## 8) Files Reviewed
- `src/app/page.tsx`
- `src/app/login/page.tsx`
- `src/app/(authenticated)/onboarding/page.tsx`
- `src/components/onboarding/onboarding-form.tsx`
- `src/app/(authenticated)/home/page.tsx`
- `src/app/(authenticated)/practice/page.tsx`
- `src/components/practice/start-practice-form.tsx`
- `src/components/practice/practice-session.tsx`
- `src/components/ui/empty-state.tsx`
- `src/components/ui/loading-state.tsx`
- `src/components/ui/error-state.tsx`
- `src/components/navigation/app-nav.tsx`

## 9) Files Modified
- `docs/ux/mvp-ux-audit-2026-05-07.md`

## 10) Final Status
`needs-fix`
