# Knowledge Base de GanaConMerito

Biblioteca compartida de conocimiento para construir, auditar y mantener bancos de preguntas presentes y futuros.

Esta carpeta **no es un banco de reactivos**. Contiene fuentes, temarios, mapas y referencias que permiten justificar nuevos reactivos y determinar su aplicabilidad.

## Principios

1. Una fuente se registra una sola vez.
2. La aplicabilidad por familia, perfil/cargo u OPEC se expresa mediante mapas/metadatos, no duplicando documentos.
3. Un temario orienta cobertura; no crea automáticamente una taxonomía ni una pregunta.
4. Toda fuente debe conservar procedencia, vigencia/fecha de consulta y localizador cuando aplique.
5. El banco V4 sigue gobernado por `content/question-bank-v4/CONTRATO-EDITORIAL-V4.md` y `MANIFEST.json`.
6. Un archivo legacy no se promueve automáticamente a fuente verificada: primero debe pasar por inventario y normalización.

## Estructura actual

```text
content/knowledge-base/
├── README.md
├── catalog/
│   ├── README.md
│   └── source-inventory.json    # fuentes canónicas y candidatos legacy
├── themes/
│   ├── docentes/
│   └── <familia>/
├── sources/
│   ├── README.md
│   ├── normative/
│   ├── academic/
│   ├── technical/
│   └── guides/
└── maps/
    ├── families/
    ├── profiles/
    └── opecs/
```

## Temario docente

El Markdown de trabajo derivado del archivo aportado por el usuario vive en:

```text
content/knowledge-base/themes/docentes/temario-base.md
```

Es una fuente de planeación, gap analysis y descubrimiento de cobertura. No es un catálogo automático de `topic`, no prueba por sí solo la vigencia de una afirmación y no autoriza la creación automática de reactivos.

La verificación de integridad del archivo fuente está documentada en:

```text
content/knowledge-base/themes/docentes/INTEGRITY.md
```

Mientras esa verificación permanezca abierta, no describir `temario-base.md` como copia byte a byte del archivo original.

## Fuentes normativas legacy

`content/normative/` conserva material previo a esta arquitectura. En el primer inventario se identificaron:

- `decreto_1075.md`;
- `ley_1098.md`.

Son fichas resumidas, no copias integrales verificadas de las normas. Permanecen temporalmente en su ruta legacy y están registradas en `catalog/source-inventory.json` con `verificationStatus: needs_review`.

No agregar nuevas fuentes en `content/normative/`. El destino canónico de una fuente ya normalizada es `content/knowledge-base/sources/`.

## Perfiles docentes iniciales

La familia `docentes` utiliza como perfiles canónicos iniciales:

- `rector_director_rural`
- `coordinador`
- `docente_aula_preescolar`
- `docente_aula_basica_primaria`
- `docente_aula_secundaria_media`
- `docente_orientador`

La base normativa/pedagógica común se comparte. Los mapas de perfil añaden únicamente lo diferencial. Para nueva arquitectura, la identidad canónica de perfiles vive en `content/targeting/profiles/docentes.json`.

## Relación con preguntas

Las preguntas viven en su banco correspondiente. Para V4:

```text
content/question-bank-v4/items/
```

Una fuente puede sostener muchos reactivos y un reactivo puede relacionarse con varias fuentes. La arquitectura normalizada futura para Supabase se documenta en:

`docs/03-architecture/question-bank-knowledge-targeting-architecture.md`

## Validación de catálogos

Antes de fusionar cambios en `knowledge-base` o `targeting`, ejecutar:

```bash
npm run content:validate:knowledge-targeting
```

El gate valida actualmente:

- familias canónicas;
- pertenencia de perfiles a su familia;
- catálogo OPEC y sus referencias a familia/perfil;
- regla `active => verified` para OPEC;
- duplicados de identidad OPEC;
- unicidad de `sourceId` en el inventario de conocimiento.

`PR Checks` ejecuta este validador automáticamente. Los mapas de aplicabilidad machine-readable se incorporarán al mismo gate cuando se materialicen sus contratos JSON.

## Qué almacenar

### Sí
- normas oficiales y sus metadatos;
- guías públicas u oficialmente autorizadas;
- referencias académicas;
- documentos técnicos;
- temarios y blueprints;
- notas de vigencia y aplicabilidad;
- mapas de cobertura por familia/perfil/OPEC.

### Con cautela
- textos académicos o técnicos protegidos: guardar el archivo completo solo si existe derecho/licencia; en caso contrario conservar referencia, URL, metadatos y notas/extractos permitidos.

### No
- respuestas inventadas;
- fuentes sin procedencia;
- copias repetidas por perfil;
- reactivos productivos;
- snapshots históricos de auditoría V4;
- nuevas fuentes en rutas legacy cuando ya exista destino canónico en `knowledge-base`.
