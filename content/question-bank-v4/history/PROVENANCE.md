# Provenance de insumos históricos del banco V4

Este documento conecta nombres y rutas usados durante la construcción histórica de V4 con la arquitectura actual. Su objetivo es conservar trazabilidad **sin reescribir retrospectivamente la historia**.

## Regla general

Una referencia histórica se conserva con el nombre que tenía en el momento del proceso editorial. La arquitectura actual se registra como destino canónico o equivalente funcional, no como si hubiera existido desde el inicio.

## Temario docente

Diversos informes de expansión mencionan `temas.md` o `temas(1).md` como mapa de oportunidades editoriales.

La arquitectura actual preserva el temario docente aportado por el usuario en:

```text
content/knowledge-base/themes/docentes/temario-base.md
```

Lo que puede afirmarse:

- los informes históricos utilizaron un temario docente como insumo de descubrimiento y cobertura;
- el temario preservado actualmente ocupa la función arquitectónica de **fuente de planeación/gap analysis**, no de taxonomía ni banco aprobado;
- las afirmaciones normativas de los reactivos debían verificarse contra fuentes independientes y no depender únicamente del temario.

Lo que este documento **no afirma** sin evidencia adicional:

- que cada archivo histórico llamado `temas.md` o `temas(1).md` sea byte a byte idéntico al `temario-base.md` actual;
- que cada encabezado del temario corresponda a un `topic` canónico;
- que una formulación del temario constituya por sí sola una fuente normativa válida.

Por eso los informes históricos conservan los nombres `temas.md` / `temas(1).md`, mientras todo trabajo nuevo debe leer `content/knowledge-base/themes/docentes/temario-base.md` y la biblioteca de conocimiento asociada.

## Perfiles docentes históricos

Los lotes históricos también utilizaron:

```text
content/profiles/docente/
```

Esa carpeta continúa en el repositorio como **carpeta editorial histórica/puente** y su propio README declara que no es el catálogo canónico futuro de targeting.

Los seis códigos allí reconocidos son:

- `rector_director_rural`
- `coordinador`
- `docente_aula_preescolar`
- `docente_aula_basica_primaria`
- `docente_aula_secundaria_media`
- `docente_orientador`

La identidad canónica para trabajo nuevo se administra en:

```text
content/targeting/profiles/docentes.json
```

### Regla de equivalencia

Mientras los códigos coincidan, el mapeo de identidad es directo 1:1 por `profile_code`. Sin embargo:

- `content/profiles/docente/` conserva material editorial e histórico;
- `content/targeting/` gobierna destinatarios canónicos para nueva arquitectura;
- Supabase futuro debe derivar sus perfiles del catálogo de targeting, no reconstruir un catálogo paralelo leyendo directorios legacy;
- las carpetas legacy no deben eliminarse hasta revisar sus consumidores y decidir su archivado o compatibilidad.

## OPEC

Los documentos históricos pueden hablar de perfiles o cargos sin disponer todavía del catálogo normalizado de OPEC actuales.

No debe inferirse una OPEC concreta a partir de esos documentos. La arquitectura futura requiere:

```text
familia → profile_code → OPEC concreta
```

Una OPEC deberá tener identidad propia y mapearse al perfil correspondiente.

## Conocimiento y fuentes

Las referencias a normas, guías o teoría dentro de informes históricos son evidencia del proceso editorial, pero la biblioteca canónica futura es:

```text
content/knowledge-base/
```

Cuando se normalice una fuente:

1. se registra una sola identidad canónica;
2. se conserva localizador, vigencia y procedencia;
3. se mapea a familias/perfiles/OPEC mediante relaciones;
4. no se duplica físicamente por cargo;
5. los informes históricos permanecen intactos salvo correcciones mecánicas de rutas provocadas por esta reorganización.

## Relación con Supabase

Este documento no autoriza migraciones. Para una evolución posterior:

- usar `content/targeting/` como autoridad de perfiles y OPEC;
- usar `content/knowledge-base/` como autoridad de fuentes normalizadas;
- mantener el corpus V4 congelado independiente de esos mapas hasta una evolución contractual explícita;
- conservar `item_bank`, UUID y `opec_id` durante la transición prevista;
- comprobar la secuencia real de `supabase/migrations/` antes de numerar cualquier migración de targeting/knowledge.
