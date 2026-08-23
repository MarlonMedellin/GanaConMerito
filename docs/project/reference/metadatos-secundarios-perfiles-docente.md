# Metadatos secundarios para perfiles docentes

> **Estado: documento puente/histórico.** Describe los campos usados en el modelo
> editorial Legacy/Beta/V3. La arquitectura objetivo de destinatarios ahora se
> define en `content/targeting/README.md` y
> `docs/03-architecture/question-bank-knowledge-targeting-architecture.md`.

## Propósito histórico

Agregar una segunda capa de clasificación para perfiles docentes sin romper la
estructura temática principal del banco.

La decisión conceptual sigue vigente: **perfil/cargo no sustituye taxonomía**.

## Campos históricos

### `targetRole`
Familia general del examen o rol macro.

Valor histórico de esta línea:

```yaml
targetRole: docente
```

### `targetPosition`
Perfil puntual principal.

Catálogo docente reconocido:
- `rector_director_rural`
- `coordinador`
- `docente_aula_preescolar`
- `docente_aula_basica_primaria`
- `docente_aula_secundaria_media`
- `docente_orientador`

### `applicantProfile`
Agrupador histórico más amplio:
- `directivo_docente`
- `docente_de_aula`
- `docente_orientador`

### `tags`
Afinidades secundarias livianas.

## Qué cambia con la arquitectura nueva

Estos campos pueden seguir existiendo por compatibilidad en contenido histórico,
pero **no deben asumirse como el modelo persistente definitivo**.

La evolución objetivo separa:

```text
familia → perfil/cargo canónico → OPEC concreta
```

y propone relaciones many-to-many entre reactivos y perfiles/OPEC.

Esto resuelve limitaciones del modelo de una sola columna:

- una pregunta puede servir a varios perfiles;
- varias OPEC pueden mapear al mismo cargo;
- un reactivo OPEC-specific puede coexistir con reactivos comunes del perfil;
- no hace falta duplicar el ítem para representar varias afinidades.

## Regla OPEC vs perfil/cargo

Para selección, ambos son destinos equivalentes. Para identidad son diferentes:

- perfil/cargo es estable y reusable;
- OPEC es una instancia concreta de una convocatoria/entidad;
- una OPEC hereda la base común del perfil y la familia.

## Aplicación a V4

El corte V4 congelado no debe reescribirse para agregar estos campos históricos.
Su contrato actual se preserva. La segmentación futura puede añadirse mediante
relaciones externas o una evolución explícita del contrato V4.

## Aplicación a Legacy/Beta/V3

Los campos existentes siguen siendo válidos donde el parser/contrato histórico los
requiera. No eliminarlos de contenido legacy solo porque exista la nueva arquitectura.

## Reglas vigentes

- no inventar nuevos valores sin catálogo;
- no usar perfil/cargo como `area/domain`, `topic/subarea` o `competency`;
- no usar `tags` como sustituto de una relación de OPEC en persistencia futura;
- no inferir perfil automáticamente por palabras del texto;
- no duplicar una pregunta por cada perfil/OPEC;
- dejar transversal el ítem que no gana valor con segmentación específica.

## Fuente de autoridad para trabajo nuevo

1. `docs/03-architecture/question-bank-knowledge-targeting-architecture.md`
2. `content/targeting/README.md`
3. `docs/database/content-model.md`
4. `docs/database/question-bank-v4-contract.md`

Este archivo debe consultarse principalmente para comprender compatibilidad con el
modelo histórico de metadatos secundarios.
