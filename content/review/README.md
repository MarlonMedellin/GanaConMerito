# Question Bank Review

Visor estático y aislado para revisar las preguntas de `content/question-bank-v4/items`.

## Características

- Detecta dinámicamente las carpetas que contienen preguntas JSON.
- Permite cambiar de carpeta y de pregunta.
- Navegación Anterior / Siguiente y con flechas del teclado.
- Búsqueda directa por ID.
- Presenta contexto, enunciado, opciones, respuesta correcta, explicaciones, nota de aprendizaje y metadatos.
- No depende de Next.js, Supabase ni del runtime de la aplicación.

## GitHub Pages

El visor es HTML/CSS/JavaScript puro. Para publicarlo con GitHub Pages, configura Pages para desplegar la rama `web_review_question` y usa como directorio publicado el árbol que incluya `content/review` (o un workflow que publique esa carpeta como artifact de Pages).

La página de entrada es:

`content/review/index.html`

El visor lee el árbol del banco mediante la API pública de GitHub y descarga cada JSON desde `raw.githubusercontent.com`, siempre desde la rama `web_review_question`.
