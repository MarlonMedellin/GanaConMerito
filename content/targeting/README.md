# Targeting: familias, perfiles/cargos y OPEC

Catálogo editorial compartido para determinar **a quién aplica** una pregunta o una fuente de conocimiento.

No reemplaza la taxonomía temática del banco. `domain`, `topic` y `competency` describen qué se evalúa; esta capa describe a qué destinatario profesional se dirige.

## Jerarquía

```text
familia
  └── perfil/cargo canónico
        └── OPEC específica
```

## Semántica simple congelada para canary

Hasta la fase canary/pruebas con primeros usuarios, esta capa se mantiene deliberadamente simple:

- **perfil** = grupo reusable de preparación;
- **`positionName`** = denominación oficial concreta del cargo/área cuando la OPEC requiera mayor especificidad;
- **OPEC** = oferta concreta y trazable.

Ejemplo conceptual:

```text
docente_aula_secundaria_media
  → Docente de aula Matemáticas
    → OPEC concreta
```

No crear por ahora perfiles independientes por disciplina (`docente_matematicas`, `docente_filosofia`, etc.), ni nuevas capas `area`, `specialty` o `employment_identity`. La especificidad oficial vive en `positionName` y la OPEC, mientras el perfil conserva su función reusable.

Esta regla solo se reabre antes de canary si aparece un defecto de corrección, seguridad o integridad de datos que no pueda resolverse dentro del contrato actual.

## Catálogos machine-readable actuales

Familia docente:

```text
content/targeting/families/docentes.json
```

Perfiles docentes:

```text
content/targeting/profiles/docentes.json
```

Catálogo OPEC:

```text
content/targeting/opecs/catalog.json
```

Contrato OPEC:

```text
content/targeting/opecs/catalog.schema.json
```

Mapa externo reactivo → targeting:

```text
content/targeting/item-maps/question-bank-v4.json
```

Contrato del mapa:

```text
content/targeting/item-maps/item-target-map.schema.json
```

Estos JSON son catálogos editoriales para alinear agentes y futuras migraciones. No implican que las tablas equivalentes ya existan o estén desplegadas en Supabase.

El catálogo OPEC existe desde ahora como estructura canónica, pero permanece vacío hasta incorporar ofertas reales, trazables y verificadas. No se crean OPEC ficticias para probar la arquitectura.

El mapa de reactivos V4 también inicia vacío. Se poblará mediante revisión editorial y no mediante backfill automático por palabras clave.

### Familia
Agrupa una línea amplia de preparación.

Ejemplo inicial:

```text
docentes
```

### Perfil/cargo canónico
Representa un rol profesional estable y reusable entre convocatorias.

Para la familia `docentes`:

| Código | Nombre funcional |
|---|---|
| `rector_director_rural` | Rector / director rural |
| `coordinador` | Coordinador |
| `docente_aula_preescolar` | Docente de aula preescolar |
| `docente_aula_basica_primaria` | Docente de aula básica primaria |
| `docente_aula_secundaria_media` | Docente de aula secundaria y media / bachillerato |
| `docente_orientador` | Docente orientador |

Otros concursos deben incorporar sus perfiles mediante catálogo controlado; no mediante texto libre dentro de cada pregunta.

### OPEC
Es una instancia concreta de empleo/oferta dentro de una convocatoria o entidad. Debe mapearse a un perfil/cargo canónico.

La identidad externa se conserva mediante `sourceSystem + externalOpecId` y, cuando corresponda, `convocationCode`. No se debe asumir que un número de OPEC es globalmente único entre sistemas de origen.

Una OPEC solo puede pasar a estado editorial `active` cuando su `verificationStatus` sea `verified`.

## Regla OPEC vs cargo

Para filtrado y experiencia de usuario, OPEC y cargo funcionan como destinos equivalentes: ambos permiten seleccionar el universo de preguntas.

Para integridad de datos **no son sinónimos de identidad**:

- el perfil/cargo es estable;
- la OPEC es una instancia concreta;
- distintas OPEC pueden mapear al mismo perfil;
- una pregunta general de un perfil no debe duplicarse por cada OPEC.

## Aplicabilidad de preguntas

Un reactivo puede relacionarse de forma directa con:

- una familia común;
- uno o varios perfiles;
- una o varias OPEC específicas.

La relación no usa `targetKind` ni clasifica destinos como
`primary|compatible`; su significado proviene del nivel de la relación.

Por tanto, la persistencia futura debe admitir relaciones many-to-many y no una sola columna de cargo como única clasificación.

### Mapa externo de reactivos

Los bancos congelados no deben modificarse únicamente para agregar targeting. La relación se registra externamente en `content/targeting/item-maps/`.

Cada mapping identifica un `itemId`, uno o más destinos y un estado de revisión:

- `candidate`;
- `reviewed`;
- `approved`;
- `rejected`.

Para V4, un mapping `approved` debe tener evidencia editorial y el `itemId` debe existir en el `MANIFEST.json`. El validador de catálogos comprueba además que perfiles y OPEC referenciadas existan realmente.

### Regla de herencia conceptual

Cuando el usuario selecciona una OPEC:

```text
OPEC concreta
  + preguntas propias de esa OPEC
  + preguntas del perfil/cargo asociado
  + preguntas comunes de la familia
```

Después se aplican dominio, tópico, competencia, dificultad y reglas adaptativas.

## Aplicabilidad de fuentes

La misma lógica aplica a normas, teoría, guías y documentos técnicos:

- fuente común;
- fuente de familia;
- fuente de perfil;
- fuente específica de OPEC.

Los documentos se almacenan una vez en `content/knowledge-base/`; los mapas de targeting indican dónde aplican.

## Compatibilidad V4 actual

El corte V4 congelado conserva su contrato actual (`scope: general|opec_specific`). No se deben agregar campos nuevos a los 248 reactivos congelados sin un cambio explícito de contrato y manifiesto.

La evolución hacia targeting por perfil/cargo debe hacerse mediante la capa externa `item-maps/` o una versión posterior del contrato, coordinada con Supabase.

No realizar backfill automático de los 248 reactivos por palabras clave. El mapeo a perfiles debe basarse en evidencia editorial del constructo/rol.

## Validación

Ejecutar:

```bash
npm run content:validate:knowledge-targeting
```

El gate valida catálogos de familia/perfil/OPEC, inventario de knowledge y mapas externos de reactivos. También se ejecuta dentro de `PR Checks`.

## Diseño Supabase recomendado

Ver:

`docs/03-architecture/question-bank-knowledge-targeting-architecture.md`

Allí se propone separar:

- `target_families`;
- `target_profiles`;
- `opec_catalog`;
- `item_target_profiles`;
- `item_opec_targets`.

Esta estructura permite reutilizar preguntas entre cargos y preservar `opec_id` actual durante la transición.

Los contratos de repositorio bajo `content/targeting/` deben considerarse interfaces editoriales de entrada para PRD 3, no copias del esquema SQL. Supabase puede usar UUID y claves foráneas internas mientras conserva las identidades editoriales y externas de procedencia.

## Gobernanza del catálogo

- Los códigos de familia/perfil son estables.
- Renombrar la etiqueta visible no implica cambiar el código estable.
- Una OPEC nueva debe mapearse a un perfil existente o justificar un perfil nuevo.
- Los perfiles no se crean para acomodar una sola pregunta ni una sola disciplina mientras `positionName` resuelva la especificidad.
- Taxonomía y targeting deben evolucionar de forma independiente.
- No activar una OPEC sin evidencia de procedencia verificable.
- No duplicar una OPEC para representar filtros temáticos o variaciones de interfaz.
- No aprobar un mapping de reactivo sin evidencia editorial suficiente.
