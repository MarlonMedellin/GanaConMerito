# Propuesta de Reestructuración Intermedia del Banco

## Propósito

Esta estructura intermedia sirve para reclasificar el lote de `content/items/stand-by`
sin tocar todavía el banco canónico de `content/items/`.

Se diseñó con base en:

- la estructura documental vigente del repo, que prioriza `area -> subarea -> competencia`
- la capa editorial secundaria por perfiles docentes
- modelos reales de evaluación docente en Colombia revisados en fuentes MEN y CNSC
- las guías 2025 de prueba pedagógica para:
  - rector o director rural
  - coordinador
  - docente orientador
  - docente de aula preescolar
  - docente de aula básica primaria
  - docente de aula básica secundaria y media

## Principio de diseño

La organización primaria se conserva por área:

- `matematicas`
- `pedagogia`
- `normatividad`
- `gestion`
- `lectura_critica`
- `competencias_ciudadanas`

La segmentación por perfil se usa como segunda capa de trabajo para reubicar y depurar
el banco `stand-by` sin romper la arquitectura base del proyecto.

## Estructura propuesta

```text
content/restructuring-v1/
  docente/
    <area>/
      rector_director_rural/
        basica/
        funcional/
        comportamental/
      coordinador/
        basica/
        funcional/
        comportamental/
      preescolar/
        basica/
        funcional/
        comportamental/
      basica_primaria/
        basica/
        funcional/
        comportamental/
      secundaria_media/
        basica/
        funcional/
        comportamental/
      orientador/
        basica/
        funcional/
        comportamental/
      por_confirmar/
        basica/
        funcional/
        comportamental/
  descartes/
  trazabilidad/
```

## Regla de clasificación

### Primero: área

- `matematicas`: razonamiento cuantitativo, pensamiento numérico, análisis de datos, resolución de problemas.
- `pedagogia`: didáctica, evaluación, currículo, planeación, inclusión, mediación, práctica pedagógica.
- `normatividad`: marco legal, derechos, convivencia, rutas, función docente, inclusión normativa.
- `gestion`: PEI, liderazgo, seguimiento, indicadores, gestión académica, gestión directiva, planeación institucional.
- `lectura_critica`: comprensión, inferencia, análisis argumentativo, interpretación textual, evaluación de fuentes.
- `competencias_ciudadanas`: convivencia, participación, pluralidad, conflicto, ética, comunicación, clima escolar.

### Segundo: perfil

- `rector_director_rural`: liderazgo escolar, gestión institucional, relación con comunidad, dirección, participación, seguimiento.
- `coordinador`: acompañamiento académico, convivencia, articulación institucional, seguimiento docente, gestión intermedia.
- `preescolar`: desarrollo integral, juego, identidad, autonomía, ambientes de aprendizaje, interacción y cuidado.
- `basica_primaria`: mediación pedagógica generalista, diagnóstico, evaluación, inclusión, aula, convivencia.
- `secundaria_media`: didáctica disciplinar, pensamiento científico, evaluación, currículo, análisis de aula.
- `orientador`: convivencia, orientación escolar, rutas de atención, proyectos de vida, remisiones, prevención.
- `por_confirmar`: usar solo cuando la carpeta o el ítem no permitan inferencia responsable de perfil.

### Tercero: tipo de ítem

- `basica`: conocimiento transversal, comprensión conceptual o normativa, aplicación breve.
- `funcional`: aplicación al rol, decisión de proceso, análisis técnico, actuación misional.
- `comportamental`: juicio situacional, comunicación, orientación al usuario, responsabilidad institucional.

## Criterio operativo para mover ítems

1. No reescribir contenido en esta fase.
2. Clasificar por el mejor ajuste defendible.
3. Cuando el perfil sea dudoso, usar `por_confirmar`.
4. Cuando el tipo de ítem sea mixto, escoger el propósito dominante.
5. No enviar a `descartes` por ambigüedad de clasificación; los descartes son para problemas de calidad, no de ubicación.

## Relación con el banco canónico

Esta estructura no reemplaza la arquitectura final del banco.

Su función es:

1. servir de mesa de trabajo ordenada
2. permitir clasificación por perfil sin tocar `content/items/`
3. facilitar una segunda pasada de ajuste psicométrico por lotes homogéneos
