# Plantillas y estructura de preguntas para GanaConMerito

## Objetivo

Definir una estructura clara, consistente y reutilizable para crear todas las preguntas del proyecto, alineada con el modelo actual del sistema.

Esta guía responde tres cosas:

1. qué campos debe tener cada pregunta
2. cómo se redacta cada sección
3. cómo conviene organizar el banco de preguntas

---

# 1. Principio rector de organización

## Recomendación principal

**Organiza primero por contenido/área/competencia**, no por aspirante o cargo como eje principal del banco.

## Por qué

Porque el modelo actual del proyecto está basado en:
- `area`
- `subarea`
- `competency`
- `difficulty`
- `examType`
- `targetLevel`

Y porque una misma pregunta puede servir para:
- distintos cargos
- distintos aspirantes
- distintas fases del entrenamiento

si el contenido y la competencia evaluada son pertinentes.

## Entonces

### Eje primario recomendado
- **área**
- **subárea**
- **competencia**

### Ejes secundarios recomendados
- `examType`
- `targetLevel`
- dificultad
- contexto normativo o pedagógico

### Ejes terciarios opcionales
- tipo de aspirante
- cargo
- convocatoria específica
- entidad

---

# 2. Estructura canónica actual de una pregunta

Cada pregunta en el proyecto debe seguir el modelo editorial actual del sistema.

## Campos canónicos del frontmatter

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

## Campos secundarios opcionales

- `targetRole`
- `targetPosition`
- `applicantProfile`
- `tags`

## Secciones mínimas del cuerpo

- `Enunciado`
- `Opciones`
- `RespuestaCorrecta`
- `Explicacion`

## Sección recomendada

- `ErroresFrecuentes`

---

# 3. Definición de cada campo

## 3.1 `id`
### Qué es
Identificador editorial estable de la pregunta.

### Regla
- no debe cambiar aunque el texto evolucione
- debe ser único
- sirve como identidad canónica del contenido

### Ejemplo
```yaml
id: item-doc-0007
```

---

## 3.2 `slug`
### Qué es
Identificador funcional, humano y legible.

### Regla
- único
- corto pero descriptivo
- estable en lo posible
- útil para rastreo editorial

### Ejemplo
```yaml
slug: pedagogia-evaluacion-formativa-001
```

---

## 3.3 `title`
### Qué es
Nombre breve y claro del ítem.

### Regla
- no debe ser demasiado largo
- debe describir el foco cognitivo del ítem
- sirve para identificarlo rápidamente en listados

### Ejemplo
```yaml
title: Uso pedagógico de la evaluación formativa
```

---

## 3.4 `area`
### Qué es
Área temática principal.

### Regla
Debe pertenecer al dominio real del proyecto.

### Valores actuales conocidos
- `matematicas`
- `pedagogia`
- `normatividad`
- `gestion`
- `lectura_critica`
- `competencias_ciudadanas`

### Ejemplo
```yaml
area: pedagogia
```

---

## 3.5 `subarea`
### Qué es
Subdominio más específico dentro del área.

### Regla
- ayuda a clasificar mejor el banco
- no debe inventarse sin criterio
- debe ser consistente dentro de cada área

### Ejemplo
```yaml
subarea: evaluacion_del_aprendizaje
```

---

## 3.6 `examType`
### Qué es
Tipo general de examen o población objetivo.

### Regla actual
En el estado actual del proyecto, el valor realmente soportado es:
- `docente`

### Ejemplo
```yaml
examType: docente
```

---

## 3.7 `competency`
### Qué es
Competencia específica que la pregunta evalúa.

### Regla
Debe expresar el proceso o capacidad central medida por el ítem.

### Ejemplos
```yaml
competency: razonamiento_cuantitativo
competency: interpretacion_normativa
competency: planeacion_pedagogica
```

---

## 3.8 `difficulty`
### Qué es
Nivel de dificultad en escala numérica continua.

### Regla
- valor entre `0.00` y `1.00`
- no usar etiquetas en vez del número
- el número debe reflejar dificultad relativa esperada

### Sugerencia de interpretación
- `0.00 - 0.29` baja
- `0.30 - 0.59` media
- `0.60 - 0.79` alta
- `0.80 - 1.00` muy alta

### Ejemplo
```yaml
difficulty: 0.45
```

---

## 3.9 `targetLevel`
### Qué es
Nivel esperado del ítem como orientación editorial.

### Regla
No sustituye la dificultad, la complementa.

### Ejemplos
```yaml
targetLevel: basico
targetLevel: intermedio
targetLevel: avanzado
```

---

## 3.10 `targetRole`
### Qué es
Rol macro o familia general de la población objetivo.

### Regla
Usarlo solo cuando añada valor de segmentación.

### Ejemplo
```yaml
targetRole: docente
```

---

## 3.11 `targetPosition`
### Qué es
Cargo o perfil principal al que se orienta el ítem.

### Regla
Usarlo solo cuando el ítem tenga una pertinencia clara para un perfil específico.

### Valores recomendados para esta línea del banco
- `rector_director_rural`
- `coordinador`
- `docente_aula_preescolar`
- `docente_aula_basica_primaria`
- `docente_aula_secundaria_media`
- `docente_orientador`

### Ejemplo
```yaml
targetPosition: coordinador
```

---

## 3.12 `applicantProfile`
### Qué es
Agrupador editorial más amplio para reunir varios cargos afines.

### Valores recomendados
- `directivo_docente`
- `docente_de_aula`
- `docente_orientador`

### Ejemplo
```yaml
applicantProfile: directivo_docente
```

---

## 3.13 `tags`
### Qué es
Lista de etiquetas opcionales para afinidades secundarias o filtros livianos.

### Regla
- usar pocas
- mantener vocabulario controlado
- no reemplazar `area`, `subarea` ni `competency`

### Ejemplo
```yaml
tags:
  - perfil:coordinador
  - foco:seguimiento_academico
```

---

## 3.14 `itemType`
### Qué es
Tipo de pregunta.

### Regla actual
Actualmente el sistema soporta:
- `multiple_choice`

### Ejemplo
```yaml
itemType: multiple_choice
```

---

## 3.15 `normativeRefs`
### Qué es
Lista de referencias normativas asociadas al ítem.

### Regla
- usar lista
- puede ir vacía si no aplica
- si aplica, referenciar la fuente normativa de forma consistente

### Ejemplo
```yaml
normativeRefs:
  - ley_1098
  - decreto_1075
```

---

## 3.16 `published`
### Qué es
Indica si el ítem está publicado para uso efectivo.

### Regla
- `true` o `false`

### Ejemplo
```yaml
published: true
```

---

## 3.17 `version`
### Qué es
Versión editorial del ítem.

### Regla
- iniciar en `1`
- aumentar cuando el contenido cambie de forma sustancial

### Ejemplo
```yaml
version: 1
```

---

# 4. Definición de cada sección del cuerpo

## 4.1 `Enunciado`
### Qué es
La situación, problema o pregunta central que debe resolver el aspirante.

### Regla
- debe ser clara
- debe evaluar una sola intención principal
- debe evitar ruido innecesario
- debe contener suficiente contexto, pero sin exceso
- debe evitar ambigüedad estructural

### Buena práctica
Si es un caso, primero plantea el contexto y luego la pregunta.

---

## 4.2 `Opciones`
### Qué es
Las cuatro alternativas de respuesta.

### Regla
- exactamente 4 opciones
- A, B, C, D
- no vacías
- no repetidas
- distractores plausibles
- no deben delatar la respuesta correcta por forma, longitud o tono

### Regla editorial fuerte
Cada distractor debe representar un error razonable, no una tontería evidente.

---

## 4.3 `RespuestaCorrecta`
### Qué es
La clave de la opción correcta.

### Regla
- solo una
- debe ser una de: `A`, `B`, `C`, `D`

---

## 4.4 `Explicacion`
### Qué es
Justificación clara de por qué la respuesta correcta es correcta.

### Regla
- no limitarse a repetir la letra
- explicar el criterio
- si aplica, justificar por competencia, lógica o norma
- útil para retroalimentación formativa

---

## 4.5 `ErroresFrecuentes`
### Qué es
Lista de fallos típicos que explican por qué alguien podría equivocarse.

### Regla
- no es obligatoria, pero sí muy recomendable
- útil para diseñar distractores y retroalimentación

### Ejemplos
- confundir norma aplicable
- interpretar literalmente sin analizar contexto
- aplicar una fórmula incorrecta
- elegir una opción intuitiva pero no sustentada

---

# 5. Plantilla maestra de pregunta

```md
---
id: item-doc-001
slug: area-subtema-001
title: Título breve y claro
area: pedagogia
subarea: subarea_correspondiente
examType: docente
competency: competencia_especifica
difficulty: 0.45
targetLevel: intermedio
targetRole: docente
targetPosition: coordinador
applicantProfile: directivo_docente
tags:
  - perfil:coordinador
itemType: multiple_choice
normativeRefs: []
published: true
version: 1
---

## Enunciado
Aquí va el enunciado completo de la pregunta.

## Opciones
- A. Opción A
- B. Opción B
- C. Opción C
- D. Opción D

## RespuestaCorrecta
B

## Explicacion
Aquí va la explicación clara de por qué la respuesta correcta es la adecuada.

## ErroresFrecuentes
- Error frecuente 1
- Error frecuente 2
- Error frecuente 3
```

---

# 6. Plantillas por tipo de contenido

## 6.1 Plantilla de pregunta conceptual
Úsala cuando se evalúa comprensión de conceptos, principios o criterios.

### Estructura sugerida
- título centrado en el concepto
- enunciado breve
- opciones que distingan comprensión real de memorización superficial
- explicación centrada en el criterio conceptual

### Ejemplo de uso
- pedagogía
- lectura crítica
- competencias ciudadanas

---

## 6.2 Plantilla de pregunta basada en caso
Úsala cuando se evalúa análisis aplicado, toma de decisión o juicio contextual.

### Estructura sugerida
1. contexto del caso
2. tensión o problema
3. pregunta final explícita
4. distractores plausibles basados en errores de criterio

### Ejemplo de uso
- gestión
- normatividad
- pedagogía

---

## 6.3 Plantilla de pregunta procedimental
Úsala cuando se evalúa una secuencia, regla, método o procedimiento.

### Estructura sugerida
- situación o dato inicial
- procedimiento esperado
- opciones basadas en errores comunes del proceso

### Ejemplo de uso
- matemáticas
- planeación
- procesos administrativos o normativos

---

## 6.4 Plantilla de pregunta normativa
Úsala cuando el núcleo es interpretar o aplicar una norma.

### Estructura sugerida
- contexto concreto
- norma o marco implícito o explícito
- pregunta orientada a aplicación correcta
- explicación sustentada en la referencia normativa

### Recomendación adicional
Aquí sí conviene usar `normativeRefs` con rigor.

---

# 7. Cómo conviene organizar el banco de preguntas

## Recomendación principal de árbol editorial

```text
content/items/
  matematicas/
  pedagogia/
  normatividad/
  gestion/
  lectura_critica/
  competencias_ciudadanas/
```

## Dentro de cada área
Conviene agrupar por combinación lógica de:
- subárea
- competencia
- consecutivo

### Ejemplo de slug
```text
pedagogia-evaluacion-formativa-001
normatividad-convivencia-escolar-001
matematicas-pensamiento-numerico-001
```

---

# 8. ¿Conviene organizarlas por aspirante, tipo de cargo o convocatoria?

## Respuesta breve
**No como eje principal. Sí como metadato secundario si luego hace falta.**

## Recomendación

### No hacer esto como estructura primaria
```text
content/items/
  rector/
  docente/
  coordinador/
```

### Mejor hacer esto
```text
content/items/
  area/
    item...
```

y si luego necesitas diferenciar por convocatoria o cargo, agregar un metadato posterior o una capa de clasificación adicional.

## Razón
Porque:
- el contenido es más reusable que el cargo
- la competencia es más estable que la convocatoria
- el motor adaptativo funciona mejor con ejes cognitivos que con etiquetas administrativas

---

# 9. Esquema recomendado de clasificación

## Eje 1 — obligatorio
- área
- subárea
- competencia

## Eje 2 — obligatorio
- dificultad
- targetLevel

## Eje 3 — actual del sistema
- examType

## Eje 4 — opcional
- `targetRole`
- `targetPosition`
- `applicantProfile`
- `tags`

## Eje 5 — futuro opcional
- convocatoria
- entidad
- contexto territorial

---

# 10. Checklist de calidad por pregunta

## Obligatorio
- frontmatter completo
- `difficulty` entre 0 y 1
- `itemType` válido
- exactamente 4 opciones
- una sola correcta
- explicación clara
- slug único
- competencia definida
- área y subárea coherentes
- `published` definido

## Recomendado
- errores frecuentes documentados
- distractores plausibles
- redacción clara
- sin ambigüedad innecesaria
- referencia normativa si aplica
- metadatos secundarios solo cuando agregan valor real

---

# 11. Recomendación final

## Cómo organizar hoy
Organiza las preguntas así:

### Primario
- por **contenido**
- por **área**
- por **competencia**

### Secundario
- por **dificultad**
- por **nivel objetivo**
- por **tipo de examen**

### Tercera capa opcional
- por **perfil docente** usando metadatos secundarios

### Futuro
Agrega luego filtros por:
- convocatoria
- entidad

## Decisión editorial recomendada

**El contenido debe ser la base del banco.**

No construyas primero un banco “por cargo”; construye primero un banco **por competencias y áreas**, y después etiquetas o filtras según el cargo o aspirante.
