# GanaConMérito — Product opportunity mockup

Prototipo estático y aislado. No modifica el runtime Next.js, Supabase, migraciones ni el banco V4.

## Qué recrea

- Login (`#login`)
- Onboarding (`#onboarding`)
- Home (`#home`)
- Practice (`#practice`)
- Dashboard / progreso (`#dashboard`)

El mockup usa datos ficticios representativos y respeta la regla de seguridad V4: antes de responder no muestra clave, explicaciones ni learning note; la pista guía sin revelar la respuesta.

## Hipótesis de mejora

**Convertir GanaConMérito de una práctica con dashboard retrospectivo en un entrenador adaptativo orientado a la próxima mejor acción.**

El contrato V4 ya contiene `domain`, `topic`, `competency`, `questionType`, `cognitiveLevel`, `hint`, `explanations`, `learningNote` y `estimatedDifficulty`. Combinados con los intentos del usuario permiten que Home y Dashboard no se limiten a reportar resultados: pueden recomendar la siguiente micro-sesión y abrir Practice ya enfocada.

Flujo propuesto:

`diagnóstico observado → foco prioritario → micro-sesión recomendada → práctica → feedback → actualización del foco`

Esto conserva una regla importante: `estimatedDifficulty` es editorial y no debe presentarse como calibración psicométrica.

## Ubicación

Se usa `content/product-mockup/`, no `content/question-bank-v4/items/`. `items/` es el almacén canónico de reactivos V4 y mezclar UI allí rompería la separación entre producto y contenido.

## Ver localmente

Abrir `content/product-mockup/index.html` en un navegador o servir el repositorio con cualquier servidor HTTP estático.

## GitHub Pages

GitHub Pages solo publica una fuente configurada por repositorio. Si el repositorio ya usa Pages para otra superficie, **no cambies su source a esta rama sin verificar primero qué publicación reemplazarías**.

### Opción A — preview temporal desde esta rama

En GitHub: `Settings → Pages → Build and deployment → Source: Deploy from a branch` y seleccionar:

- Branch: `mockup/product-opportunity-20260824`
- Folder: `/ (root)`

La URL esperada del archivo será:

`https://marlonmedellin.github.io/GanaConMerito/content/product-mockup/`

Esto publica el árbol de esa rama y puede sustituir la fuente Pages actualmente configurada.

### Opción B — recomendada si Pages ya está ocupado

Mantener esta rama como prototipo y, cuando se apruebe, integrar **solo** `content/product-mockup/` en la rama que Pages ya publica. Así el mockup queda disponible bajo `/content/product-mockup/` sin cambiar la fuente de Pages ni afectar la app productiva.

## Alcance

Este prototipo es deliberadamente estático. No autentica, no consulta Supabase, no usa claves reales y no altera la aplicación productiva.