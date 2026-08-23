# Targeting: familias, perfiles/cargos y OPEC

Catálogo editorial compartido para determinar **a quién aplica** una pregunta o una fuente de conocimiento.

No reemplaza la taxonomía temática del banco. `domain`, `topic` y `competency` describen qué se evalúa; esta capa describe a qué destinatario profesional se dirige.

## Jerarquía

```text
familia
  └── perfil/cargo canónico
        └── OPEC específica
```

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

Otros concursos deben incorporar sus propios perfiles mediante catálogo controlado; no mediante texto libre dentro de cada pregunta.

### OPEC
Es una instancia concreta de empleo/oferta dentro de una convocatoria o entidad. Debe mapearse a un perfil/cargo canónico.

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
