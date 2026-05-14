GanaConMerito — Visual Hardening QA / UX Validation Suite
Environment: Production
URL: https://cnsc.profemarlon.com

Objetivo general:
Validar que el hardening visual realmente quedó visible, consistente y usable en producción antes de iniciar el siguiente Sprint enfocado en UX/Product.

Objetivos específicos:
- confirmar coherencia visual
- validar experiencia desktop/mobile
- detectar restos legacy
- detectar fatiga visual
- detectar inconsistencias de layout
- validar navegación y tutor
- validar percepción “premium SaaS educativo”

========================================
1. MATRIZ DE DISPOSITIVOS
========================================

Desktop Wide
- 1440px+
- Chrome

Laptop
- 1280px
- Chrome / Edge

Tablet
- 768px
- Safari/Chrome

Mobile Small
- 375px
- Safari iPhone SE

Mobile Standard
- 390px
- iPhone 12/13/14

Android Medium
- 412px
- Chrome Android

========================================
2. RUTAS OBLIGATORIAS
========================================

Revisar:
- /home
- /practice
- /metrics
- /dashboard (si existe)
- login
- navegación global

========================================
3. VALIDACIÓN VISUAL GLOBAL
========================================

Evaluar:

[ ] sidebar visible y consistente
[ ] navegación móvil clara
[ ] spacing respirado
[ ] jerarquía visual moderna
[ ] cards consistentes
[ ] tipografía coherente
[ ] superficies premium
[ ] sombras suaves coherentes
[ ] bordes consistentes
[ ] CTAs claros
[ ] estados hover/focus correctos
[ ] densidad vertical adecuada
[ ] scroll cómodo
[ ] contrastes accesibles
[ ] lectura cómoda
[ ] sensación SaaS moderna
[ ] ausencia de “pantalla vieja”

Detectar:

[ ] componentes legacy visibles
[ ] cards diferentes entre sí
[ ] botones antiguos
[ ] topnav vieja persistente
[ ] padding inconsistente
[ ] gaps excesivos
[ ] layouts rotos
[ ] scroll innecesario
[ ] overlays molestos
[ ] iconos montados
[ ] textos cortados
[ ] CTA débiles
[ ] pantallas demasiado blancas
[ ] jerarquía pobre
[ ] fatiga visual

========================================
4. HOME TESTING
========================================

Validar:

[ ] hero premium visible
[ ] métricas legibles
[ ] tarjetas modernas
[ ] spacing consistente
[ ] topics grid limpio
[ ] CTA visibles
[ ] navegación clara
[ ] cards hover suaves
[ ] mobile compacto

Detectar:
- secciones vacías
- sensación template genérico
- cards demasiado planas
- exceso de texto
- visual “corporativo viejo”

========================================
5. PRACTICE TESTING
========================================

Validar:

[ ] workspace cognitivo claro
[ ] cabecera visible
[ ] pregunta legible
[ ] opciones cómodas
[ ] CTA responder visible
[ ] feedback claro
[ ] Tutor destacado
[ ] spacing cómodo
[ ] mobile usable
[ ] scroll razonable

Detectar:
- formulario largo
- ruido visual
- opciones muy juntas
- feedback débil
- Tutor perdido visualmente
- botones desalineados

========================================
6. TUTOR GCM TESTING
========================================

Validar:

[ ] panel tutor consistente
[ ] chips guiados visibles
[ ] acciones entendibles
[ ] tipografía clara
[ ] no parece “texto suelto”
[ ] integración visual correcta
[ ] mobile usable

Detectar:
- bloques desordenados
- jerarquía pobre
- panel demasiado plano
- densidad excesiva
- inputs incómodos

========================================
7. MOBILE NAVIGATION TESTING
========================================

MUY IMPORTANTE

Validar:
[ ] apertura/cierre menú
[ ] estados activos
[ ] overlays correctos
[ ] sidebar mobile usable
[ ] scroll del menú correcto
[ ] CTA accesibles
[ ] navegación compacta
[ ] ningún elemento montado

Detectar:
- menú tapa contenido
- scroll horizontal
- botones fuera de pantalla
- overlays pesados
- navegación confusa

========================================
8. UX / PRODUCT REVIEW
========================================

Responder:

1. ¿La app ya parece producto real?
2. ¿El cambio visual es claramente perceptible?
3. ¿La experiencia inspira confianza?
4. ¿Se siente moderna o aún legacy?
5. ¿La navegación reduce carga cognitiva?
6. ¿La práctica invita a continuar?
7. ¿El Tutor aporta claridad visual?
8. ¿El mobile ya es usable seriamente?

========================================
9. EVIDENCIA OBLIGATORIA
========================================

Capturar:

Desktop:
- home
- practice
- metrics
- tutor abierto

Mobile:
- home
- menú abierto
- practice
- feedback respuesta
- tutor
- metrics

========================================
10. SEVERIDAD
========================================

Clasificar issues:

ALTA
- rompe navegación
- layout roto
- botones inaccesibles
- mobile roto
- CTA invisibles

MEDIA
- spacing malo
- cards inconsistentes
- contraste pobre
- scroll excesivo

BAJA
- microalineación
- hover mejorable
- detalles tipográficos

========================================
11. RESULTADO FINAL
========================================

Emitir:

- PASS
- PASS WITH ISSUES
- FAIL

Y responder:

¿El sistema está listo para abrir Sprint UX/Product?