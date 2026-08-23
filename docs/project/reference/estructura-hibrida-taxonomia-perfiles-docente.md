# Estructura híbrida del banco por taxonomía y perfiles docentes

> **Estado: documento puente.** La decisión que este documento introdujo —separar
> taxonomía de perfil profesional y no duplicar preguntas por cargo— se conserva.
> La arquitectura canónica ampliada ahora vive en
> `docs/03-architecture/question-bank-knowledge-targeting-architecture.md`.

## Decisión vigente

El banco debe mantener separados:

1. **taxonomía** — qué se evalúa;
2. **targeting** — a quién aplica;
3. **knowledge base** — qué fuente lo sustenta.

La taxonomía no debe reorganizarse por cargo. Los perfiles profesionales siguen
siendo una capa independiente de selección y análisis.

## Evolución de las rutas

La carpeta histórica:

```text
content/profiles/docente/
```

se conserva como material editorial/puente.

El catálogo objetivo de destinatarios es:

```text
content/targeting/
```

y la biblioteca de normas, teoría, guías, documentos técnicos y temarios es:

```text
content/knowledge-base/
```

Los reactivos V4 continúan en:

```text
content/question-bank-v4/items/
```

No duplicar un reactivo en las carpetas de targeting/perfiles.

## Perfiles docentes canónicos iniciales

1. `rector_director_rural`
2. `coordinador`
3. `docente_aula_preescolar`
4. `docente_aula_basica_primaria`
5. `docente_aula_secundaria_media`
6. `docente_orientador`

## OPEC y cargo

La arquitectura ampliada agrega una distinción que este documento histórico no
modelaba por completo:

- perfil/cargo = rol profesional estable y reusable;
- OPEC = oferta concreta de una convocatoria/entidad;
- varias OPEC pueden mapear al mismo perfil/cargo;
- para selección ambos son destinos equivalentes, pero no comparten identidad.

Una pregunta general de coordinador, por ejemplo, debe poder reutilizarse en varias
OPEC de coordinador sin crear copias.

## Metadatos históricos

Los campos:

- `targetRole`
- `targetPosition`
- `applicantProfile`
- `tags`

siguen siendo antecedentes válidos de la segmentación editorial Legacy/Beta/V3,
pero no deben asumirse como el modelo persistente final. La evolución Supabase
recomendada usa catálogos y relaciones normalizadas many-to-many.

## Regla de uso

### Sí
- clasificar el constructo con taxonomía;
- añadir targeting solo cuando la aplicabilidad profesional esté justificada;
- permitir que una pregunta sea compatible con varios perfiles;
- dejar transversales las preguntas que realmente lo sean;
- mapear cada OPEC a un perfil canónico.

### No
- duplicar preguntas por perfil/OPEC;
- convertir cargos en topics;
- crear carpetas principales por convocatoria como sustituto del catálogo;
- inferir perfil exclusivamente por palabras del enunciado;
- copiar la misma norma en cada carpeta de perfil.

## Fuente canónica actual

Para nuevas decisiones sobre esta materia consultar, en este orden:

1. `docs/03-architecture/question-bank-knowledge-targeting-architecture.md`
2. `content/targeting/README.md`
3. `content/knowledge-base/README.md`
4. `docs/database/content-model.md`
5. `docs/database/question-bank-v4-contract.md`
