# content

Carpeta raiz del banco de preguntas, fuentes y perfiles de Gana con Merito.

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
  items/
    beta-v1/       Banco beta listo para pilotaje.
    no-beta-v1/    Material historico, previo o pendiente.
  question-bank-v3/
    opecs/         Nueva fuente editorial por OPEC, limpia y sin legacy.
  normative/       Soporte normativo.
  profiles/        Definicion de perfiles y vistas; no duplica banco.
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
