# Reporte de Diseño: GanaConMerito (Cognition Lab Demo)

Este documento detalla exhaustivamente el diseño, la estructura y la estética de la página demo visitada. Está diseñado para que una IA pueda replicar fielmente el "look and feel" del sitio.

---

## 1. Análisis Visual de Secciones

A continuación se presentan las capturas obtenidas mediante **Chromium Playwright**, detallando cada componente del Dashboard.

````carousel
![Vista General del Dashboard](/home/mdav/.gemini/antigravity/brain/f0088a29-18bb-4dc6-b537-bcfe1834da6f/screenshots/full_page.png)
<!-- slide -->
![Sidebar y Navegación](/home/mdav/.gemini/antigravity/brain/f0088a29-18bb-4dc6-b537-bcfe1834da6f/screenshots/sidebar.png)
<!-- slide -->
![Métricas de Usuario](/home/mdav/.gemini/antigravity/brain/f0088a29-18bb-4dc6-b537-bcfe1834da6f/screenshots/metrics_grid.png)
<!-- slide -->
![Gráfico de Rendimiento](/home/mdav/.gemini/antigravity/brain/f0088a29-18bb-4dc6-b537-bcfe1834da6f/screenshots/bottom_grid.png)
````

### 1.1 Sidebar (Navegación Lateral)
- **Logotipo**: Texto "GanaConMérito" con subtítulo "Inteligencia educativa". Icono de birrete azul.
- **Menú**: Dashboard, Practicar, Métricas e Historial. Cada uno con un icono Lucide de 18px. El ítem activo usa un color de fondo azul tenue (`bg-primary/10`) y una barra de estado lateral.
- **Tutor GCM**: Ubicado en el footer del sidebar. Es una tarjeta con fondo degradado suave, diseñada para resaltar como un "asistente" siempre presente.

### 1.2 Hero y Acción Principal
- **Header**: Título "Dashboard" en `text-3xl` y negrita. Subtítulo en gris tenue.
- **Botón CTA**: "Nueva práctica" en azul vibrante con icono de rayo (`lucide-zap`). Posee un efecto de sombra sutil.

### 1.3 Tarjeta de Sesión Activa
- **Uso**: Informar al usuario sobre su progreso actual.
- **Diseño**: Fondo con opacidad baja del color primario, borde sutil. Incluye el nombre de la materia, número de sesión y una barra de progreso textual (ej. "4/10 preguntas").

### 1.4 Rejilla de Métricas (Kpis)
- Cuatro tarjetas que muestran:
  - **Sesiones**: Contador total.
  - **Precisión**: Porcentaje con indicador de tendencia (verde).
  - **Preguntas**: Total acumulado.
  - **Racha**: Días consecutivos de uso.
- **Iconografía**: Cada tarjeta usa un color de acento diferente (Azul, Violeta, Naranja, Esmeralda).

---

## 2. Sistema de Diseño (Tokens)

### Paleta de Colores (Modo Claro)
| Token | HSL / Valor | Uso |
|-------|-------------|-----|
| `background` | `220 20% 97%` | Fondo principal del sitio. |
| `foreground` | `222 47% 11%` | Texto principal. |
| `primary` | `226 70% 55%` | Azul de marca. |
| `card` | `0 0% 100%` | Fondo de elementos elevados. |
| `border` | `220 13% 91%` | Líneas divisorias. |

---

## 4. Análisis Visual: Versión Móvil

La versión móvil adapta la interfaz para garantizar la usabilidad en pantallas pequeñas, manteniendo la identidad visual pero reestructurando la disposición de los elementos.

````carousel
![Vista General Móvil](/home/mdav/.gemini/antigravity/brain/f0088a29-18bb-4dc6-b537-bcfe1834da6f/screenshots_mobile/full_page_mobile.png)
<!-- slide -->
![Header Móvil](/home/mdav/.gemini/antigravity/brain/f0088a29-18bb-4dc6-b537-bcfe1834da6f/screenshots_mobile/header_mobile.png)
<!-- slide -->
![Menú Desplegable](/home/mdav/.gemini/antigravity/brain/f0088a29-18bb-4dc6-b537-bcfe1834da6f/screenshots_mobile/menu_open_mobile.png)
````

### 4.1 Header y Navegación
- **Header Compacto**: Se sustituye el sidebar por una barra superior fija (`header`) de 56px de altura.
- **Logotipo Simplificado**: Muestra el icono y las siglas "GCM" para optimizar espacio.
- **Menú Hamburguesa**: Un botón a la derecha activa un menú lateral desplegable (drawer) que contiene los mismos links del sidebar original.

### 4.2 Adaptación de Layout (Responsive)
- **Métricas**: La rejilla de 4 columnas pasa a una disposición de **2 columnas x 2 filas**, permitiendo que las tarjetas mantengan un tamaño legible.
- **Botones**: El botón "Nueva práctica" se expande para ocupar un ancho más relevante bajo el título del Dashboard.
- **Espaciado**: Los márgenes laterales se reducen de `p-8` a `p-5` para maximizar el área de contenido.

### 4.3 Jerarquía Visual en Móvil
- El gráfico de rendimiento mantiene su relación de aspecto pero escala su ancho al 100% del viewport.
- Las tarjetas de temas se apilan verticalmente o en una rejilla de 1 columna según el ancho exacto del dispositivo, facilitando el "scroll" natural.

---

## 5. Código y Estructura Técnica

Se han descargado y analizado los siguientes archivos en `scratch/design_capture/`:
- **HTML Estructural**: Uso intensivo de `flex` y `grid` de Tailwind CSS, con prefijos `lg:` para escritorio y clases base para móvil.
- **Animaciones**: Definición de `@keyframes fade-in` para transiciones de entrada y `badge-spin` para elementos interactivos.
- **Gráficos**: Implementados con `Recharts`, utilizando gradientes lineales (`linearGradient`) para el área del gráfico.

> [!IMPORTANT]
> El diseño utiliza la fuente **Inter** (vía Google Fonts) en pesos del 300 al 800 para lograr la jerarquía visual observada.
