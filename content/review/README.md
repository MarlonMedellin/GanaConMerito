# Revisión del banco de preguntas

Frontend estático, aislado y orientado a lectura para revisar las preguntas de `content/question-bank-v4/items`.

## Qué permite hacer

- Ver todas las carpetas existentes dentro de `items`, incluso si alguna está vacía.
- Cambiar de carpeta con un clic.
- Ver la lista de preguntas de la carpeta seleccionada.
- Abrir cada pregunta como una ficha legible, sin mostrar JSON crudo.
- Leer contexto, enunciado y opciones A/B/C/D.
- Revelar bajo demanda la respuesta correcta, explicaciones, pista y nota de aprendizaje.
- Consultar metadatos de la pregunta.
- Recorrer preguntas con Anterior / Siguiente o con las flechas del teclado.
- Buscar por ID y, para preguntas ya cargadas, por texto.
- Mantener en la URL la carpeta y el ID de la pregunta seleccionada.

## Aislamiento

El sistema vive en `content/review/` y no depende de Next.js, Supabase ni del runtime de GanaConMerito.

La única pieza adicional es `.github/workflows/question-review-pages.yml`, que publica exclusivamente `content/review/` en GitHub Pages desde la rama `web_review_question`.

## GitHub Pages

El workflow `Question Bank Review Pages` se ejecuta al modificar:

- `content/review/**`
- `content/question-bank-v4/items/**`
- el propio workflow

La carpeta publicada como sitio es únicamente:

`content/review`

El frontend lee el árbol del banco desde GitHub y las preguntas JSON desde `raw.githubusercontent.com`, siempre usando la rama `web_review_question`.
