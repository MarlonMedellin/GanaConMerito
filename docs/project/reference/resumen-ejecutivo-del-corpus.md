# Resumen ejecutivo del corpus de preguntas

## Propósito

Este documento resume, en una sola página, cómo debe entenderse y construirse el corpus de preguntas de GanaConMerito.

---

## Qué es el corpus

El corpus es el banco estructurado de preguntas que alimenta:
- práctica
- diagnóstico
- remediación
- revisión
- retroalimentación
- analítica de progreso

No es una colección suelta de preguntas, sino una estructura editorial y evaluativa con lógica pedagógica.

---

## Regla principal de organización

### Recomendación central

**Organizar primero por contenido, área, subárea y competencia.**

No conviene organizar el banco principalmente por:
- cargo
- aspirante
- convocatoria
- entidad

Esas variables pueden agregarse después como filtros secundarios.

---

## Estructura recomendada

### Nivel 1
- área

### Nivel 2
- subárea

### Nivel 3
- competencia

### Nivel 4
- dificultad (`0.00` a `1.00`)

### Nivel 5
- nivel objetivo (`basico`, `intermedio`, `avanzado`)

### Nivel 6
- tipo de examen (`examType`)

### Nivel 7 opcional
- segmentación secundaria por perfil docente (`targetRole`, `targetPosition`, `applicantProfile`, `tags`)

---

## Áreas actuales del proyecto

- `matematicas`
- `pedagogia`
- `normatividad`
- `gestion`
- `lectura_critica`
- `competencias_ciudadanas`

---

## Tipos funcionales de preguntas

Aunque el sistema actual usa `multiple_choice`, el corpus debe contemplarse editorialmente en estas familias:

- preguntas conceptuales
- preguntas basadas en caso
- preguntas procedimentales
- preguntas normativas

---

## Estructura canónica de una pregunta

### Frontmatter mínimo
- `id`
- `slug`
- `title`
- `area`
- `subarea`
- `examType`
- `competency`
- `difficulty`
- `targetLevel`
- `itemType`
- `normativeRefs`
- `published`
- `version`

### Frontmatter opcional de segunda capa
- `targetRole`
- `targetPosition`
- `applicantProfile`
- `tags`

### Cuerpo mínimo
- `Enunciado`
- `Opciones`
- `RespuestaCorrecta`
- `Explicacion`

### Recomendado
- `ErroresFrecuentes`

---

## Criterios de calidad

Cada pregunta debe:
- evaluar una competencia clara
- tener enunciado comprensible
- tener 4 opciones plausibles
- tener una sola correcta
- tener distractores razonables
- incluir explicación útil
- poder importarse sin errores técnicos
- no sustituir la taxonomía base por etiquetas de cargo

---

## Nomenclatura recomendada

### `id`
Estable y editorial.

Ejemplo:
- `item-ped-0001`
- `item-nor-0003`

### `slug`
Legible y funcional.

Formato sugerido:
```text
<area>-<subtema>-<consecutivo>
```

Ejemplos:
- `pedagogia-evaluacion-formativa-001`
- `normatividad-convivencia-escolar-001`
- `matematicas-pensamiento-numerico-001`

---

## Estructura recomendada de carpetas

```text
content/items/
  matematicas/
  pedagogia/
  normatividad/
  gestion/
  lectura_critica/
  competencias_ciudadanas/

content/profiles/
  docente/
    rector_director_rural/
    coordinador/
    docente_aula_preescolar/
    docente_aula_basica_primaria/
    docente_aula_secundaria_media/
    docente_orientador/
```

---

## Regla de uso de carpetas

- `content/items/` guarda los ítems finales canónicos.
- `content/profiles/docente/` guarda mapas, lotes, criterios y trabajo editorial por perfil.
- Los ítems finales no deben duplicarse entre ambas superficies.

---

## Estrategia de crecimiento

### Primero
Construir un banco pequeño, limpio y consistente.

### Después
Expandir cobertura por:
- áreas
- subáreas
- competencias
- niveles de dificultad

### Más adelante
Agregar filtros secundarios por:
- cargo
- aspirante
- convocatoria
- entidad

---

## Idea fuerza final

**Primero contenido y competencia. Después segmentación administrativa.**

Ese debe ser el criterio rector del banco.

---

## Documentos complementarios

- `docs/project/reference/descripcion-del-corpus-de-preguntas.md`
- `docs/project/reference/plantillas-y-estructura-de-preguntas.md`
- `docs/project/reference/taxonomia-y-nomenclatura-del-banco-de-preguntas.md`
- `docs/project/reference/estructura-hibrida-taxonomia-perfiles-docente.md`
- `docs/project/reference/metadatos-secundarios-perfiles-docente.md`
- `docs/project/reference/guia-decision-perfiles-docente.md`
- `docs/project/reference/ejemplos-modelo-de-preguntas.md`
- `docs/project/reference/checklist-de-validacion-editorial.md`
