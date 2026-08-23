# content

Carpeta raiz del banco de preguntas, fuentes y perfiles de Gana con Merito.

## Banco maestro V4 y revision de material legacy

`content/question-bank-v4/` recibe reactivos nuevos generados desde cero a partir
de registros legacy. La revision es obligatoria y se realiza de uno en uno con la
suite en `docs/ai/skills/`:

- Docentes: `GCM-Master-Question-Factory-Docentes` →
  `GCM-Adversarial-Item-Auditor-Docentes`.
- OPEC general/especifica: `GCM-Master-Question-Factory-OPEC-General` →
  `GCM-Adversarial-Item-Auditor-OPEC-General`.

La entrada legacy solo aporta contexto, enunciado y tema recuperable. Opciones,
claves, explicaciones, metadatos y fuentes no verificadas no se migran. Solo se
serializa un reactivo con veredicto `APPROVED`; los demas se descartan. Esta regla
aplica al contenido legacy del banco, no al codigo fuente legacy de la aplicacion.
El contrato canónico de esos nuevos archivos está en
`content/question-bank-v4/CONTRATO-EDITORIAL-V4.md`; su activación técnica se
define fuera de `content`, en la documentación de arquitectura y base de datos.
El corte físico vigente, su conteo y sus hashes se consultan únicamente en
`content/question-bank-v4/MANIFEST.json`.

## Biblioteca de conocimiento compartida

La arquitectura objetivo separa el **conocimiento fuente** de los reactivos. Normas,
teoría, guías, documentos técnicos, temarios y blueprints deben consolidarse en:

```text
content/knowledge-base/
```

Esta biblioteca es compartida por V4 y por futuros bancos/OPEC. Una fuente se
registra una sola vez y se relaciona con familias, perfiles/cargos y OPEC mediante
mapas de aplicabilidad. El Markdown de temas docentes que originó la expansión debe
conservarse, cuando se incorpore desde su archivo original, en:

```text
content/knowledge-base/themes/docentes/temario-base.md
```

`content/normative/` permanece como fuente histórica durante la transición; no se
deben duplicar sus normas en la nueva biblioteca antes de inventariarlas.

## Catálogo de destinatarios

La pregunta **qué se evalúa** pertenece a la taxonomía; la pregunta **a quién aplica**
pertenece a:

```text
content/targeting/
```

La jerarquía es:

```text
familia → perfil/cargo canónico → OPEC específica
```

Para selección de práctica, cargo y OPEC son destinos equivalentes. Para identidad
de datos no son sinónimos: un cargo es reusable entre convocatorias y una OPEC es
una instancia concreta que debe mapear a ese cargo.

Arquitectura completa:

`docs/03-architecture/question-bank-knowledge-targeting-architecture.md`

## Fuente por defecto v3

El banco editorial por defecto para nuevas preguntas por OPEC es:

```text
content/question-bank-v3/
```

La version v3 sigue el PRD de fabricas editoriales por OPEC: fuentes verificadas, blueprint aprobado, items completos, revision, pilotaje, release y metricas dentro de `opecs/<opecId>/`. No se migra ni se mezcla contenido legacy.

## Lectura beta

La carpeta queda organizada para pilotaje con dos rutas principales:

```text
content/items/beta-v1/                 # 100 preguntas materializadas para beta
content/restructuring-v1/00-beta-v1/  # indice maestro, vistas y deuda tecnica
```

Ninguna pregunta fuera de `content/items/beta-v1/` debe activarse en beta sin pasar por el indice maestro.

## Estructura oficial

```text
content/
  knowledge-base/  Fuentes, temarios, teoría, normas, guías y mapas de aplicabilidad.
  targeting/       Familias, perfiles/cargos y OPEC; no sustituye la taxonomía.
  items/
    beta-v1/       Banco beta listo para pilotaje.
    no-beta-v1/    Material historico, previo o pendiente.
  question-bank-v3/
    opecs/         Fuente editorial V3 por OPEC.
  question-bank-v4/
    items/         Reactivos nuevos, creados y auditados por la suite V4.
    taxonomy/      Taxonomía de qué se evalúa.
  normative/       Fuente normativa histórica a inventariar antes de consolidar.
  profiles/        Definicion histórica/editorial de perfiles; no duplica banco.
  restructuring-v1/
    00-beta-v1/    Cierre beta y fuente de verdad.
    auditoria/      Lotes auditados.
    trazabilidad/   Decisiones y bitacoras.
    consolidacion/  Fases historicas de trabajo.
    docente/        Clasificacion intermedia por perfil y tipo.
```

## Regla de saneamiento

- `items/beta-v1/` es la carpeta navegable de preguntas beta.
- `items/no-beta-v1/` conserva todo lo que no entra a beta.
- `restructuring-v1/00-beta-v1/` gobierna el cierre editorial.
- `stand-by`, auditorias, descartes y remanufactura no alimentan runtime directamente.
- `knowledge-base/` alimenta investigación y generación, pero nunca activa reactivos por sí sola.
- `targeting/` clasifica destinatarios; no autoriza modificar el contrato V4 congelado sin un cambio explícito de versión/manifest.
