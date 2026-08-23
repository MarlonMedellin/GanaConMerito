# Auditoría de ingesta CNSC — Docentes y Directivos Docentes 2026

**Corte:** 2026-08-22  
**Origen auditado:** PR #99 `research(knowledge): CNSC docentes 2026 intake`  
**Rama limpia:** `cnsc-docentes-2026-verified-intake-20260822`  
**Base:** HEAD vigente de PR #97 al iniciar este bloque.

## Regla de trabajo

Esta auditoría no modifica la taxonomía V4, perfiles canónicos, OPEC canónicas ni reactivos congelados. Separa evidencia oficial comprobada de inferencias y de datos que requieren verificación adicional.

## 1. Hechos verificados directamente en fuente oficial CNSC

Fuente: página oficial CNSC de proyectos de acuerdos y anexos de nuevos procesos de selección.

- Existe una sección oficial `Docentes y Directivos Docentes 2026`.
- Estado publicado: **Publicación en página web para observaciones**.
- La ventana informada para observaciones va desde las 00:00 del 19 de agosto de 2026 hasta las 23:59 del 25 de agosto de 2026.
- La CNSC declara habilitada la recepción de observaciones al proyecto de Acuerdo y su Anexo Técnico.
- La CNSC declara visible para consulta una **OPEC preliminar** del proceso en SIMO.
- La publicación oficial y la noticia CNSC del 19 de agosto califican estos documentos como proyectos previos a quedar en firme.

**Consecuencia:** la identidad, estado provisional y ventana de observaciones pueden registrarse como verificadas. Ningún dato extraído de estos proyectos debe tratarse todavía como regla definitiva del proceso.

## 2. Contenido útil del PR #99 que se conserva como candidato, no como verdad verificada

Los siguientes archivos contienen líneas de investigación potencialmente valiosas, pero no se promueven en este bloque porque dependen de verificación directa de los documentos profundos CNSC o de SIMO:

- `proyecto-acuerdo-medellin-2026.md`;
- `proyecto-anexo-tecnico-2026.md`;
- `blueprint-cnsc-2026.md`;
- `preliminary-offer-snapshots.json`.

Pueden recuperarse posteriormente por fragmentos, siempre que cada afirmación relevante quede anclada a una fuente oficial y localizador preciso.

## 3. Correcciones obligatorias frente al PR #99

### 3.1 No revertir metadatos ya verificados

El diff de PR #99 reemplaza por `null` o elimina metadatos oficiales que la rama arquitectónica ya había verificado para:

- Decreto 1075 de 2015;
- Ley 1098 de 2006.

Eso incluye emisor, fechas, URLs oficiales y alcance de verificación. La rama limpia conserva la versión vigente de PR #97 y no arrastra esa regresión.

### 3.2 No rediseñar perfiles

`docentes-cnsc-2026-findings.md` recomienda separar `rector_director_rural` y crear jerarquías/perfiles por disciplina. Esa recomendación contradice el freeze vigente.

Semántica obligatoria:

`perfil reusable → positionName oficial → OPEC concreta`

Los seis perfiles canónicos se mantienen. Diferencias de cargo o disciplina se estudian mediante `positionName` y evidencia de OPEC, sin crear perfiles nuevos en esta etapa.

### 3.3 No crear una arquitectura de linaje OPEC en este bloque

La hipótesis de equivalencias o sucesión de números OPEC puede ser relevante si un documento oficial la confirma, pero no autoriza nuevas tablas, enums o capas. Primero debe registrarse como conocimiento/evidencia; cualquier consecuencia arquitectónica queda fuera de alcance.

## 4. Clasificación del contenido de PR #99

### Sustentado oficialmente en este corte

- existencia del proceso Docentes y Directivos Docentes 2026;
- carácter de proyecto/publicación para observaciones;
- fechas 19–25 de agosto de 2026 para observaciones;
- existencia de OPEC preliminar consultable en SIMO;
- noticia CNSC que reporta más de 28.000 vacantes a nivel nacional como cifra preliminar del proceso.

### Inferencia razonable, pendiente de evidencia de detalle

- que el Anexo futuro servirá para derivar componentes de preparación y reglas de evaluación;
- que la OPEC permitirá precisar `positionName`, entidad, vacantes y aplicabilidad;
- que la futura Guía de Orientación/Ejes Temáticos, si se publica oficialmente, deberá refinar el blueprint sin sustituir normas o acuerdos.

### Hipótesis pendiente

- distribución exacta de componentes internos de la prueba;
- impacto de cada área disciplinar sobre futuros reactivos;
- linaje/equivalencia entre identificadores OPEC;
- reglas específicas por Rector, Director Rural, Coordinador, Docente de Aula y Docente Orientador que aún no se hayan verificado directamente.

### Dato no localizado/verificado directamente en este bloque

- números OPEC concretos;
- cifras territoriales y por `positionName` de Medellín, Antioquia y Bello;
- artículos, numerales, ponderaciones y puntajes mínimos atribuidos al proyecto de Acuerdo/Anexo;
- texto oficial profundo del Anexo Técnico y de los proyectos de Acuerdo utilizados en la ingesta original.

## 5. Fuentes pendientes prioritarias

1. Proyecto de Anexo Técnico CNSC 2026: acceso directo y localizadores verificables.
2. Proyecto de Acuerdo de Medellín: acceso directo, artículos y tablas verificables.
3. Proyectos de Acuerdo de Antioquia y Bello: acceso directo y tablas verificables.
4. SIMO: OPEC preliminar con identificadores reales y `positionName` oficiales, cuando sea públicamente accesible.
5. Resolución MEN 3842 de 2022: texto oficial y localizadores para funciones, requisitos y competencias.
6. Versión definitiva de Acuerdo/Anexo cuando quede adoptada.
7. Guía de Orientación/Ejes Temáticos cuando exista publicación oficial.

## 6. Conocimiento habilitado por este bloque

Ya puede afirmarse de manera trazable que GanaConMerito está siguiendo un **proceso 2026 todavía provisional**, con proyectos en observación y OPEC preliminar. Esto permite preparar la cola de investigación y el versionado de fuentes sin convertir borradores en verdad definitiva ni acoplar preguntas a una convocatoria no adoptada.

## 7. Huecos para futura construcción de preguntas

No se abre gap analysis con `temario-base.md` mientras siga `V4-ARCH-DEBT-021`.

Los huecos de conocimiento que pueden investigarse sin tocar reactivos son:

- marco normativo general del concurso docente;
- funciones/requisitos/competencias por empleo según fuente oficial;
- componentes/ejes oficiales de evaluación cuando queden verificados;
- conocimiento disciplinar asociado a `positionName` oficiales;
- reglas del proceso que sean pedagógicamente relevantes para preparación, separadas de material técnico/operativo.

Ninguno de estos huecos autoriza por sí mismo targeting canónico ni creación automática de reactivos.
