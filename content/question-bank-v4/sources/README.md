# Fuentes locales V4 — capa de compatibilidad

Esta carpeta **no es una segunda biblioteca de conocimiento** y no debe almacenar copias canónicas de normas, guías, teoría o documentos académicos.

La biblioteca canónica compartida para V4 y futuros bancos vive en:

```text
content/knowledge-base/
```

## Función permitida de `question-bank-v4/sources/`

Esta ruta se conserva como punto de compatibilidad y navegación para el contrato V4 congelado y para documentos o herramientas históricas que esperen una noción de “fuentes V4”. Su contenido debe limitarse a:

- índices o punteros hacia `content/knowledge-base/`;
- mapas de compatibilidad específicos de V4;
- notas de migración/provenance;
- metadatos derivados que no dupliquen la fuente canónica.

## Regla de identidad

Una fuente real se registra **una sola vez** en `content/knowledge-base/`. Su aplicabilidad a V4, familia, perfil/cargo u OPEC se expresa mediante mapas o relaciones, no copiando el documento aquí.

Por ejemplo, una norma aplicable a docentes, coordinadores y rectores sigue teniendo una sola identidad de fuente; los tres destinos se asocian a ella desde la capa de targeting/conocimiento.

## Compatibilidad con el contrato V4 congelado

`CONTRATO-EDITORIAL-V4.md` documenta estas rutas:

```text
sources/
├── normative/
└── academic/
```

El contrato está protegido por el hash del `MANIFEST.json`; no se modifica únicamente para reflejar la nueva biblioteca compartida.

Por eso las dos rutas se conservan mediante README de compatibilidad:

- `sources/normative/README.md` → apunta a `content/knowledge-base/sources/normative/`;
- `sources/academic/README.md` → apunta a `content/knowledge-base/sources/academic/`.

Antes de esta reconciliación ambas carpetas solo contenían `.gitkeep`; no existían fuentes reales allí. Los `.gitkeep` fueron sustituidos por documentación explícita para evitar que parezcan bibliotecas canónicas paralelas sin romper la estructura histórica del contrato.

## Para agentes y herramientas

Para nuevas operaciones:

1. buscar fuentes reales en `content/knowledge-base/`;
2. usar `content/targeting/` para destinatarios;
3. usar `content/question-bank-v4/taxonomy/` para clasificar qué evalúa el reactivo;
4. tratar `question-bank-v4/sources/` únicamente como compatibilidad;
5. no inferir targeting por la ubicación física de una fuente.

Arquitectura completa:

`docs/03-architecture/question-bank-knowledge-targeting-architecture.md`
