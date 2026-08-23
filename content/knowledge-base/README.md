# Knowledge Base de GanaConMerito

Biblioteca compartida de conocimiento para construir, auditar y mantener bancos de preguntas presentes y futuros.

Esta carpeta **no es un banco de reactivos**. Contiene las fuentes, temarios, mapas y referencias que permiten justificar nuevos reactivos y determinar su aplicabilidad.

## Principios

1. Una fuente se registra una sola vez.
2. La aplicabilidad por familia, perfil/cargo u OPEC se expresa mediante mapas/metadatos, no duplicando documentos.
3. Un temario orienta cobertura; no crea automáticamente una taxonomía ni una pregunta.
4. Toda fuente debe conservar procedencia, vigencia/fecha de consulta y localizador cuando aplique.
5. El banco V4 sigue gobernado por `content/question-bank-v4/CONTRATO-EDITORIAL-V4.md` y `MANIFEST.json`.

## Estructura objetivo

```text
content/knowledge-base/
├── README.md
├── catalog/                  # índice de fuentes y metadatos
├── themes/                   # temarios y blueprints
│   ├── docentes/
│   └── <familia>/
├── sources/
│   ├── normative/
│   ├── academic/
│   ├── technical/
│   └── guides/
└── maps/
    ├── families/
    ├── profiles/
    └── opecs/
```

## Temario docente original

El Markdown de temas que sirvió para analizar la expansión docente debe conservarse, cuando se incorpore como archivo del repositorio, en:

```text
content/knowledge-base/themes/docentes/temario-base.md
```

No se recrea aquí de memoria: debe copiarse desde el documento fuente original para preservar fidelidad y procedencia.

## Fuentes normativas

`content/normative/` contiene actualmente material normativo previo. Su contenido debe inventariarse y migrarse de forma controlada a esta biblioteca; no se deben crear copias paralelas de la misma ley o decreto mientras dure la transición.

Una norma puede ser:

- común a toda la aplicación;
- común a una familia como `docentes`;
- especialmente relevante para uno o varios perfiles/cargos;
- exclusiva de una OPEC o convocatoria concreta.

## Perfiles docentes iniciales

La familia `docentes` utiliza como perfiles canónicos iniciales:

- `rector_director_rural`
- `coordinador`
- `docente_aula_preescolar`
- `docente_aula_basica_primaria`
- `docente_aula_secundaria_media`
- `docente_orientador`

La base normativa/pedagógica común se comparte. Los mapas de perfil añaden únicamente lo diferencial.

## Relación con preguntas

Las preguntas viven en su banco correspondiente. Para V4:

```text
content/question-bank-v4/items/
```

Una fuente puede sostener muchos reactivos y un reactivo puede relacionarse con varias fuentes. La arquitectura normalizada futura para Supabase se documenta en:

`docs/03-architecture/question-bank-knowledge-targeting-architecture.md`

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
- snapshots históricos de auditoría V4.
