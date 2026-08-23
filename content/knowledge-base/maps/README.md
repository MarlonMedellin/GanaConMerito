# Mapas de aplicabilidad de conocimiento

Esta carpeta relaciona fuentes de `content/knowledge-base/` con los destinatarios de
`content/targeting/` sin duplicar documentos.

## Modelo

```text
fuente única
   ├── common
   ├── family:<familyCode>
   ├── profile:<profileCode>
   └── opec:<opecId>
```

Una fuente puede tener más de una relación cuando corresponda.

## Estructura objetivo

```text
maps/
├── families/
│   └── docentes.json
├── profiles/
│   ├── rector_director_rural.json
│   ├── coordinador.json
│   ├── docente_aula_preescolar.json
│   ├── docente_aula_basica_primaria.json
│   ├── docente_aula_secundaria_media.json
│   └── docente_orientador.json
└── opecs/
    └── <opec-real>.json
```

Los archivos de mapas se crean cuando exista un inventario de fuentes verificado.
No se crean listas normativas de memoria ni OPEC ficticias.

## Base común docente

`maps/families/docentes.json` representará las fuentes que realmente apliquen a la
familia docente en general. El mapa no contiene una copia de la norma: contiene la
identidad de la fuente y la justificación/localizador de su aplicabilidad.

## Base específica por perfil

Cada perfil añade únicamente las fuentes o apartados que tengan relevancia
diferencial para sus funciones. Por ejemplo, una fuente puede estar asociada al
perfil `coordinador` sin dejar de existir una sola vez en el catálogo.

El mapa de perfil **no significa** que todas las preguntas de ese perfil deban usar
todas sus fuentes.

## Base específica por OPEC

Una OPEC puede añadir:

- manual/funciones específicas;
- normativa de entidad o convocatoria;
- documentos técnicos propios;
- requisitos o contenidos exclusivos verificados.

Estas relaciones se suman a la base heredada del perfil y de la familia.

## Herencia

Para una OPEC concreta:

```text
conocimiento elegible =
  base común aplicable
  + base de familia
  + base del perfil/cargo
  + base específica OPEC
```

La herencia sirve para descubrimiento, estudio, generación y auditoría. No implica
que cada fuente deba convertirse en una pregunta.

## Campos recomendados para un mapa

Cada relación futura debería poder registrar:

- `sourceId`;
- `targetType`: `common|family|profile|opec`;
- `targetCode` o `opecId`;
- `relevance`: `core|supporting|optional`;
- `locator` cuando la aplicabilidad depende de artículos/secciones concretos;
- `reason` breve y verificable;
- `verifiedAt`;
- `verifiedBy`;
- `status`: `active|needs_review|superseded`.

## Regla de calidad

No mapear una fuente a un perfil solo porque contiene su nombre. La relación debe
estar respaldada por funciones, ámbito normativo/técnico o necesidad evaluativa
real.

## Supabase futuro

El equivalente normalizado propuesto es `knowledge_source_targets`, asociado a
`knowledge_sources` y a los catálogos de familia/perfil/OPEC.
