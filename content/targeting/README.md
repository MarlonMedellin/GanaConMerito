# Targeting: familias, perfiles/cargos y OPEC

Catálogo editorial compartido para determinar **a quién aplica** una pregunta o una fuente de conocimiento.

No reemplaza la taxonomía temática del banco. `domain`, `topic` y `competency` describen qué se evalúa; esta capa describe a qué destinatario profesional se dirige.

## Jerarquía

```text
familia
  └── perfil/cargo canónico
        └── OPEC específica
```

## Catálogos machine-readable actuales

Familia docente:

```text
content/targeting/families/docentes.json
```

Perfiles docentes:

```text
content/targeting/profiles/docentes.json
```

Estos JSON son catálogos editoriales para alinear agentes y futuras migraciones. No
implican que las tablas equivalentes ya existan o estén desplegadas en Supabase.

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

Otros concursos deben incorporar sus perfiles mediante catálogo controlado; no
mediante texto libre dentro de cada pregunta.

### OPEC
Es una instancia concreta de empleo/oferta dentro de una convocatoria o entidad. Debe mapearse a un perfil/cargo canónico.

No se crean archivos OPEC de ejemplo o placeholders con identificadores inventados.
`content/targeting/opecs/` se poblará únicamente con datos reales y trazables.

## Regla OPEC vs cargo

Para filtrado y experiencia de usuario, OPEC y cargo funcionan como destinos equivalentes: ambos permiten seleccionar el universo de preguntas.

Para integridad de datos **no son sinónimos de identidad**:

- el perfil/cargo es estable;
- la OPEC es una instancia concreta;
- distintas OPEC pueden mapear al mismo perfil;
- una pregunta general de un perfil no debe duplicarse por cada OPEC.

## Aplicabilidad de preguntas

Un reactivo puede ser:

- común a toda una familia;
- principal para un perfil;
- compatible con varios perfiles;
- específico de una OPEC.

Por tanto, la persistencia futura debe admitir relaciones many-to-many y no una sola columna de cargo como única clasificación.

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

La evolución hacia targeting por perfil/cargo debe hacerse mediante una capa externa o una versión posterior del contrato, coordinada con Supabase.

No realizar backfill automático de los 248 reactivos por palabras clave. El mapeo a
perfiles debe basarse en evidencia editorial del constructo/rol.

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

## Gobernanza del catálogo

- Los códigos de familia/perfil son estables.
- Renombrar la etiqueta visible no implica cambiar el código estable.
- Una OPEC nueva debe mapearse a un perfil existente o justificar un perfil nuevo.
- Los perfiles no se crean para acomodar una sola pregunta.
- Taxonomía y targeting deben evolucionar de forma independiente.
