# Mapas de aplicabilidad de conocimiento

Esta carpeta relaciona fuentes de `content/knowledge-base/` con los destinatarios de `content/targeting/` sin duplicar documentos.

## Modelo

```text
fuente única
   ├── common
   ├── family:<familyCode>
   ├── profile:<familyCode>:<profileCode>
   └── opec:<sourceSystem>:<externalOpecId>
```

Una fuente puede tener más de una relación cuando corresponda.

## Contrato machine-readable

Todos los mapas JSON deben cumplir:

```text
content/knowledge-base/maps/map.schema.json
```

Cada archivo declara un único `target` y una lista de relaciones `sources`.

## Estructura canónica

```text
maps/
├── README.md
├── map.schema.json
├── families/
│   └── docentes.json                 # cuando existan relaciones verificadas
├── profiles/
│   ├── rector_director_rural.json
│   ├── coordinador.json
│   ├── docente_aula_preescolar.json
│   ├── docente_aula_basica_primaria.json
│   ├── docente_aula_secundaria_media.json
│   └── docente_orientador.json
└── opecs/
    └── <identidad-opec-real>.json
```

Los archivos concretos de mapas se crean únicamente cuando existan relaciones suficientemente sustentadas. No se crean listas normativas de memoria ni OPEC ficticias para llenar la estructura.

## Base común docente

`maps/families/docentes.json` representará las fuentes que realmente apliquen a la familia docente en general. El mapa no contiene una copia de la norma: contiene `sourceId`, relevancia, localizador, justificación y estado de verificación de la relación.

## Base específica por perfil

Cada perfil añade únicamente las fuentes o apartados que tengan relevancia diferencial para sus funciones. Una fuente puede estar asociada al perfil `coordinador` sin dejar de existir una sola vez en el catálogo.

El mapa de perfil **no significa** que todas las preguntas de ese perfil deban usar todas sus fuentes.

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

La herencia sirve para descubrimiento, estudio, generación y auditoría. No implica que cada fuente deba convertirse en una pregunta.

## Campos de una relación

Cada relación registra:

- `sourceId`;
- `relevance`: `core|supporting|optional`;
- `locator` cuando la aplicabilidad depende de artículos/secciones concretos;
- `reason` breve y verificable;
- `status`: `needs_review|active|superseded`;
- `verifiedAt`;
- `verifiedBy`.

Una relación `active` exige que la fuente del inventario tenga `verificationStatus: verified` y que la relación tenga `verifiedAt` y `verifiedBy`.

## Regla de calidad

No mapear una fuente a un perfil solo porque contiene su nombre. La relación debe estar respaldada por funciones, ámbito normativo/técnico o necesidad evaluativa real.

## Validación automática

Ejecutar:

```bash
npm run content:validate:knowledge-targeting
```

El gate comprueba integridad referencial contra familias, perfiles, OPEC e inventario de fuentes, además de coherencia entre la carpeta física del mapa y `target.type`.

## Supabase futuro

El equivalente normalizado propuesto es `knowledge_source_targets`, asociado a `knowledge_sources` y a los catálogos de familia/perfil/OPEC.

Los mapas del repositorio son el contrato editorial de entrada; no obligan a que Supabase replique literalmente su forma de archivo.