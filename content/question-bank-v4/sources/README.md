# Fuentes locales V4 — capa de compatibilidad

Esta carpeta **no es una segunda biblioteca de conocimiento** y no debe almacenar copias de normas, guías, teoría o documentos académicos.

La biblioteca canónica compartida para V4 y futuros bancos vive en:

```text
content/knowledge-base/
```

## Función permitida de `question-bank-v4/sources/`

Esta ruta se conserva como punto de compatibilidad y navegación para documentos o herramientas históricas que esperen una noción de “fuentes V4”. Su contenido futuro, si fuera necesario, debe limitarse a:

- índices o punteros hacia `content/knowledge-base/`;
- mapas de compatibilidad específicos de V4;
- notas de migración/provenance;
- metadatos derivados que no dupliquen la fuente canónica.

## Regla de identidad

Una fuente real se registra **una sola vez** en `content/knowledge-base/`. Su aplicabilidad a V4, familia, perfil/cargo u OPEC se expresa mediante mapas o relaciones, no copiando el documento aquí.

Por ejemplo, una norma aplicable a docentes, coordinadores y rectores sigue teniendo una sola identidad de fuente; los tres destinos se asocian a ella desde la capa de targeting/conocimiento.

## Estructura anterior

Esta carpeta contenía únicamente los placeholders vacíos:

```text
academic/.gitkeep
normative/.gitkeep
```

No existían documentos de fuente ni consumidores detectados de esas rutas exactas. Los placeholders se retiran para evitar que parezcan bibliotecas canónicas paralelas.

## Para agentes y herramientas

Para nuevas operaciones:

1. buscar fuentes en `content/knowledge-base/`;
2. usar `content/targeting/` para destinatarios;
3. usar `content/question-bank-v4/taxonomy/` para clasificar qué evalúa el reactivo;
4. no inferir que la presencia de una fuente en esta carpeta determina su targeting.

Arquitectura completa:

`docs/03-architecture/question-bank-knowledge-targeting-architecture.md`
